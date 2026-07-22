import { Category } from '@wallet-tree/database';
import { CategoryResponse, TransactionType } from '@wallet-tree/shared';

export function toCategoryResponse(c: Category): CategoryResponse {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon,
    type: c.type as TransactionType,
    userId: c.userId,
    createdAt: c.createdAt,
  };
}
