import { useEffect, useState } from 'react';
import type { AdminUserResponse } from '@wallet-tree/shared';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../lib/api';

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<AdminUserResponse[]>('/api/admin/users')
      .then((data) => active && setUsers(data))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'โหลดผู้ใช้งานไม่สำเร็จ'));
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="ผู้ใช้งาน" subtitle="บัญชีล่าสุดสูงสุด 100 รายการ โดยไม่แสดงข้อมูลลับ" />
      {error ? <ErrorState message={error} /> : null}
      {!users && !error ? <LoadingState variant="table" /> : null}
      {users ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-zinc-700 bg-zinc-900 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              <tr><th className="px-4 py-3">ผู้ใช้งาน</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3">สร้างเมื่อ</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-3"><p className="font-medium text-zinc-100">{user.name}</p><p className="mt-0.5 font-mono text-[10px] text-zinc-500">{user.username || user.id}</p></td>
                  <td className="px-4 py-3 text-zinc-400">{user.authProvider}</td>
                  <td className="px-4 py-3 text-zinc-400">{user.role}</td>
                  <td className="px-4 py-3"><Badge tone={user.status === 'ACTIVE' ? 'income' : 'neutral'}>{user.status}</Badge></td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(user.createdAt).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? <p className="p-8 text-center text-sm text-zinc-500">ยังไม่มีผู้ใช้งาน</p> : null}
        </Card>
      ) : null}
    </div>
  );
}
