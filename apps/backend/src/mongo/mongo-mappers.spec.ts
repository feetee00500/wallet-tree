import {
  AuthProvider,
  ObjectId,
  toCategory,
  toTransaction,
  toUser,
  TransactionSource,
  TransactionType,
  UserRole,
} from '@wallet-tree/database';

describe('MongoDB legacy compatibility mappers', () => {
  it('maps a legacy LINE user document', () => {
    const id = new ObjectId();
    const user = toUser({
      _id: id,
      lineUserId: 'U123',
      displayName: 'สมชาย',
      authProvider: 'line',
      role: 'user',
      status: 'active',
    });

    expect(user).toMatchObject({
      id: id.toHexString(),
      name: 'สมชาย',
      authProvider: AuthProvider.LINE,
      role: UserRole.USER,
    });
  });

  it('maps legacy Thai category fields and lowercase type', () => {
    const category = toCategory({
      _id: new ObjectId(),
      nameTh: 'อาหาร',
      nameEn: 'Food',
      icon: '🍚',
      type: 'expense',
      userId: null,
    });

    expect(category.name).toBe('อาหาร');
    expect(category.type).toBe(TransactionType.EXPENSE);
  });

  it('uses transactionDate and legacy note/source fields', () => {
    const transactionDate = new Date('2026-04-15T10:00:00.000Z');
    const transaction = toTransaction({
      _id: new ObjectId(),
      amount: 65,
      type: 'expense',
      note: 'กาแฟ',
      source: 'line',
      userId: 'user-1',
      categoryId: 'category-1',
      transactionDate,
    });

    expect(transaction).toMatchObject({
      amount: 65,
      type: TransactionType.EXPENSE,
      description: 'กาแฟ',
      source: TransactionSource.LINE,
      createdAt: transactionDate,
    });
  });
});
