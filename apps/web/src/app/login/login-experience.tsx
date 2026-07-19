'use client';

import Link from 'next/link';
import React from 'react';
import { useEffect, useState } from 'react';
import { getLoginUrl } from '@/lib/client/auth';
import { initLiff } from '@/lib/client/liff';

const categories = [
  { label: 'อาหารและเครื่องดื่ม', amount: '฿4,820', width: '72%' },
  { label: 'การเดินทาง', amount: '฿2,460', width: '48%' },
  { label: 'บ้านและค่าใช้จ่าย', amount: '฿1,940', width: '36%' },
];

export function LoginExperience({ adminEnabled }: { adminEnabled: boolean }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void initLiff();
  }, []);

  function continueWithLine() {
    setLoading(true);
    window.location.assign(getLoginUrl());
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="ledger-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.2fr_0.8fr]">
        <section className="flex flex-col px-5 pb-8 pt-6 sm:px-10 lg:px-16 lg:py-12">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-accent/50 bg-accent/10 font-mono text-xs font-semibold text-accent">
              W
            </span>
            <div>
              <p className="font-semibold tracking-tight">Wallet Tree</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle">
                Finance console
              </p>
            </div>
          </div>

          <div className="max-w-3xl py-8 lg:my-auto lg:py-16">
            <p className="technical-label mb-4 text-accent">
              Personal ledger / THB
            </p>
            <div
              className="panel hidden max-w-2xl overflow-hidden lg:block"
              aria-label="ตัวอย่างหน้าสรุปทางการเงิน ไม่ใช่ข้อมูลจริงของผู้ใช้"
            >
              <div className="flex items-center justify-between border-b border-line/50 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent" />
                  <div>
                    <p className="font-mono text-[10px] text-accent">wallet.monthly</p>
                    <p className="mt-0.5 text-xs text-subtle">มิถุนายน 2026 · ตัวอย่างข้อมูล</p>
                  </div>
                </div>
                <span className="rounded border border-line/70 bg-elevated px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-subtle">
                  Preview
                </span>
              </div>
              <div className="grid gap-px bg-line/40 sm:grid-cols-3">
                {[
                  ['เงินคงเหลือ', '฿18,420', 'text-foreground'],
                  ['รายรับ', '฿42,000', 'text-income'],
                  ['รายจ่าย', '฿23,580', 'text-expense'],
                ].map(([label, value, color]) => (
                  <div key={label} className="bg-surface p-4 sm:p-5">
                    <p className="technical-label text-subtle">{label}</p>
                    <p className={`money mt-2 text-xl font-semibold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 p-4 sm:grid-cols-[1fr_0.9fr] sm:p-5">
                <div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-subtle">กระแสเงินสด 30 วัน</p>
                      <p className="money mt-1 text-lg font-medium">+ ฿18,420</p>
                    </div>
                    <span className="text-xs text-income">ออมได้ 43.8%</span>
                  </div>
                  <svg viewBox="0 0 360 108" className="mt-4 w-full" role="img" aria-label="กราฟตัวอย่างกระแสเงินสดเป็นบวก">
                    <defs>
                      <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="rgb(167 139 250)" stopOpacity=".24" />
                        <stop offset="1" stopColor="rgb(167 139 250)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 86C26 82 37 61 62 67s37 16 59 2 34-43 59-30 41 29 66 17 35-30 57-23 34 4 57-18v93H0Z" fill="url(#preview-fill)" />
                    <path d="M0 86C26 82 37 61 62 67s37 16 59 2 34-43 59-30 41 29 66 17 35-30 57-23 34 4 57-18" fill="none" stroke="rgb(167 139 250)" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-subtle">หมวดรายจ่ายสูงสุด</p>
                  <div className="mt-4 space-y-4">
                    {categories.map((category) => (
                      <div key={category.label}>
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="truncate">{category.label}</span>
                          <span className="money text-subtle">{category.amount}</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-accent" style={{ width: category.width }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center border-t border-line/70 bg-surface px-5 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <p className="technical-label text-accent">
              Authentication / LINE
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              เข้าถึงบัญชีการเงินของคุณ
            </h1>
            <p className="mt-3 text-sm leading-6 text-subtle">
              เชื่อมต่อ LINE เพื่อบันทึกรายการ ตรวจสอบกระแสเงินสด
              และดูข้อมูลที่แยกตามบัญชีของคุณ
            </p>
            <button
              type="button"
              onClick={continueWithLine}
              disabled={loading}
              className="control mt-8 flex w-full items-center justify-center gap-3 border-accent bg-accent px-5 font-semibold text-black hover:bg-accent/90"
              aria-describedby="line-login-note"
            >
              <span className="grid h-6 min-w-9 place-items-center rounded-sm border border-black/15 bg-black/10 font-mono text-[9px] font-bold" aria-hidden="true">
                LINE
              </span>
              {loading ? 'กำลังเชื่อมต่อ LINE…' : 'ดำเนินการต่อด้วย LINE'}
            </button>
            <p id="line-login-note" aria-live="polite" className="mt-3 text-center text-xs text-subtle">
              {loading
                ? 'กำลังนำคุณไปยัง LINE เพื่อยืนยันตัวตน'
                : 'ข้อมูลของคุณจะเชื่อมกับบัญชีส่วนตัวเท่านั้น'}
            </p>

            <div className="mt-8 grid grid-cols-3 divide-x divide-line/60 border-y border-line/60 py-4 text-center">
              {[
                ['Private', 'ข้อมูลแยกตามผู้ใช้'],
                ['THB', 'คำนวณเป็นเงินบาท'],
                ['LINE', 'เข้าใช้ได้รวดเร็ว'],
              ].map(([value, label]) => (
                <div key={value}>
                  <p className="font-mono text-[10px] font-semibold text-accent">{value}</p>
                  <p className="mt-1 text-[10px] leading-4 text-subtle">{label}</p>
                </div>
              ))}
            </div>

            {adminEnabled && (
              <Link
                href="/admin/login"
                className="mt-6 inline-flex min-h-11 items-center text-sm text-subtle hover:text-foreground"
              >
                Maintenance Admin
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
