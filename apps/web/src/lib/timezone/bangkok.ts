const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getBangkokMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1) - BANGKOK_OFFSET_MS);
  const nextStart = new Date(Date.UTC(year, month, 1) - BANGKOK_OFFSET_MS);
  return {
    start,
    end: new Date(nextStart.getTime() - 1),
  };
}

export function getBangkokDayOfMonth(date: Date): number {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS).getUTCDate();
}

export function getCurrentBangkokMonth(date = new Date()) {
  const bangkok = new Date(date.getTime() + BANGKOK_OFFSET_MS);
  return {
    year: bangkok.getUTCFullYear(),
    month: bangkok.getUTCMonth() + 1,
  };
}

export function getBangkokDateKey(date = new Date()): string {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}
