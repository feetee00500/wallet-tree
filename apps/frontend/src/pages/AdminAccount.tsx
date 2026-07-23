import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function AdminAccount() {
  const { user } = useAuth();
  const fields = [
    ['ชื่อ', user?.name],
    ['Username', user?.username],
    ['Provider', user?.authProvider],
    ['Role', user?.role],
    ['สร้างเมื่อ', user?.createdAt ? new Date(user.createdAt).toLocaleString('th-TH') : null],
  ];

  return (
    <div className="flex flex-col gap-4 animate-[fadeIn_200ms_ease-out]">
      <PageHeader title="บัญชี Admin" subtitle="ข้อมูลผู้ดูแลระบบที่กำลังเข้าสู่ระบบ" />
      <Card className="max-w-2xl p-5">
        <dl className="grid grid-cols-[minmax(100px,auto)_1fr] gap-x-6 gap-y-4 text-[13px]">
          {fields.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="break-all text-zinc-100">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
