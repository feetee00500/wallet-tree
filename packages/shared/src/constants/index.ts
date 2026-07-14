export const DEFAULT_CURRENCY = 'THB' as const;
export const DEFAULT_TIMEZONE = 'Asia/Bangkok' as const;
export const DEFAULT_LANGUAGE = 'th' as const;

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionSource {
  LINE = 'line',
  WEB = 'web',
}

export const EXPENSE_CATEGORIES = [
  { key: 'food', nameTh: 'อาหาร', nameEn: 'Food' },
  { key: 'transport', nameTh: 'เดินทาง', nameEn: 'Transport' },
  { key: 'shopping', nameTh: 'ช้อปปิ้ง', nameEn: 'Shopping' },
  { key: 'bills', nameTh: 'ค่าสาธารณูปโภค', nameEn: 'Bills' },
  { key: 'housing', nameTh: 'ที่อยู่อาศัย', nameEn: 'Housing' },
  { key: 'health', nameTh: 'สุขภาพ', nameEn: 'Health' },
  { key: 'education', nameTh: 'การศึกษา', nameEn: 'Education' },
  { key: 'entertainment', nameTh: 'บันเทิง', nameEn: 'Entertainment' },
  { key: 'travel', nameTh: 'ท่องเที่ยว', nameEn: 'Travel' },
  { key: 'family', nameTh: 'ครอบครัว', nameEn: 'Family' },
  { key: 'debt', nameTh: 'หนี้สิน', nameEn: 'Debt' },
  { key: 'other', nameTh: 'อื่นๆ', nameEn: 'Other' },
] as const;

export const INCOME_CATEGORIES = [
  { key: 'salary', nameTh: 'เงินเดือน', nameEn: 'Salary' },
  { key: 'bonus', nameTh: 'โบนัส', nameEn: 'Bonus' },
  { key: 'freelance', nameTh: 'ฟรีแลนซ์', nameEn: 'Freelance' },
  { key: 'business', nameTh: 'ธุรกิจ', nameEn: 'Business' },
  { key: 'investment', nameTh: 'ลงทุน', nameEn: 'Investment' },
  { key: 'gift', nameTh: 'ของขวัญ', nameEn: 'Gift' },
  { key: 'refund', nameTh: 'เงินคืน', nameEn: 'Refund' },
  { key: 'other', nameTh: 'อื่นๆ', nameEn: 'Other' },
] as const;
