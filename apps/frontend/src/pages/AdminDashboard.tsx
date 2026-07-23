import { useEffect, useState } from 'react';
import type { AdminOverviewResponse } from '@wallet-tree/shared';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../lib/api';

const metricLabels: Array<[keyof AdminOverviewResponse, string, string]> = [
  ['users', 'บัญชีทั้งหมด', 'ผู้ใช้และผู้ดูแลระบบ'],
  ['lineUsers', 'ผู้ใช้ LINE', 'บัญชีผู้ใช้ทั่วไป'],
  ['transactions', 'รายการทั้งหมด', 'ธุรกรรมในระบบ'],
  ['categories', 'หมวดหมู่', 'ค่าเริ่มต้นและของผู้ใช้'],
  ['recurringRules', 'รายการประจำ', 'กฎที่ผู้ใช้สร้าง'],
  ['budgets', 'งบประมาณ', 'งบประมาณที่บันทึก'],
];

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<AdminOverviewResponse>('/api/admin/overview')
      .then((data) => active && setOverview(data))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'โหลดข้อมูลไม่สำเร็จ'));
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-[fadeIn_200ms_ease-out]">
      <PageHeader title="ภาพรวมระบบ" subtitle="สถานะข้อมูลและการใช้งาน Wallet Tree" />
      {error ? <ErrorState message={error} /> : null}
      {!overview && !error ? <LoadingState variant="cards" /> : null}
      {overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metricLabels.map(([key, label, hint]) => (
              <Card key={key} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
                <p className="mt-2 text-[28px] font-bold tabular-nums text-zinc-100">{overview[key]}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>
              </Card>
            ))}
          </div>
          <Card className="flex flex-col gap-2 p-4 text-[11px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <span><strong className="text-emerald-400">ระบบพร้อมใช้งาน</strong> · Admin {overview.administrators} บัญชี</span>
            <span className="font-mono text-[10px] uppercase">อัปเดต {new Date(overview.generatedAt).toLocaleString('th-TH')}</span>
          </Card>
        </>
      ) : null}
    </div>
  );
}
