'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExpenseForm from '@/components/dashboard/ExpenseForm';
import ExpenseList from '@/components/dashboard/ExpenseList';
import { Expense } from '@/types';
import { ReceiptText, ArrowLeft } from 'lucide-react';

interface TransactionsClientProps {
  allExpenses: Expense[];
  userCustomCategories: string[];
  userCustomVendors: string[];
  userCustomSpentForOptions: string[];
}

export default function TransactionsClient({
  allExpenses,
  userCustomCategories,
  userCustomVendors,
  userCustomSpentForOptions,
}: TransactionsClientProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  function handleEditClick(expense: Expense) {
    setEditingExpense(expense);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingExpense(null);
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Top Back Arrow */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-sky-100 mb-3 border border-white/15 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Expense Transactions</h1>
          <p className="text-sky-100 text-sm mt-1.5 max-w-xl">
            Add new transactions, edit existing logs, search, filter, and export your expense records to CSV.
          </p>
        </div>
      </div>

      {/* Add / Edit Expense Form */}
      <ExpenseForm
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
        userCustomCategories={userCustomCategories}
        userCustomVendors={userCustomVendors}
        userCustomSpentForOptions={userCustomSpentForOptions}
      />

      {/* Full Transactions List Table */}
      <ExpenseList
        expenses={allExpenses}
        onEditExpense={handleEditClick}
      />
    </div>
  );
}
