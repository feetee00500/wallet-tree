'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatSatang } from '@/lib/finance/format';

type Point = { day: number; income: number; expenses: number };

export function CashFlowChart({ data }: { data: Point[] }) {
  const active = data.filter((point) => point.income > 0 || point.expenses > 0);
  if (active.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-center text-sm text-subtle">
        ยังไม่มีข้อมูลเพียงพอสำหรับกราฟเดือนนี้
      </div>
    );
  }

  return (
    <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgb(63 63 70 / .4)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgb(161 161 170)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              width={58}
              tick={{ fill: 'rgb(161 161 170)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat('th-TH', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(Number(value) / 100)
              }
            />
            <Tooltip
              contentStyle={{
                background: 'rgb(24 24 27)',
                border: '1px solid rgb(63 63 70)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(day) => `วันที่ ${day}`}
              formatter={(value, name) => [
                formatSatang(Number(value)),
                name === 'income' ? 'รายรับ' : 'รายจ่าย',
              ]}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="rgb(74 222 128)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={180}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="rgb(248 113 113)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={180}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
}
