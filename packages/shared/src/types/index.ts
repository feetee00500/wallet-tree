import { TransactionType, TransactionSource } from '../constants';

export interface UserProfile {
  _id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  preferredCurrency: string;
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  key: string;
  nameTh: string;
  nameEn: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  order: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  note?: string;
  transactionDate: string;
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  date: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  categories: { categoryName: string; amount: number; count: number }[];
  recentTransactions: Transaction[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  averageDailyExpense: number;
  highestExpense: number;
  expenseByCategory: { categoryName: string; amount: number; percentage: number }[];
  previousMonth: {
    income: number;
    expenses: number;
    net: number;
  } | null;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
