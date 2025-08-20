export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

function getDateOfISOWeek(week: number): Date {
  // Jan 4th is always in week 1 (ISO standard)
  const year = new Date().getFullYear();
  const simple = new Date(year, 0, 4);
  const dayOfWeek = simple.getDay() || 7; // Sunday = 0 → 7
  const isoWeekStart = new Date(simple);
  isoWeekStart.setDate(simple.getDate() + (week - 1) * 7 - (dayOfWeek - 1));
  return isoWeekStart; // Monday of that week
}

export function getMonthFromWeek(week: number): number {
  const firstDay = getDateOfISOWeek(week);
  return firstDay.getMonth() + 1; // getMonth is 0-based
}
