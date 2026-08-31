'use client';

import { Expense } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CategoryPieChartProps {
  expenses: Expense[];
}

const COLORS = [
  '#0284c7', // Sky 600
  '#f59e0b', // Amber 500
  '#8b5cf6', // Violet 500
  '#ef4444', // Red 500
  '#10b981', // Emerald 500
  '#ec4899', // Pink 500
  '#14b8a6', // Teal 500
  '#6366f1', // Indigo 500
  '#64748b', // Slate 500
];

export default function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
        <h3 className="text-base font-bold text-slate-800 mb-2">Spending by Category</h3>
        <p className="text-sm text-slate-400">No expense records found for this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-slate-800 mb-4">Spending by Category</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Amount']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
