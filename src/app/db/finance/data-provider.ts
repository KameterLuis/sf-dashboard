"use server"

import { DatevTransactionType, FiatType, Network, PrismaClient } from '@prisma/client';
import { DateRange } from 'react-day-picker';

const prisma = new PrismaClient();

const TAX_RATE = 0.3; // Example constant – adjust as needed

export type TimeFilter = {
  from?: string | Date;
  to?: string | Date;
  network?: Network;
};

//
// Utility to build Prisma date filter
//
function buildDateRange(range: DateRange) {
  return {
    gte: range.from,
    lte: range.to,
  };
}

//
// TAX ESTIMATE
//
export async function getTaxEstimate(range: DateRange) {
  const revenueSum = await prisma.datevTransaction.aggregate({
    where: {
      type: DatevTransactionType.REVENUE,
      timestamp: buildDateRange(range),
    },
    _sum: { amount: true },
  });

  const tax = Number(revenueSum._sum.amount ?? 0) * TAX_RATE;
  return Number(tax.toFixed(2));
}

//
// PORTFOLIO VALUE (sum of latest balances)
//
export async function getPortfolioValue(range: DateRange) {
  const balances = await prisma.tresBalance.findMany({
    where: { timestamp: buildDateRange(range) },
    orderBy: { timestamp: 'desc' },
    distinct: ['ticker'],
  });

  const total = balances.reduce((acc, b) => acc + Number(b.fiatBalance), 0);
  return Number(total.toFixed(2));
}

//
// NETWORK HOLDINGS (sum of balances filtered by network/ticker)
//
export async function getNetworkHoldings(range: DateRange, network: Network) {
  const balances = await prisma.tresBalance.findMany({
    where: {
      timestamp: buildDateRange(range),
      network,
    },
    orderBy: { timestamp: 'desc' },
  });

  const latest = balances[0];
  return latest ? Number(latest.fiatBalance.toFixed(2)) : 0;
}

//
// CASH CHART VALUES (time-series of account balances)
//

export async function getCashChartValues(
  range: DateRange,
  targetFiat: FiatType = FiatType.EURO,
) {
  const usdToEur = 0.86;
  const eurToUsd = 1 / usdToEur;

  // Fetch raw series (already daily in your DB; no clamping, no enumeration)
  const [account, fw] = await Promise.all([
    prisma.accountBalance.findMany({
      where: { timestamp: { gte: range.from, lte: range.to }, fiatType: FiatType.EURO }, // or buildDateRange(range)
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, amount: true },
    }),
    prisma.fwBalance.findMany({
      where: { timestamp: { gte: range.from, lte: range.to }, fiatType: FiatType.DOLLAR },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, amount: true },
    }),
  ]);

  // Convert FW to EUR immediately
  const acc = account.map(a => ({ t: a.timestamp, eur: Number(a.amount) }));
  const fwEur = fw.map(f => ({ t: f.timestamp, eur: Number(f.amount) * usdToEur }));

  // Merge on the union of timestamps, forward-fill last known values
  const out: { date: number; cash: number }[] = [];
  let i = 0, j = 0;
  let lastAcc = 0;
  let lastFw = 0;

  while (i < acc.length || j < fwEur.length) {
    const tA = i < acc.length ? acc[i].t : null;
    const tF = j < fwEur.length ? fwEur[j].t : null;

    let t: Date;

    if (tA && (!tF || tA < tF)) {
      lastAcc = acc[i].eur;
      t = tA;
      i++;
    } else if (tF && (!tA || tF < tA)) {
      lastFw = fwEur[j].eur;
      t = tF;
      j++;
    } else {
      // same timestamp
      t = tA as Date; // both defined
      lastAcc = acc[i].eur;
      lastFw = fwEur[j].eur;
      i++; j++;
    }

    const sumEur = lastAcc + lastFw;
    const value = targetFiat === FiatType.EURO ? sumEur : sumEur * eurToUsd;

    out.push({ date: new Date(t).getTime(), cash: value });
  }

  return out;
}

//
// REVENUE BY NETWORK (grouping revenue transactions by ticker)
//
export async function getRevenueByNetwork(range: DateRange) {
  const grouped = await prisma.tresTransaction.groupBy({
    by: ['ticker'],
    where: {
      timestamp: buildDateRange(range),
      type: { equals: 'OPERATIONS' }, // or REVENUE depending on schema meaning
    },
    _sum: {
      fiatAmount: true,
    },
  });

  return grouped.map((g) => ({
    ticker: g.ticker,
    value: Number(g._sum.fiatAmount ?? 0),
  }));
}

//
// REVENUE BY TYPE (grouping Datev transactions by type)
//
export async function getRevenueByType(range: DateRange) {
  const grouped = await prisma.datevTransaction.groupBy({
    by: ['type'],
    where: { timestamp: buildDateRange(range) },
    _sum: { amount: true },
  });

  return grouped.map((g) => ({
    type: g.type,
    value: Number(g._sum.amount ?? 0),
  }));
}
