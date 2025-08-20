import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { writeFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import path from "path";
import { FiatType, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";

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
      const amount = new Decimal(r.Betrag.replace(",", ".")); // convert "123,45" → 123.45
      const saldo = r["Saldo nach Buchung"]
        ? new Decimal(r["Saldo nach Buchung"].replace(",", "."))
        : amount;

      return {
        timestamp: timestamp,
        amount: amount, // convert "123,45" → 123.45
        fiatType: FiatType.EURO,
        hash: generateTransactionHash({ timestamp, amount, saldo }),
      };
    });

  const balances = records
    .filter((r) => r["Saldo nach Buchung"])
    .map((r) => ({
      timestamp: parseGermanDate(r.Buchungstag || r.Valutadatum || ""),
      amount: new Decimal(r["Saldo nach Buchung"].replace(",", ".")),
      fiatType: FiatType.EURO,
    }));

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
