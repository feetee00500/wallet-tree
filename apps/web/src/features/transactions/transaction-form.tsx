'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '@wallet-tree/shared';
import {
  createTransaction,
  getCategories,
  updateTransaction,
} from '@/lib/client/finance';
import {
  bangkokDateTimeInput,
  satangFromInput,
  toIsoFromBangkokInput,
} from '@/lib/finance/format';

export function TransactionForm({
  transaction,
}: {
  transaction?: Transaction;
}) {
  const queryClient = useQueryClient();
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => getCategories(signal),
  });
  const [type, setType] = useState<'income' | 'expense'>(
    transaction?.type ?? 'expense'
  );
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount / 100) : ''
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [note, setNote] = useState(transaction?.note ?? '');
  const [transactionDate, setTransactionDate] = useState(
    transaction
      ? bangkokDateTimeInput(new Date(transaction.transactionDate))
      : bangkokDateTimeInput()
  );
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const availableCategories = useMemo(
    () => categories.data?.filter((category) => category.type === type) ?? [],
    [categories.data, type]
  );

  useEffect(() => {
    if (
      categoryId &&
      !availableCategories.some((category) => category._id === categoryId)
    ) {
      setCategoryId('');
    }
  }, [availableCategories, categoryId]);

  const save = useMutation<unknown, Error>({
    mutationFn: () => {
      const input = {
        type,
        amount: satangFromInput(amount),
        categoryId,
        description: description.trim(),
        note: note.trim() || undefined,
        transactionDate: toIsoFromBangkokInput(transactionDate),
      };
      return transaction
        ? updateTransaction(transaction._id, input)
        : createTransaction(input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['monthly-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-transactions'] }),
      ]);
      setError('');
      setSuccess(transaction ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มรายการเรียบร้อยแล้ว');
      if (!transaction) {
        setAmount('');
        setDescription('');
        setNote('');
      }
    },
    onError: () => {
      setSuccess('');
      setError('บันทึกรายการไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (satangFromInput(amount) <= 0 || !categoryId || !description.trim()) {
      setError('กรุณากรอกจำนวนเงิน หมวดหมู่ และรายละเอียดให้ครบ');
      return;
    }
    if (!save.isPending) save.mutate();
  }

  if (categories.isPending) {
    return <div className="panel h-80 animate-pulse bg-surface" role="status" aria-label="กำลังโหลดหมวดหมู่" />;
  }

  if (categories.isError) {
    return (
      <div className="panel p-5" role="alert">
        <p>ไม่สามารถโหลดหมวดหมู่ได้</p>
        <button type="button" onClick={() => categories.refetch()} className="control mt-4 px-4 text-sm">
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel overflow-hidden">
      <div className="border-b border-line/50 p-4 sm:p-5">
        <fieldset>
          <legend className="technical-label text-subtle">
            ประเภทรายการ
          </legend>
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-line/70 bg-canvas p-1">
            {([
              ['expense', 'รายจ่าย'],
              ['income', 'รายรับ'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                aria-pressed={type === value}
                className={`min-h-11 rounded-md text-sm font-medium duration-ui ease-ui ${
                  type === value
                    ? value === 'income'
                      ? 'bg-income text-black'
                      : 'bg-expense text-black'
                    : 'text-subtle hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
        <div className="sm:col-span-2">
          <label htmlFor="amount" className="text-sm font-medium">จำนวนเงิน</label>
          <div className="mt-2 flex items-center rounded-lg border border-line/70 bg-elevated px-4 focus-within:border-accent">
            <span className="text-xl text-subtle">฿</span>
            <input
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]{0,2}"
              placeholder="0.00"
              required
              className="money min-h-16 w-full bg-transparent px-3 text-3xl font-semibold outline-none placeholder:text-muted"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[100, 250, 500, 1000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className="min-h-9 rounded-md border border-line/60 px-3 text-xs text-subtle hover:bg-muted hover:text-foreground"
              >
                ฿{value.toLocaleString('th-TH')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-medium">หมวดหมู่</label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            className="control mt-2 w-full px-3 text-sm"
          >
            <option value="">เลือกหมวดหมู่</option>
            {availableCategories.map((category) => (
              <option key={category._id} value={category._id}>{category.nameTh}</option>
            ))}
          </select>
          {availableCategories.length === 0 && (
            <p className="mt-2 text-xs text-warning">
              ยังไม่มีหมวดประเภทนี้ · <Link href="/categories" className="underline">สร้างหมวดหมู่</Link>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="transactionDate" className="text-sm font-medium">วันที่และเวลา</label>
          <input
            id="transactionDate"
            type="datetime-local"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            required
            className="control mt-2 w-full px-3 text-sm [color-scheme:dark]"
          />
          <p className="mt-2 text-xs text-subtle">เวลา Asia/Bangkok</p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">รายละเอียด</label>
          <input
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={200}
            required
            placeholder="เช่น อาหารกลางวัน"
            className="control mt-2 w-full px-3 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="note" className="text-sm font-medium">
            โน้ต <span className="font-normal text-subtle">(ไม่บังคับ)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            className="control mt-2 w-full resize-y px-3 py-3 text-sm"
          />
        </div>
      </div>

      <div className="border-t border-line/50 p-4 sm:p-5">
        <div aria-live="polite" className="mb-3 min-h-5 text-sm">
          {error && <p className="text-expense">{error}</p>}
          {success && <p className="text-income">{success}</p>}
        </div>
        <button
          type="submit"
          disabled={save.isPending || availableCategories.length === 0}
          className="control w-full bg-foreground px-5 font-medium text-canvas"
        >
          {save.isPending ? 'กำลังบันทึก…' : transaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
        </button>
      </div>
    </form>
  );
}
