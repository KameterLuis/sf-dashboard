import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { AccountType, FiatType, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import { parse } from "csv-parse/sync";
import { writeFile } from "fs/promises";
import path from "path";

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
  const [day, month, year] = dateStr.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

async function saveCsvToDatabase(records: any[]) {
  const transactions = records
    .filter((r) => r.Betrag) // skip rows without amount
    .map((r) => {
      const timestamp = parseGermanDate(r.Buchungstag || r.Valutadatum || "");
      const amountNum = r.Betrag.replace(",", ".");
      const amount = new Decimal(amountNum); // convert "123,45" → 123.45
      const saldoNum = r["Saldo nach Buchung"]
        ? r["Saldo nach Buchung"].replace(",", ".")
        : amount;

      return {
        timestamp: timestamp,
        amount: amount, // convert "123,45" → 123.45
        fiatType: FiatType.EURO,
        accountType: AccountType.REGULAR,
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
        fiatType: FiatType.EURO,
        accountType: AccountType.REGULAR,
        hash: generateTransactionHash({ timestamp, amount: amountNum, saldo: saldoNum }),
      };
    });

  // bulk insert
  await prisma.accountTransaction.createMany({
    data: transactions,
    skipDuplicates: true,
  });
  await prisma.accountBalance.createMany({
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
      `uploads/${currentYear}/weekly/kw${calendarWeek}/bank`
    );

    // Save the file
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const csvText = buffer.toString("utf-8");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";",
    });

    await saveCsvToDatabase(records);

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
