import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { kontoTable, lookupTable } from "@/lib/lookup";
import {
  AccountType,
  AssetSymbol,
  FiatType,
  PrismaClient,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

function generateTransactionHash(transaction: {
  timestamp: Date;
  amount: string | number;
  fiatBalance: string | number;
}) {
  const str = `${transaction.timestamp.toISOString()}|${transaction.amount}|${
    transaction.fiatBalance
  }`;
  return crypto.createHash("sha256").update(str).digest("hex");
}

function parseGermanDate(dateStr: string): Date {
  console.log(dateStr);
  const [day, month, year] = dateStr.split(" ")[2].split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

async function saveXLSXToDatabase(records: any[], recordDate: Date) {
  const balances = records
    .filter((r) => r.konto in kontoTable)
    .map((r) => {
      let amount = r.value;

      const umsatzKonten = [
        "440000",
        "469000",
        "483000",
        "484700",
        "494600",
        "494700",
        "702000",
        "493200",
        "497200",
      ];

      if (!umsatzKonten.includes(r.konto)) {
        amount = -amount;
      }

      let type = kontoTable[r.konto];

      return {
        timestamp: recordDate,
        amount: Decimal(amount),
        type: type,
        hash: generateTransactionHash({
          timestamp: recordDate,
          amount: amount,
          fiatBalance: type,
        }),
      };
    });

  await prisma.datevTransaction.createMany({
    data: balances,
    skipDuplicates: true,
  });
}

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ message: "No file uploaded" }), {
        status: 400,
      });
    }

    // Convert file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads folder exists
    await ensureFolders();

    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();

    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const currentMonth = months[month];

    const uploadDir = path.join(
      process.cwd(),
      `uploads/${currentYear}/monthly/${currentMonth}/datev`
    );

    // Save the file
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let records: any = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    const recordDate = parseGermanDate(records[0][1]);

    let filteredRecords: { konto: string | number; value: string | number }[] =
      [];

    records.forEach((row: any) =>
      filteredRecords.push({
        konto: row[2],
        value: row[6],
      })
    );

    filteredRecords = filteredRecords.slice(5);

    await saveXLSXToDatabase(filteredRecords, recordDate);

    return new Response(
      JSON.stringify({ message: "File uploaded successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("File upload error:", err);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
