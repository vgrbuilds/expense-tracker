import { Expense } from '@/types';
import { formatINR } from '@/lib/utils';
import { IndianRupee, CreditCard, Tag, TrendingUp, Repeat } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalCount = expenses.length;
  const avgExpense = totalCount > 0 ? totalSpent / totalCount : 0;
  const recurringCount = expenses.filter((e) => e.is_recurring).length;

  // Calculate top category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  let topCategory = 'N/A';
  let maxSpent = 0;
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    if (amount > maxSpent) {
      maxSpent = amount;
      topCategory = cat;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spent */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-xs">
          <IndianRupee className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Spent
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
            {formatINR(totalSpent)}
          </p>
        </div>
      </div>

      {/* Transactions Count */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Transactions
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalCount}</p>
            {recurringCount > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Repeat className="w-3 h-3" /> {recurringCount} recurring
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Category */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Top Category
          </p>
          <p className="text-xl font-bold text-slate-900 mt-0.5 truncate max-w-[140px]" title={topCategory}>
            {topCategory}
          </p>
        </div>
      </div>

      {/* Average Expense */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average / Expense
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
            {formatINR(avgExpense)}
          </p>
        </div>
      </div>
    </div>
  );
}
