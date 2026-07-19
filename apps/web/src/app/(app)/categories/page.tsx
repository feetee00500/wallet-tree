'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Category } from '@wallet-tree/shared';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { TrashIcon } from '@/components/icons';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/components/ui';
import {
  createCategory,
  deleteCategory,
  getCategories,
} from '@/lib/client/finance';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [message, setMessage] = useState('');

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => getCategories(signal),
  });
  const create = useMutation({
    mutationFn: () =>
      createCategory({
        key: `${type}-${nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || Date.now()}`,
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim(),
        type,
      }),
    onSuccess: async () => {
      setNameTh('');
      setNameEn('');
      setMessage('สร้างหมวดหมู่แล้ว');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => setMessage('สร้างหมวดหมู่ไม่สำเร็จ'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (nameTh.trim() && nameEn.trim() && !create.isPending) create.mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger / classification"
        title="หมวดหมู่"
        description="จัดกลุ่มรายการเพื่อให้การวิเคราะห์รายเดือนมีความหมาย"
      />

      <section className="panel p-4 sm:p-5">
        <h2 className="font-medium">สร้างหมวดหมู่</h2>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[160px_1fr_1fr_auto]">
          <select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="control px-3 text-sm">
            <option value="expense">รายจ่าย</option>
            <option value="income">รายรับ</option>
          </select>
          <input
            value={nameTh}
            onChange={(event) => setNameTh(event.target.value)}
            placeholder="ชื่อภาษาไทย"
            maxLength={100}
            required
            className="control px-3 text-sm"
            aria-label="ชื่อหมวดหมู่ภาษาไทย"
          />
          <input
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            placeholder="English name"
            maxLength={100}
            required
            className="control px-3 text-sm"
            aria-label="ชื่อหมวดหมู่ภาษาอังกฤษ"
          />
          <button type="submit" disabled={create.isPending} className="control bg-foreground px-5 text-sm font-medium text-canvas">
            {create.isPending ? 'กำลังสร้าง…' : 'สร้าง'}
          </button>
        </form>
        <p aria-live="polite" className="mt-3 min-h-5 text-xs text-subtle">{message}</p>
      </section>

      {categories.isPending && <LoadingSkeleton rows={6} />}
      {categories.isError && <ErrorState onRetry={() => categories.refetch()} />}
      {categories.data?.length === 0 && (
        <EmptyState title="ยังไม่มีหมวดหมู่" description="สร้างหมวดรายรับและรายจ่ายก่อนเพิ่มรายการ" />
      )}

      {categories.data && categories.data.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {(['expense', 'income'] as const).map((group) => {
            const items = categories.data.filter((category) => category.type === group);
            return (
              <section key={group} className="panel overflow-hidden">
                <header className="border-b border-line/50 px-4 py-4 sm:px-5">
                  <h2 className="font-medium">{group === 'expense' ? 'หมวดรายจ่าย' : 'หมวดรายรับ'}</h2>
                  <p className="mt-1 text-xs text-subtle">{items.length} หมวดหมู่</p>
                </header>
                {items.length === 0 ? (
                  <p className="p-5 text-sm text-subtle">ยังไม่มีหมวดในกลุ่มนี้</p>
                ) : (
                  items.map((category) => (
                    <div key={category._id} className="flex min-h-14 items-center gap-3 border-b border-line/55 px-4 last:border-0 sm:px-5">
                      <span className={`size-2 rounded-full ${group === 'income' ? 'bg-income' : 'bg-expense'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{category.nameTh}</p>
                        <p className="truncate text-xs text-subtle">{category.nameEn}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(category)}
                        className="grid size-11 place-items-center rounded-md text-subtle hover:bg-expense/10 hover:text-expense"
                        aria-label={`ลบหมวดหมู่ ${category.nameTh}`}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="ลบหมวดหมู่นี้?"
        description={`หมวด “${pendingDelete?.nameTh ?? ''}” จะถูกลบ รายการเดิมจะยังเก็บชื่อหมวดที่บันทึกไว้`}
        confirmLabel="ลบหมวดหมู่"
        busy={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete._id)}
      />
    </div>
  );
}
