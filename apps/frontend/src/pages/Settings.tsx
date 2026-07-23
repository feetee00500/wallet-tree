import { PageHeader } from '../components/PageHeader';
import { LogOutIcon } from '../components/icons';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 animate-[fadeIn_200ms_ease-out]">
      <PageHeader title="ตั้งค่า" subtitle="บัญชี LINE และการเชื่อมต่อ" />
      <Card className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-mute">บัญชีของฉัน</p>
        <p className="mt-1 text-[13px] text-body">บัญชีนี้ยืนยันตัวตนและเชื่อมกับ LINE โดยตรง</p>
        <div className="mt-5 flex items-center gap-4">
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-soft text-base font-semibold text-cyan-deep">
              {user?.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{user?.name}</p>
            <Badge tone="success">LINE connected</Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} className="gap-2">
            <LogOutIcon className="h-4 w-4" /> ออกจากระบบ
          </Button>
        </div>
      </Card>
      <Card className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-mute">ความปลอดภัย</p>
        <p className="mt-2 text-[13px] leading-6 text-body">
          ผู้ใช้ทั่วไปไม่มีรหัสผ่านในระบบ Wallet Tree การเข้าสู่ระบบทั้งหมดดำเนินการผ่าน LINE OAuth
        </p>
      </Card>
    </div>
  );
}
