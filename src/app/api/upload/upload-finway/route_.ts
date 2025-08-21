import { getWeekNumber } from "@/lib/date-helper";
import { ensureFolders } from "@/lib/ensure-folders";
import { FiatType, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import { parse } from "csv-parse/sync";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

function generateTransactionHash(transaction: {
  timestamp: Date;
  amount: string | number;
  unique: string | number;
}) {
  const str = `${transaction.timestamp.toISOString()}|${transaction.amount}|${transaction.unique}`;
  return crypto.createHash("sha256").update(str).digest("hex");
}

function parseGermanDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

async function saveCsvToDatabase(records: any[]) {

  console.log(records);

  const transactions = records
    .map((r) => {
      const timestamp = parseGermanDate(r.TransactionDate || "");
      const debit = r.Debit;
      const credit = r.Credit;
      const amountNum = debit || credit;
      const amount = new Decimal(amountNum);

      const unique = r.ExpenseNumber;

      return {
        timestamp: timestamp,
        amount: amount,
        fiatType: FiatType.DOLLAR,
        hash: generateTransactionHash({ timestamp, amount: amountNum, unique }),
      };
    });

  const previousBalance = await prisma.fwBalance.findMany({
    orderBy: { timestamp: 'desc' },
  });

  const latest = previousBalance[0];

  console.log(latest);

  const previousBalanceNum = latest ? Number(latest.amount.toFixed(2)) : 0;

  let prev = previousBalanceNum;

  const balances = transactions.map((t, i) => {

    if(!prev) {
      prev = 30_646.65;
    }

    console.log(prev);
    console.log(Number(t.amount));

    let amount = prev + Number(t.amount);

    prev = amount;

    return {
        timestamp: t.timestamp,
        amount: Decimal(amount),
        fiatType: FiatType.DOLLAR,
        hash: generateTransactionHash({ timestamp: t.timestamp, amount: Number(t.amount), unique: t.hash }),
      };
  });

  await prisma.fwTransaction.createMany({
    data: transactions,
    skipDuplicates: true,
  });
  await prisma.fwBalance.createMany({
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
      `uploads/${currentYear}/weekly/kw${calendarWeek}/finway`
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
