import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { AccountType, FiatType, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

function generateTransactionHash(transaction: {
  timestamp: Date;
  amount: string | number;
  saldo: string | number;
}) {
  const str = `${transaction.timestamp.toISOString()}|${transaction.amount}|${
    transaction.saldo
  }`;
  return crypto.createHash("sha256").update(str).digest("hex");
}

function parseGermanDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

async function saveXLSXToDatabase(records: any[]) {
  const transactions = records
    .map((r) => {
      const timestamp = parseGermanDate(r.Timestamp || "");
      const amountNum = r.Betrag.replace(",", ".");
      const amount = new Decimal(amountNum); // convert "123,45" → 123.45
      const saldoNum = r["Saldo nach Buchung"]
        ? r["Saldo nach Buchung"].replace(",", ".")
        : amount;

      return {
        timestamp: timestamp,
        amount: amount, 
        fiatType: FiatType.DOLLAR,
        accountType: AccountType.FOREIGN,
        hash: generateTransactionHash({ timestamp, amount: amountNum, saldo: saldoNum }),
      };
    });

  const balances = records
    .filter((r) => r["Saldo nach Buchung"])
    .map((r) => {

      const timestamp = parseGermanDate(r.Buchungstag || r.Valutadatum || "");
      const amountNum = r.Betrag.replace(",", ".");
      const amount = new Decimal(amountNum); // convert "123,45" → 123.45
      const saldoNum = r["Saldo nach Buchung"]
        ? r["Saldo nach Buchung"].replace(",", ".")
        : amount;
      const saldo = new Decimal(saldoNum);

      return {
        timestamp: timestamp,
        amount: saldo,
        fiatType: FiatType.DOLLAR,
        accountType: AccountType.FOREIGN,
        hash: generateTransactionHash({ timestamp, amount: amountNum, saldo: saldoNum }),
      };
    });

  // bulk insert
  await prisma.tresTransaction.createMany({
    data: transactions,
    skipDuplicates: true,
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

    console.log(records);

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
