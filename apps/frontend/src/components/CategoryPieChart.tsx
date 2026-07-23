import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryBreakdown } from '@wallet-tree/shared';
import { Card } from './ui/Card';
import { EmptyState } from './EmptyState';
import { formatCurrency } from '../lib/format';

type Palette = 'expense' | 'income';

interface CategoryPieChartProps {
  title: string;
  data: CategoryBreakdown[];
  palette: Palette;
  className?: string;
}

interface PaletteEntry {
  hex: string;
}

const palettes: Record<Palette, PaletteEntry[]> = {
  expense: [
    { hex: '#ff6b00' },
    { hex: '#f5a623' },
    { hex: '#ff8a33' },
    { hex: '#d29922' },
    { hex: '#a371f7' },
    { hex: '#db6d28' },
    { hex: '#8b949e' },
  ],
  income: [
    { hex: '#3fb950' },
    { hex: '#58a6ff' },
    { hex: '#14b8a6' },
    { hex: '#22c55e' },
    { hex: '#0ea5e9' },
    { hex: '#3b82f6' },
    { hex: '#84cc16' },
  ],
};

function paletteEntry(palette: Palette, idx: number): PaletteEntry {
  const entries = palettes[palette];
  return entries[idx % entries.length] ?? entries[0]!;
}

export function CategoryPieChart({ title, data, palette, className = '' }: CategoryPieChartProps) {
  const isEmpty = data.length === 0;

  return (
    <Card className={`flex flex-col px-4 py-4 ${className}`}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-mute">{title}</p>
      {isEmpty ? (
        <EmptyState
          title="ยังไม่มีข้อมูลเดือนนี้"
          description="เพิ่มรายการเพื่อดูสัดส่วนตามหมวดหมู่"
          className="mt-4 flex-1"
        />
      ) : (
        <>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="90%"
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="#0d1117"
                  strokeWidth={2}
                  isAnimationActive={false}
                  label={false}
                  labelLine={false}
                >
                  {data.map((item, idx) => (
                    <Cell key={item.name} fill={paletteEntry(palette, idx).hex} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: 4,
                  }}
                  itemStyle={{ color: '#e6edf3' }}
                  labelStyle={{ color: '#8b949e' }}
                  formatter={(value: number, _name: string, item) => {
                    const payload = item.payload as CategoryBreakdown;
                    return [`${formatCurrency(value)} (${payload.percentage}%)`, payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 flex flex-col gap-1.5 text-[11px]">
            {data.map((item, idx) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: paletteEntry(palette, idx).hex }} />
                  <span className="truncate text-body">{item.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-body">
                  {formatCurrency(item.total)} · {item.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
