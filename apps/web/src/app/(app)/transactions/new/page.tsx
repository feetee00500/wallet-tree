import { PageHeader } from '@/components/ui';
import { TransactionForm } from '@/features/transactions/transaction-form';

export default function AddTransactionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Quick entry"
        title="เพิ่มรายการ"
        description="บันทึกรายรับหรือรายจ่ายให้เสร็จในหน้าจอเดียว"
      />
      <TransactionForm />
    </div>
  );
}
