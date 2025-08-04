"use server"

import { prisma } from '@/lib/prisma';
import { CostCategory, Network, Prisma, RevenueSource } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { differenceInMilliseconds, endOfDay, format, startOfDay } from 'date-fns';
import { plainify } from './plainify';

export type TimeFilter = {
  from?: string | Date;
  to?: string | Date;
  network?: Network;                 // optional for many helpers
};

/*─────────────────── helpers ───────────────────*/

// Converts incoming ISO | Date into a Prisma filter
function buildDateRange({ from, to }: TimeFilter): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: new Date(from) }),
    ...(to   && { lte: new Date(to) }),
  };
}

const TAX_RATE = 0.25;

/*─────────────────── 1. Tax Estimate ───────────────────*/

export async function getTaxEstimate(filter: TimeFilter) {
  const revenueSum = await prisma.revenue.aggregate({
    where: {
      /*network: filter.network,*/
      at: buildDateRange(filter),
    },
    _sum: { valueEur: true },
  });

  const tax = Number(revenueSum._sum.valueEur ?? 0) * TAX_RATE;
  return Number(tax.toFixed(2));
}

/*─────────────────── 2. Cash time-series ───────────────────*/

export async function getCashSnapshots(filter: TimeFilter) {
  const rows = await prisma.cashSnapshot.findMany({
    where: { at: buildDateRange(filter) },
    orderBy: { at: 'asc' },
  });

  const mappedRows = rows.map(r => {
    return {
      date: format(r.at, "dd. MM."),
      cash: (r.totalEur as Decimal).toNumber()
    }
  })

  return mappedRows.map(plainify);
}

/*─────────────────── 3. EUR value of **all** coins at “to” ───────────────────*/

export async function getTotalPortfolioValue(at: string | Date) {
  const dayStart = startOfDay(at);
  const dayEnd   = endOfDay(dayStart);              // 23:59:59.999

  const { _sum } = await prisma.holdingSnapshot.aggregate({
    where: {
      at: { gte: dayStart, lte: dayEnd },           // ← BETWEEN
    },
    _sum: { valueEur: true },
  });

  return Number(_sum?.valueEur ?? 0);
}

/*─────────────────── 4. Holdings of ONE network at “to” ───────────────────*/

export async function getNetworkHoldings(at: string | Date, network: Network) {
  const rows = await prisma.holdingSnapshot.findMany({
    where: { network, at: { lte: at } },
    orderBy: [{ asset: 'asc' }, { at: 'desc' }],
    distinct: ['asset'],
  });

  return Number(rows[0].valueEur);
}

/*─────────────────── 5. Revenue **per network** in range ───────────────────*/

export async function getRevenueByNetwork(filter: TimeFilter) {
  const rows = await prisma.revenue.groupBy({
    by: ['network'],
    where: { at: buildDateRange(filter) },
    _sum: { valueEur: true },
  });
  return rows.map(r => ({ network: r.network, eur: Number(r._sum.valueEur ?? 0) }));
}

/*─────────────────── 6. Revenue **per source** at “to” ───────────────────*/

export async function getRevenueBySourceAt(
  at: string | Date,
  network?: Network,
) {
  const rows = await prisma.revenue.groupBy({
    by: ['source'],
    where: {
      at: {
        gte: startOfDay(new Date(at)),
        lte: endOfDay(new Date(at)),
      },
      ...(network && { network }),
    },
    _sum: { valueEur: true },
  });

  return rows.map(r => ({
    source: r.source as RevenueSource,
    eur: Number(r._sum.valueEur ?? 0),
  }));
}

/*─────────────────── 7. Revenue-types by source over range ───────────────────*/

export async function getRevenueBySourceRange(filter: TimeFilter) {
  const rows = await prisma.revenue.groupBy({
    by: ['source'],
    where: { at: buildDateRange(filter), network: filter.network },
    _sum: { valueEur: true },
  });
  return rows.map(r => ({
    source: r.source as RevenueSource,
    eur: Number(r._sum.valueEur ?? 0),
  }));
}

/*─────────────────── 8. Holdings of **all** networks at “to” ───────────────────*/

export async function getAllNetworkHoldings(at: string | Date) {
  const rows = await prisma.holdingSnapshot.groupBy({
    by: ['network'],
    where: { at: startOfDay(new Date(at)) },
    _sum: { valueEur: true },
  });
  return rows.map(r => ({ network: r.network, eur: Number(r._sum.valueEur ?? 0) }));
}

/*─────────────────── 9. Cash in/outflow sums by range ───────────────────*/

export async function getCashFlows(filter: TimeFilter) {
  const rows = await prisma.cashMovement.groupBy({
    by: ['direction'],
    where: { at: buildDateRange(filter) },
    _sum: { amountEur: true },
  });

  const inflow  = rows.find(r => r.direction === 'IN')?._sum.amountEur ?? 0;
  const outflow = rows.find(r => r.direction === 'OUT')?._sum.amountEur ?? 0;
  return { inflow: Number(inflow), outflow: Number(outflow) };
}

/*─────────────────── 10. Costs in range ───────────────────*/

export async function getCosts(filter: TimeFilter) {
  const rows = await prisma.cost.groupBy({
    by: ['category'],
    where: {
      at: buildDateRange(filter),   // ① dropped “network” – not in model
    },
    _sum: { amountEur: true },
  });

  return rows.map(r => ({
    category: r.category as CostCategory,
    eur: Number(r._sum?.amountEur ?? 0),   // ② guard for undefined
  }));
}

/*─────────────────── 11. Cash-flow statement (opening, in, out, closing) ───────────────────*/

export async function getCashflowStatement(filter: TimeFilter) {
  const fromDate = new Date(filter.from!);
  const toDate   = new Date(filter.to!);

  // 1. opening balance = latest snapshot *before* 'from'
  const opening = await prisma.cashSnapshot.findFirst({
    where: { at: { lt: fromDate } },
    orderBy: { at: 'desc' },
  });

  // 2. in / out totals inside range
  const flows  = await getCashFlows(filter);

  // 3. closing balance = latest snapshot ≤ 'to'
  const closing = await prisma.cashSnapshot.findFirst({
    where: { at: { lte: toDate } },
    orderBy: { at: 'desc' },
  });

  return {
    opening: Number(opening?.totalEur ?? 0),
    inflow:  flows.inflow,
    outflow: flows.outflow,
    closing: Number(closing?.totalEur ?? 0),
  };
}

/*─────────────────── 12. Revenue by source for amount of periods ───────────────────*/

const toNumber = (d: Decimal) => (d as Decimal).toNumber();

export async function getRevenueBySourceBuckets(
  filter: TimeFilter,
  numBuckets = 9
) {
  if (!filter.from || !filter.to)
    throw new Error('from and to must be provided');

  const from = new Date(filter.from);
  const to   = new Date(filter.to);

  const spanMs   = differenceInMilliseconds(to, from);
  const bucketMs = spanMs / numBuckets;

  // 1. fetch all rows in one query (small dataset in MVP)
  const rows = await prisma.revenue.findMany({
    where: {
      at: { gte: from, lte: to },
      ...(filter.network && { network: filter.network }),
    },
    select: { at: true, source: true, valueEur: true },
  });

  // 2. allocate to buckets
  const buckets: Record<
    number,
    Record<string, number>  // { [source]: eur }
  > = {};

  for (const r of rows) {
    const idx = Math.min(
      Math.floor((r.at.getTime() - from.getTime()) / bucketMs),
      numBuckets - 1 // clamp edge case when at === to
    );
    if (!buckets[idx]) buckets[idx] = {};
    const bySource = buckets[idx];
    bySource[r.source] = (bySource[r.source] ?? 0) + toNumber(r.valueEur);
  }

  // 3. normalise to an array ordered by bucket index
  const result = Array.from({ length: numBuckets }).map((_, i) => {
    const bucketStart = new Date(from.getTime() + i * bucketMs);
    return {
      bucket: format(bucketStart, "dd. MM."), // 'YYYY-MM-DD'
      ...(buckets[i] ?? {}), // spread revenue sums (may be empty bucket)
    };
  });

  return result;
}