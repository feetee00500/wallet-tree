import type { MonthlySummary } from '@wallet-tree/shared';

export function getDisciplineInsight(summary: MonthlySummary): string {
  if (summary.transactionCount === 0) {
    return 'เริ่มบันทึกรายการแรก เพื่อให้ Wallet Tree ช่วยสรุปพฤติกรรมการเงินของคุณ';
  }

  if (summary.income === 0 && summary.expenses > 0) {
    return 'เดือนนี้ยังไม่มีรายรับที่บันทึกไว้ ตรวจสอบข้อมูลเพื่อให้ยอดคงเหลือแม่นยำ';
  }

  const savingsRate =
    summary.income > 0
      ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
      : 0;
  if (savingsRate < 0) {
    return 'รายจ่ายสูงกว่ารายรับในเดือนนี้ ลองตรวจหมวดที่ใช้จ่ายสูงที่สุดก่อน';
  }
  if (savingsRate < 20) {
    return `อัตราเงินเหลืออยู่ที่ ${savingsRate}% ของรายรับ ลองลดหมวดรายจ่ายอันดับแรก`;
  }
  return `คุณรักษาเงินไว้ได้ ${savingsRate}% ของรายรับเดือนนี้ — อยู่ในทิศทางที่ดี`;
}

export function rankCategories(summary: MonthlySummary) {
  return [...summary.expenseByCategory].sort((a, b) => b.amount - a.amount);
}
