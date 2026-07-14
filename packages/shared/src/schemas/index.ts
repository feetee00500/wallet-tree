import { z } from 'zod';

export const amountInSatang = z.number().int().positive();

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: amountInSatang,
  categoryId: z.string().min(1),
  description: z.string().min(1).max(200),
  note: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const createCategorySchema = z.object({
  key: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const updateProfileSchema = z.object({
  preferredCurrency: z.string().length(3).optional(),
  timezone: z.string().min(1).optional(),
  language: z.string().length(2).optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['transactionDate', 'amount', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dailySummaryQuerySchema = z.object({
  date: z.string().optional(),
});

export const monthlySummaryQuerySchema = z.object({
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
