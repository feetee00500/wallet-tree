import type { DailyTotal, SummaryResponse } from '@wallet-tree/shared';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Card } from './ui/Card';
import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from './icons';
import { formatCurrency } from '../lib/format';

interface BalanceHeroProps {
  summary: SummaryResponse;
  prevSummary: SummaryResponse | null;
  month: number;
  year: number;
}

interface DeltaInfo {
  percent: number;
  isPositive: boolean;
}

interface SparkPoint {
  day: number;
  balance: number;
}

function computeDelta(current: number, previous: number): DeltaInfo | null {
  if (previous === 0) {
    if (current === 0) return null;
    return { percent: 100, isPositive: current > 0 };
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return { percent: Math.abs(change), isPositive: change >= 0 };
}

function buildSparkline(daily: DailyTotal[], month: number, year: number): SparkPoint[] {
  const now = new Date();
  const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;
  const lastDay = isCurrentMonth ? now.getDate() : daily.length;
  let cumulative = 0;
  const points: SparkPoint[] = [];
  for (let i = 0; i < daily.length && i < lastDay; i += 1) {
    const entry = daily[i]!;
    cumulative += entry.income - entry.expense;
    points.push({ day: i + 1, balance: cumulative });
  }
  return points;
}

function hasMeaningfulMovement(points: SparkPoint[]): boolean {
  if (points.length < 2) return false;
  const min = Math.min(...points.map((p) => p.balance));
  const max = Math.max(...points.map((p) => p.balance));
  return max - min > 0;
}

function SparkTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SparkPoint }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-[4px] border border-hairline bg-canvas/95 px-2.5 py-1.5 text-xs shadow-lg">
      <p className="text-mute">วันที่ {point.day}</p>
      <p className="font-semibold tabular-nums text-cyan-deep">{formatCurrency(point.balance)}</p>
    </div>
  );
}

export function BalanceHero({ summary, prevSummary, month, year }: BalanceHeroProps) {
  const delta = prevSummary ? computeDelta(summary.balance, prevSummary.balance) : null;
  const savingsRate =
    summary.totalIncome > 0
      ? Math.max(0, Math.min(100, (summary.balance / summary.totalIncome) * 100))
      : 0;
  const sparkline = buildSparkline(summary.dailyTotals, month, year);
  const showSparkline = hasMeaningfulMovement(sparkline);

  return (
    <Card className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_minmax(0,260px)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-cyan-soft/30 text-cyan-deep ring-1 ring-cyan-deep/20">
              <WalletIcon className="h-3.5 w-3.5" />
            </span>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-mute">
              กระแสเงินสดเดือนนี้
            </p>
          </div>

          <p className="mt-2 font-mono text-[28px] font-bold tabular-nums text-cyan-deep sm:text-[32px]">
            {formatCurrency(summary.balance)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {delta ? (
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  delta.isPositive ? 'text-cyan-deep' : 'text-error-deep'
                }`}
              >
                {delta.isPositive ? (
                  <TrendingUpIcon className="h-4 w-4" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4" />
                )}
                {delta.percent.toFixed(1)}% เทียบเดือนก่อน
              </span>
            ) : (
              <span className="text-xs text-mute">ไม่มีข้อมูลเดือนก่อน</span>
            )}
            <span className="text-mute">·</span>
            <span className="text-mute">
              อัตราเก็บออม{' '}
              <span className="font-semibold text-ink tabular-nums">
                {savingsRate.toFixed(1)}%
              </span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniMetric
              label="รายรับ"
              amount={summary.totalIncome}
              tone="income"
              icon={<TrendingUpIcon className="h-4 w-4" />}
            />
            <MiniMetric
              label="รายจ่าย"
              amount={summary.totalExpense}
              tone="expense"
              icon={<TrendingDownIcon className="h-4 w-4" />}
            />
          </div>
        </div>

        {showSparkline ? (
          <SparklinePanel points={sparkline} />
        ) : (
          <div className="hidden h-full min-h-[140px] flex-col items-center justify-center rounded-[6px] border border-dashed border-hairline bg-canvas-soft/40 px-4 py-6 text-center sm:flex">
            <p className="text-xs font-medium uppercase tracking-wide text-mute">
              ยอดสะสมรายวัน
            </p>
            <p className="mt-2 text-xs text-mute">
              เพิ่มรายการเพื่อดูแนวโน้ม
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function SparklinePanel({ points }: { points: SparkPoint[] }) {
  const start = points[0]?.balance ?? 0;
  const end = points[points.length - 1]?.balance ?? 0;
  const peak = points.reduce((max, p) => (p.balance > max.balance ? p : max), points[0]!);
  const trough = points.reduce((min, p) => (p.balance < min.balance ? p : min), points[0]!);

  return (
    <div className="flex h-full min-h-[140px] flex-col gap-2 rounded-[6px] border border-hairline bg-canvas-soft/50 px-3 py-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-mute">
          ยอดสะสมรายวัน
        </p>
        <p className="text-[11px] tabular-nums text-mute">
          วันที่ {points[0]?.day ?? 1}–{points[points.length - 1]?.day ?? 1}
        </p>
      </div>
      <div className="relative w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip
              cursor={{ stroke: '#30363d', strokeDasharray: '3 3' }}
              content={<SparkTooltip />}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#58a6ff"
              strokeWidth={2}
              fill="url(#balanceSpark)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-baseline justify-between text-[11px] tabular-nums">
        <span className="text-mute">
          เริ่ม <span className="text-body">{formatCurrency(start)}</span>
        </span>
        <span className={end >= start ? 'text-cyan-deep' : 'text-error-deep'}>
          ล่าสุด {formatCurrency(end)}
        </span>
      </div>
      <p className="text-[11px] text-mute">
        สูงสุด {formatCurrency(peak.balance)} (วันที่ {peak.day})
        <span className="mx-1">·</span>
        ต่ำสุด {formatCurrency(trough.balance)} (วันที่ {trough.day})
      </p>
    </div>
  );
}

interface MiniMetricProps {
  label: string;
  amount: number;
  tone: 'income' | 'expense';
  icon: React.ReactNode;
}

function MiniMetric({ label, amount, tone, icon }: MiniMetricProps) {
  const toneClass = tone === 'income' ? 'text-cyan-deep' : 'text-error-deep';
  const ringClass =
    tone === 'income'
      ? 'bg-cyan-deep/10 ring-cyan-deep/20'
      : 'bg-warning/10 ring-warning/30';
  return (
    <div className="flex items-center gap-3 rounded-[6px] border border-hairline bg-canvas-soft/50 px-3 py-2.5">
      <span className={`flex h-7 w-7 items-center justify-center rounded-[4px] ring-1 ${ringClass} ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-mute">{label}</p>
        <p className={`text-[13px] font-semibold tabular-nums ${toneClass}`}>{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
