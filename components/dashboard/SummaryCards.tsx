import { Expense } from '@/types';
import { IndianRupee, CreditCard, Tag, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalCount = expenses.length;
  const avgExpense = totalCount > 0 ? totalSpent / totalCount : 0;

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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
          <IndianRupee className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Spent (Month)
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Transactions Count */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Transactions
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalCount}</p>
        </div>
      </div>

      {/* Top Category */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Top Category
          </p>
          <p className="text-xl font-bold text-slate-800 mt-0.5 truncate max-w-[140px]">
            {topCategory}
          </p>
        </div>
      </div>

      {/* Average Expense */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average / Expense
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">
            ₹{avgExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
