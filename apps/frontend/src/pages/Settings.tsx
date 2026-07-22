import { PageHeader } from '../components/PageHeader';
import { LogOutIcon } from '../components/icons';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-[fadeIn_300ms_ease-out]">
      <PageHeader title="ตั้งค่า" subtitle="บัญชี LINE และการเชื่อมต่อ" />
      <Card className="px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-100">บัญชีของฉัน</h2>
        <p className="mt-1 text-sm text-zinc-400">บัญชีนี้ยืนยันตัวตนและเชื่อมกับ LINE โดยตรง</p>
        <div className="mt-5 flex items-center gap-4">
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-xl font-semibold text-emerald-400">
              {user?.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-100">{user?.name}</p>
            <Badge tone="income">LINE connected</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOutIcon className="h-4 w-4" /> ออกจากระบบ
          </Button>
        </div>
      </Card>
      <Card className="px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="font-heading text-lg font-semibold text-zinc-100">ความปลอดภัย</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          ผู้ใช้ทั่วไปไม่มีรหัสผ่านในระบบ Wallet Tree การเข้าสู่ระบบทั้งหมดดำเนินการผ่าน LINE OAuth
        </p>
      </Card>
    </div>
  );
}
