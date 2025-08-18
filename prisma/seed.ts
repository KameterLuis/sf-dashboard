import { DatevTransactionType, FiatType, Network, PrismaClient, Ticker, TresTransactionType } from '@prisma/client';

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function main() {
  console.log('🌱 Seeding database with daily data...');

  // --- Clear all tables first ---
  await prisma.datevTransaction.deleteMany();
  await prisma.fwBalance.deleteMany();
  await prisma.fwTransaction.deleteMany();
  await prisma.accountBalance.deleteMany();
  await prisma.accountTransaction.deleteMany();
  await prisma.tresTransaction.deleteMany();
  await prisma.tresBalance.deleteMany();

  // --- Generate data ---
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // go 3 months back

  const today = new Date();
  const days = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  console.log(`📅 Generating ${days} days of data from ${startDate.toDateString()} to ${today.toDateString()}`);

  let fwBalance = 5000;
  let accountBalance = 7500;
  let tresTokenBalance = 5;
  let tresFiatBalance = 75000;

  for (let i = 0; i <= days; i++) {
    const day = addDays(startDate, i);

    // --- Datev Transactions (Revenue + COGS daily) ---
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: 1000 + i * 15  * (Math.random() - 0.25), // growing revenue
        type: DatevTransactionType.REVENUE,
        fiatType: FiatType.EURO,
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: -200 - (i % 5) * 10 * (Math.random() + 0.5), // variable COGS
        type: DatevTransactionType.COGS,
        fiatType: FiatType.EURO,
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: 1000 + i * 10 * (Math.random() + 0.5), // growing revenue
        type: DatevTransactionType.OTHER_OPERATING_INCOME,
        fiatType: FiatType.EURO,
      },
    });
    await prisma.datevTransaction.create({
      data: {
        timestamp: day,
        amount: (i % 50) * Math.random() * 100, // variable COGS
        type: DatevTransactionType.OTHER,
        fiatType: FiatType.EURO,
      },
    });

    // --- FW Balance + Transaction ---
    fwBalance += Math.random() * 200 - 50; // slight variation
    await prisma.fwBalance.create({
      data: {
        timestamp: day,
        amount: fwBalance,
        fiatType: FiatType.EURO,
      },
    });
    await prisma.fwTransaction.create({
      data: {
        timestamp: day,
        amount: Math.random() * 400 - 100,
        fiatType: FiatType.EURO,
      },
    });

    // --- Account Balance + Transaction ---
    let accountTransaction = Math.random() * 5000 - 250; 
    accountBalance += accountTransaction;
    await prisma.accountBalance.create({
      data: {
        timestamp: day,
        amount: accountBalance,
        fiatType: FiatType.EURO,
      },
    });
    await prisma.accountTransaction.create({
      data: {
        timestamp: day,
        amount: accountTransaction,
        fiatType: FiatType.EURO,
      },
    });

    const networks: Network[] = ["solana", "ethereum", "chainlink", "celestia", "lido", "aptos", "sui"]
    const ticker: Ticker[] = ["SOL", "ETH", "LINK", "TIA", "LIDO", "APT", "SUI"];

    for(let j = 0; j < networks.length; j++) {

      const network_i = networks[j];
      const ticker_i = ticker[j];

      const tokenChange = Math.random() * 0.5 - 0.25;
      tresTokenBalance += tokenChange;
      tresFiatBalance += tokenChange * 30000;

      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: tokenChange,
          fiatAmount: tokenChange * 30000,
          network: Network[network_i],
          ticker: Ticker[ticker_i],
          type: TresTransactionType.OPERATIONS,
        },
      });

      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: tokenChange,
          fiatAmount: tokenChange * 30000,
          network: Network[network_i],
          ticker: Ticker[ticker_i],
          type: TresTransactionType.FEES,
        },
      });

      await prisma.tresTransaction.create({
        data: {
          timestamp: day,
          tokenAmount: tokenChange,
          fiatAmount: tokenChange * 30000,
          network: Network[network_i],
          ticker: Ticker[ticker_i],
          type: TresTransactionType.OTHER,
        },
      });

      await prisma.tresBalance.create({
        data: {
          timestamp: day,
          tokenBalance: tresTokenBalance,
          fiatBalance: tresFiatBalance,
          network: Network[network_i],
          ticker: Ticker[ticker_i],
        },
      });
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
