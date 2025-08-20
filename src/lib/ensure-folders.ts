import { mkdir } from "fs/promises";
import path from "path";

export const ensureFolders = async () => {
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const currentYear = new Date().getFullYear();
  const yearDir = path.join(uploadDir, currentYear.toString());
  await mkdir(yearDir, { recursive: true });

  const monthlyDir = path.join(yearDir, "monthly");
  await mkdir(monthlyDir, { recursive: true });

  const weeklyDir = path.join(yearDir, "weekly");
  await mkdir(weeklyDir, { recursive: true });

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

  const weeks = 55;

  for (let month in months) {
    const monthDir = path.join(monthlyDir, months[month]);
    await mkdir(monthDir, { recursive: true });

    const datevDir = path.join(monthDir, "datev");
    await mkdir(datevDir, { recursive: true });
  }

  for (let i = 0; i < weeks; i++) {
    const weekDir = path.join(weeklyDir, `kw${i}`);
    await mkdir(weekDir, { recursive: true });

    const bankDir = path.join(weekDir, "bank");
    await mkdir(bankDir, { recursive: true });

    const foreignDir = path.join(weekDir, "foreign");
    await mkdir(foreignDir, { recursive: true });

    const tresTransactionDir = path.join(weekDir, "tres-transaction");
    await mkdir(tresTransactionDir, { recursive: true });

    const tresBalanceDir = path.join(weekDir, "tres-balance");
    await mkdir(tresBalanceDir, { recursive: true });

    const finwayDir = path.join(weekDir, "finway");
    await mkdir(finwayDir, { recursive: true });
  }
};
