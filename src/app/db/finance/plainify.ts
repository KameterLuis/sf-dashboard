import { Decimal } from '@prisma/client/runtime/library';

export function plainify<T extends Record<string, any>>(row: T): T {
  return JSON.parse(
    JSON.stringify(row, (_, v) =>
      v instanceof Decimal ? v.toNumber() :      // Decimal ➜ number
      v instanceof Date    ? v.toISOString() :   // Date   ➜ ISO string
      v
    )
  );
}