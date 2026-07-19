'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, ErrorState, LoadingSkeleton } from '@/components/ui';
import { TransactionForm } from '@/features/transactions/transaction-form';
import { getTransaction } from '@/lib/client/finance';

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const transaction = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransaction(id),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Correction"
        title="แก้ไขรายการ"
        description="ตรวจสอบข้อมูลเดิมและบันทึกการเปลี่ยนแปลง"
      />
      {transaction.isPending && <LoadingSkeleton rows={5} />}
      {transaction.isError && <ErrorState message="ไม่พบหรือโหลดรายการนี้ไม่ได้" onRetry={() => transaction.refetch()} />}
      {transaction.data && <TransactionForm transaction={transaction.data} />}
    </div>
  );
}
