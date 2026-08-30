'use client';

import { Expense } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PaymentMethodBarChartProps {
  expenses: Expense[];
}

const METHOD_COLORS: Record<string, string> = {
  Online: '#0284c7', // Sky 600
  Offline: '#10b981', // Emerald 500
};

export default function PaymentMethodBarChart({ expenses }: PaymentMethodBarChartProps) {
  const methodTotals: Record<string, number> = {
    Online: 0,
    Offline: 0,
  };

  expenses.forEach((e) => {
    const method = e.payment_method || 'Online';
    methodTotals[method] = (methodTotals[method] || 0) + Number(e.amount);
  });

  const data = Object.entries(methodTotals).map(([method, total]) => ({
    method,
    amount: Number(total.toFixed(2)),
  }));

  const hasData = expenses.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
        <h3 className="text-base font-bold text-slate-800 mb-2">Spending by Payment Method</h3>
        <p className="text-sm text-slate-400">No expenses recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-slate-800 mb-4">Spending by Payment Method</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="method"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Spent']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={METHOD_COLORS[entry.method] || '#0284c7'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
