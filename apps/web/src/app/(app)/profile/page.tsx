'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorState, LoadingSkeleton, PageHeader } from '@/components/ui';
import { getProfile, updateProfile } from '@/lib/client/finance';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const [message, setMessage] = useState('');
  const save = useMutation({
    mutationFn: (input: { preferredCurrency: string; timezone: string; language: string }) =>
      updateProfile(input),
    onSuccess: async () => {
      setMessage('บันทึกการตั้งค่าแล้ว');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['session'] }),
      ]);
    },
    onError: () => setMessage('บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง'),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      preferredCurrency: String(form.get('preferredCurrency')),
      timezone: String(form.get('timezone')),
      language: String(form.get('language')),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account / preferences"
        title="บัญชีของฉัน"
        description="ข้อมูลบัญชี LINE และรูปแบบการแสดงผลทางการเงิน"
        action={
          <Link href="/settings" className="control inline-flex items-center px-4 text-sm">
            ความปลอดภัยและระบบ
          </Link>
        }
      />
      {profile.isPending && <LoadingSkeleton rows={5} />}
      {profile.isError && <ErrorState onRetry={() => profile.refetch()} />}
      {profile.data && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="panel p-5">
            <div className="flex items-center gap-4">
              {profile.data.pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.data.pictureUrl} alt="" className="size-16 rounded-xl object-cover" />
              ) : (
                <span className="grid size-16 place-items-center rounded-xl bg-muted text-xl font-semibold">
                  {profile.data.displayName.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{profile.data.displayName}</h2>
                <p className="mt-1 text-xs text-subtle">เชื่อมต่อผ่าน LINE</p>
              </div>
            </div>
            <dl className="mt-6 space-y-4 border-t border-line/50 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-subtle">สกุลเงิน</dt>
                <dd>{profile.data.preferredCurrency ?? 'THB'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-subtle">เขตเวลา</dt>
                <dd>{profile.data.timezone ?? 'Asia/Bangkok'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-subtle">ภาษา</dt>
                <dd>{profile.data.language === 'en' ? 'English' : 'ไทย'}</dd>
              </div>
            </dl>
          </section>

          <form onSubmit={submit} className="panel p-5">
            <h2 className="font-medium">รูปแบบการแสดงผล</h2>
            <p className="mt-1 text-xs text-subtle">ค่าปัจจุบันรองรับประเทศไทยเป็นหลัก</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm">
                <span className="font-medium">สกุลเงิน</span>
                <select
                  name="preferredCurrency"
                  defaultValue={profile.data.preferredCurrency ?? 'THB'}
                  className="control mt-2 w-full px-3"
                >
                  <option value="THB">THB — Thai Baht</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium">ภาษา</span>
                <select
                  name="language"
                  defaultValue={profile.data.language ?? 'th'}
                  className="control mt-2 w-full px-3"
                >
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-medium">เขตเวลา</span>
                <select
                  name="timezone"
                  defaultValue={profile.data.timezone ?? 'Asia/Bangkok'}
                  className="control mt-2 w-full px-3"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                </select>
              </label>
            </div>
            <p aria-live="polite" className="mt-5 min-h-5 text-sm text-subtle">{message}</p>
            <button
              type="submit"
              disabled={save.isPending}
              className="control mt-2 w-full bg-foreground px-5 font-medium text-canvas sm:w-auto"
            >
              {save.isPending ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
