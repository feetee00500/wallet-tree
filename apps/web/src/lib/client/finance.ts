import type {
  Category,
  MonthlySummary,
  PaginatedResponse,
  Transaction,
  UserProfile,
} from '@wallet-tree/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';

export type TransactionInput = {
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  note?: string;
  transactionDate: string;
};

export function getMonthlySummary(year: number, month: number) {
  return apiGet<MonthlySummary>(`/api/summaries/monthly?year=${year}&month=${month}`);
}

export function getTransactions(params: URLSearchParams, signal?: AbortSignal) {
  return apiGet<PaginatedResponse<Transaction>>(
    `/api/transactions?${params.toString()}`,
    signal
  );
}

export function getTransaction(id: string) {
  return apiGet<Transaction>(`/api/transactions/${id}`);
}

export function createTransaction(input: TransactionInput) {
  return apiPost<Transaction>('/api/transactions', input);
}

export function updateTransaction(id: string, input: Partial<TransactionInput>) {
  return apiPatch<{ message: string }>(`/api/transactions/${id}`, input);
}

export function deleteTransaction(id: string) {
  return apiDelete<void>(`/api/transactions/${id}`);
}

export function getCategories(signal?: AbortSignal) {
  return apiGet<Category[]>('/api/categories', signal);
}

export function createCategory(input: {
  key: string;
  nameTh: string;
  nameEn: string;
  type: 'income' | 'expense';
  order?: number;
}) {
  return apiPost<Category>('/api/categories', input);
}

export function updateCategory(id: string, input: Partial<Category>) {
  return apiPatch<{ message: string }>(`/api/categories/${id}`, input);
}

export function deleteCategory(id: string) {
  return apiDelete<void>(`/api/categories/${id}`);
}

export function getProfile() {
  return apiGet<UserProfile>('/api/profile');
}

export function updateProfile(input: {
  preferredCurrency?: string;
  timezone?: string;
  language?: string;
}) {
  return apiPatch<UserProfile>('/api/profile', input);
}
