import { AccountType, FiatType, PrismaClient } from "@prisma/client";
import { kontoTable } from "../src/lib/lookup";
const prisma = new PrismaClient();

const assetSymbols = [
  "SOL",
  "USDC",
  "ETH",
  "LDO",
  "USDT",
  "APT",
  "MNDE",
  "LINK",
  "TIA",
  "W",
  "STRD",
];

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

async function main() {
  const already = await prisma.datevTransaction.count();
  if (already > 0) {
    console.log("🌱 Seed skipped (data already present).");
    return;
  }

  console.log("🌱 Seeding...");
  await prisma.$transaction([
    prisma.datevTransaction.deleteMany(),
    prisma.fwBalance.deleteMany(),
    prisma.fwTransaction.deleteMany(),
    prisma.accountBalance.deleteMany(),
    prisma.accountTransaction.deleteMany(),
    prisma.tresTransaction.deleteMany(),
    prisma.tresBalance.deleteMany(),
  ]);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const today = new Date();
  const days = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

  let fwBalance = 5000;
  let accountBalance = 7500;
  let fAccountBalance = 2000;

  const tokenUsd = 30000;
  const startToken = 5;

  for (let i = 0; i <= days; i++) {
    const day = addDays(startDate, i);

    if (i % 29 == 0) {
      for (let j = 0; j < kontoTable; j++) {
        // Datev-like
        await prisma.datevTransaction.create({
          data: {
            timestamp: day,
            amount: 1000 + i * 15 * (Math.random() - 0.25),
            type: kontoTable[j],
            hash: String(Math.random()),
          },
        });
      }
    }

    // FW
    fwBalance += Math.random() * 200 - 50;
    await prisma.fwBalance.create({
      data: {
        timestamp: day,
        amount: fwBalance,
        fiatType: FiatType.DOLLAR,
        hash: Math.random(),
      },
    });
    await prisma.fwTransaction.create({
      data: {
        timestamp: day,
        amount: Math.random() * 400 - 100,
        fiatType: FiatType.DOLLAR,
        hash: Math.random(),
      },
    });

    // Account
    const accountTx = Math.random() * 5000 - 250;
    accountBalance += accountTx;
    await prisma.accountBalance.create({
      data: {
        timestamp: day,
        amount: accountBalance,
        fiatType: FiatType.EURO,
        accountType: AccountType.REGULAR,
        hash: Math.random(),
      },
    });
    await prisma.accountTransaction.create({
      data: {
        timestamp: day,
        amount: accountTx,
        fiatType: FiatType.EURO,
        accountType: AccountType.REGULAR,
        hash: Math.random(),
      },
    });

    // Foreign Account
    const fAccountTx = Math.random() * 5000 - 250;
    fAccountBalance += fAccountTx;
    await prisma.accountBalance.create({
      data: {
        timestamp: day,
        amount: fAccountBalance,
        fiatType: FiatType.DOLLAR,
        accountType: AccountType.FOREIGN,
        hash: Math.random(),
      },
    });
    await prisma.accountTransaction.create({
      data: {
        timestamp: day,
        amount: fAccountTx,
        fiatType: FiatType.DOLLAR,
        accountType: AccountType.FOREIGN,
        hash: Math.random(),
      },
    });

    // Tres across networks
    for (let j = 0; j < networks.length; j++) {
      const tokenChange = Math.random() * 0.5 - 0.25;
      const tokenBalance = startToken + tokenChange + i * 0.02;
      const fiatChange = tokenChange * tokenUsd;
      const fiatBalance = tokenBalance * tokenUsd;

      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: tokenChange,
          fiatAmount: fiatChange,
          project,
          subcategory,
          transactiontype,
          hash: String(Math.random()),
        },
      });

      await prisma.tresBalance.create({
        data: {
          timestamp: day,
          tokenBalance,
          fiatBalance,
          assetSymbol,
          hash: String(Math.random()),
        },
      });
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
