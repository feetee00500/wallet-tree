const thbWhole = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const thbDecimal = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const thaiDate = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  timeZone: 'Asia/Bangkok',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const thaiDateTime = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  timeZone: 'Asia/Bangkok',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const thaiMonth = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  timeZone: 'Asia/Bangkok',
  month: 'long',
  year: 'numeric',
});

export function formatSatang(amount: number, showDecimals = false): string {
  const baht = amount / 100;
  return (showDecimals || amount % 100 !== 0 ? thbDecimal : thbWhole).format(baht);
}

export function formatThaiDate(value: string | Date): string {
  return thaiDate.format(new Date(value));
}

export function formatThaiDateTime(value: string | Date): string {
  return thaiDateTime.format(new Date(value));
}

export function formatThaiMonth(year: number, month: number): string {
  return thaiMonth.format(new Date(Date.UTC(year, month - 1, 15, 12)));
}

export function satangFromInput(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function bangkokDateTimeInput(date = new Date()): string {
  const bangkok = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return bangkok.toISOString().slice(0, 16);
}

export function toIsoFromBangkokInput(value: string): string {
  return new Date(`${value}:00+07:00`).toISOString();
}

export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}
