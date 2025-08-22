import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { lookupTable } from "@/lib/lookup";
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
  const [year, month, day] = dateStr.split(" ")[0].split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

async function saveXLSXToDatabase(records: any[]) {
  const balances = records
    .filter((r) =>
      Object.values(AssetSymbol).includes(
        r["Asset Class Symbol"] as AssetSymbol
      )
    )
    .filter((r) => {
      if ("Balance State" in r) {
        return r["Balance State"] != "delegated_to_account";
      }
      return false;
    })
    .map((r) => {
      const timestamp = parseGermanDate(r.Timestamp || "");

      let amount;

      if (r["Historical Balance (T)"]) {
        amount = r["Historical Balance (T)"];
      } else {
        amount = r["Running Balance (T)"];
      }

      const assetSymbol = r["Asset Class Symbol"];

      let fiatAmount;

      if (r["Historical Balance Fiat Value ($)"]) {
        fiatAmount = r["Historical Balance Fiat Value ($)"];
      } else {
        fiatAmount = r["Running Balance Fiat Value ($)"];
      }

      return {
        timestamp: timestamp,
        tokenBalance: amount,
        fiatBalance: fiatAmount,
        assetSymbol: assetSymbol,
        hash: generateTransactionHash({
          timestamp,
          amount: amount,
          fiatBalance: fiatAmount,
        }),
      };
    });

  await prisma.tresBalance.createMany({
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
    const calendarWeek = getWeekNumber();

    const uploadDir = path.join(
      process.cwd(),
      `uploads/${currentYear}/weekly/kw${calendarWeek}/tres-balance`
    );

    // Save the file
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const records = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    await saveXLSXToDatabase(records);

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
