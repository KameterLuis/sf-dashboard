import { faker } from '@faker-js/faker';
import { CashDirection, CostCategory, Network, Prisma, PrismaClient, RevenueSource } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient({ log: ['error'] });

/** --- helpers ----------------------------------------------------------- */

const NETWORKS = [
  Network.solana,
  Network.ethereum,
  Network.lido,
  Network.sui,
  Network.aptos,
  Network.celestia,
] as const;

const ASSET_BY_NETWORK: Record<Network, string> = {
  solana:   'SOL',
  ethereum: 'ETH',
  lido:     'LDO',
  sui:      'SUI',
  aptos:    'APT',
  celestia: 'TIA',
  offchain: 'EUR', // not used here
};

const DAYS_BACK = 90;
const today = new Date();
const day0  = subDays(today, DAYS_BACK - 1); // oldest day included

function randomDateWithinLastDays(days: number) {
  return faker.date.between({ from: subDays(today, days), to: today });
}

function twoDec(min: number, max: number) {
  return Number(faker.finance.amount({ min, max }));
}

/** --- seeding ----------------------------------------------------------- */

async function seedRevenue() {
  const data = Array.from({ length: 1_000 }).map(() => {
    const network = faker.helpers.arrayElement(NETWORKS);
    const price   = twoDec(5, 250);                // fake asset price in EUR
    const amount  = Number(faker.finance.amount({ min: 0.1, max: 50 }));
    return {
      at:       randomDateWithinLastDays(DAYS_BACK),
      network,
      source:   faker.helpers.enumValue(RevenueSource),
      asset:    ASSET_BY_NETWORK[network],
      amount,
      valueEur: twoDec(amount * price * 0.95, amount * price * 1.05), // ±5 %
    };
  });

  await prisma.revenue.createMany({ data, skipDuplicates: true });
  console.log('✓ revenue');
}

async function seedHoldingSnapshots() {
  const snapshots: Prisma.HoldingSnapshotCreateManyInput[] = [];

  for (let i = 0; i < DAYS_BACK; i++) {
    const at = addDays(day0, i);
    for (const network of NETWORKS) {
      const balance = Number(faker.finance.amount({ min: 100, max: 10_000 }));
      const price   = twoDec(5, 250);
      snapshots.push({
        at,
        network,
        asset:     ASSET_BY_NETWORK[network],
        amount:    balance,
        priceEur:  price,
        valueEur:  Number((balance * price).toFixed(2)), // exact product
      });
    }
  }
  await prisma.holdingSnapshot.createMany({ data: snapshots, skipDuplicates: true });
  console.log('✓ holdings');
}

async function seedCashSnapshotsAndMovements() {
  const cashSnaps = [];
  const cashMoves = [];

  let runningBalance = 50_000; // EUR

  for (let i = 0; i < DAYS_BACK; i++) {
    const at = addDays(day0, i);

    // 3–5 random cash movements for that day
    const movementsToday = faker.number.int({ min: 3, max: 5 });
    for (let m = 0; m < movementsToday; m++) {
      const direction = faker.helpers.enumValue(CashDirection);
      const amount    = twoDec(500, 10_000);
      runningBalance += direction === 'IN' ? amount : -amount;

      cashMoves.push({
        at: faker.date.between({ from: at, to: addDays(at, 1) }),
        direction,
        amountEur: amount,
        memo: direction === 'IN' ? 'Client payment' : 'Provider bill',
      });
    }

    cashSnaps.push({
      at,
      totalEur: Number(runningBalance.toFixed(2)),
    });
  }

  await prisma.cashSnapshot.createMany({ data: cashSnaps, skipDuplicates: true });
  await prisma.cashMovement.createMany({ data: cashMoves, skipDuplicates: true });
  console.log('✓ cash snapshots & movements');
}

async function seedCosts() {
  const data = Array.from({ length: 300 }).map(() => ({
    at:        randomDateWithinLastDays(DAYS_BACK),
    category:  faker.helpers.enumValue(CostCategory),
    amountEur: twoDec(200, 5_000),
    memo:      faker.company.name(),
  }));
  await prisma.cost.createMany({ data, skipDuplicates: true });
  console.log('✓ costs');
}

/** --- orchestrate ------------------------------------------------------- */

async function main() {
  await Promise.all([
    seedRevenue(),
    seedHoldingSnapshots(),
    seedCashSnapshotsAndMovements(),
    seedCosts(),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());