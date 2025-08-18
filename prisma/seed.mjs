import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

  const networks = [
    "solana",
    "ethereum",
    "chainlink",
    "celestia",
    "lido",
    "aptos",
    "sui",
  ];
  const tickers = ["SOL", "ETH", "LINK", "TIA", "LIDO", "APT", "SUI"];
  const tokenUsd = 30000;
  const startToken = 5;

  for (let i = 0; i <= days; i++) {
    const day = addDays(startDate, i);

    // Datev-like
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: 1000 + i * 15 * (Math.random() - 0.25),
        type: "REVENUE",
        fiatType: "EURO",
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: -200 - (i % 5) * 10 * (Math.random() + 0.5),
        type: "COGS",
        fiatType: "EURO",
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: 1000 + i * 10 * (Math.random() + 0.5),
        type: "OTHER_OPERATING_INCOME",
        fiatType: "EURO",
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: (i % 50) * Math.random() * 100,
        type: "OTHER",
        fiatType: "EURO",
      },
    });

    // FW
    fwBalance += Math.random() * 200 - 50;
    await prisma.fwBalance.create({
      data: { timestamp: day, amount: fwBalance, fiatType: "EURO" },
    });
    await prisma.fwTransaction.create({
      data: {
        timestamp: day,
        amount: Math.random() * 400 - 100,
        fiatType: "EURO",
      },
    });

    // Account
    const accountTx = Math.random() * 5000 - 250;
    accountBalance += accountTx;
    await prisma.accountBalance.create({
      data: { timestamp: day, amount: accountBalance, fiatType: "EURO" },
    });
    await prisma.accountTransaction.create({
      data: { timestamp: day, amount: accountTx, fiatType: "EURO" },
    });

    // Tres across networks
    for (let j = 0; j < networks.length; j++) {
      const network = networks[j];
      const ticker = tickers[j];

      const tokenChange = Math.random() * 0.5 - 0.25;
      const tokenBalance = startToken + tokenChange + i * 0.02;
      const fiatChange = tokenChange * tokenUsd;
      const fiatBalance = tokenBalance * tokenUsd;

      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: tokenChange,
          fiatAmount: fiatChange,
          network,
          ticker,
          type: "OPERATIONS",
        },
      });
      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: Math.random() * 0.02,
          fiatAmount: Math.random() * 0.02 * tokenUsd,
          network,
          ticker,
          type: "FEES",
        },
      });
      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: Math.random() * 0.01,
          fiatAmount: Math.random() * 0.01 * tokenUsd,
          network,
          ticker,
          type: "OTHER",
        },
      });

      await prisma.tresBalance.create({
        data: { timestamp: day, tokenBalance, fiatBalance, network, ticker },
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
