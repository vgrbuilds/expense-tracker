'use client';

import { useState, useRef, useEffect } from 'react';
import { addExpense, updateExpense } from '@/app/actions/expense-actions';
import { PaymentMethod, Expense } from '@/types';
import { PlusCircle, Edit3, AlertCircle, CheckCircle2, X, ChevronDown, Tag, Store, User } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Grocery',
  'Utilities',
  'Rent',
  'Dining Out',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
];

const DEFAULT_SPENT_FOR = ['Self', 'Family', 'Home', 'Friend', 'Office'];

const PAYMENT_METHODS: PaymentMethod[] = ['Online', 'Offline'];

interface ExpenseFormProps {
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
  userCustomCategories?: string[];
  userCustomVendors?: string[];
  userCustomSpentForOptions?: string[];
}

export default function ExpenseForm({
  editingExpense,
  onCancelEdit,
  userCustomCategories = [],
  userCustomVendors = [],
  userCustomSpentForOptions = [],
}: ExpenseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Clean combined lists (NO inline custom option triggers)
  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...userCustomCategories]));
  const vendorOptions = Array.from(new Set(userCustomVendors));
  const spentForOptions = Array.from(new Set([...DEFAULT_SPENT_FOR, ...userCustomSpentForOptions]));

  // Compulsory Fields States
  const [selectedCategory, setSelectedCategory] = useState<string>('Grocery');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Optional Fields States
  const [description, setDescription] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [selectedSpentFor, setSelectedSpentFor] = useState<string>('Self');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online');
  const [isRecurring, setIsRecurring] = useState<boolean>(true); // Default is recurring

  // Populate form when editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setSelectedCategory(editingExpense.category || 'Grocery');
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setDescription(editingExpense.description || editingExpense.title || '');
      setSelectedVendor(editingExpense.vendor || '');
      setSelectedSpentFor(editingExpense.spent_for || 'Self');
      setPaymentMethod(editingExpense.payment_method || 'Online');
      setIsRecurring(editingExpense.is_recurring ?? true);
      setNotification(null);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  function resetForm() {
    setSelectedCategory('Grocery');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setSelectedVendor('');
    setSelectedSpentFor('Self');
    setPaymentMethod('Online');
    setIsRecurring(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('category', selectedCategory);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('description', description);
    formData.append('vendor', selectedVendor);
    formData.append('spent_for', selectedSpentFor || 'Self');
    formData.append('payment_method', paymentMethod);
    formData.append('is_recurring', isRecurring ? 'true' : 'false');

    let result;
    if (editingExpense) {
      result = await updateExpense(editingExpense.id, formData);
    } else {
      result = await addExpense(formData);
    }

    setLoading(false);

    if (result?.error) {
      setNotification({ type: 'error', text: result.error });
    } else {
      setNotification({
        type: 'success',
        text:
          result?.message ||
          (editingExpense
            ? 'SpendWise says: Expense updated successfully!'
            : 'SpendWise says: Expense saved successfully!'),
      });

      if (editingExpense && onCancelEdit) {
        setTimeout(() => {
          onCancelEdit();
        }, 800);
      } else {
        resetForm();
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/90 space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {editingExpense ? (
              <>
                <Edit3 className="w-5 h-5 text-amber-600" />
                Edit Expense Transaction
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-sky-600" />
                Add Expense Transaction
              </>
            )}
          </h2>
        </div>

        {editingExpense && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            <X className="w-4 h-4" /> Cancel Edit
          </button>
        )}
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* COMPULSORY FIELDS SECTION */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span> Compulsory Fields
            </span>
            <span className="text-[11px] text-slate-400 font-medium">* Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                Category <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-white font-medium shadow-2xs transition-all duration-200 hover:border-slate-400 cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (Rupees / ₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-white font-medium shadow-2xs transition-all duration-200 hover:border-slate-400"
              />
            </div>

            {/* 3. Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-white font-medium shadow-2xs transition-all duration-200 hover:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* OPTIONAL FIELDS SECTION */}
        <div className="p-4 rounded-2xl border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Optional Details
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Optional</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly wifi bill, Weekly grocery restock"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50 transition-all duration-200 hover:border-slate-400"
              />
            </div>

            {/* Spent For Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Spent For
              </label>

              <div className="relative">
                <select
                  value={selectedSpentFor}
                  onChange={(e) => setSelectedSpentFor(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50 font-medium shadow-2xs transition-all duration-200 hover:border-slate-400 cursor-pointer"
                >
                  {spentForOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Vendor Name Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                Vendor Name
              </label>

              <div className="relative">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50 font-medium shadow-2xs transition-all duration-200 hover:border-slate-400 cursor-pointer"
                >
                  <option value="">-- None / Select Vendor --</option>
                  {vendorOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Payment Method (Online / Offline) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50 font-medium shadow-2xs transition-all duration-200 hover:border-slate-400 cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Frequency (Recurring / One-time) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Expense Frequency
              </label>
              <div className="flex items-center gap-4 py-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="recurringRadio"
                    checked={isRecurring}
                    onChange={() => setIsRecurring(true)}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span>Recurring (Every Month)</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="recurringRadio"
                    checked={!isRecurring}
                    onChange={() => setIsRecurring(false)}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span>One-time</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-white font-medium rounded-xl transition shadow-sm hover:shadow-md text-sm disabled:opacity-50 flex items-center gap-2 ${
              editingExpense
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100'
            }`}
          >
            {loading
              ? editingExpense
                ? 'Updating Expense...'
                : 'Saving Expense...'
              : editingExpense
              ? 'Update Expense'
              : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
