'use client';

import { useState } from 'react';
import { X, Plus, Trash2, EyeOff, Eye, Tag, Store, AlertCircle } from 'lucide-react';
import { saveCustomOption, deleteCustomOption, hideDefaultOption } from '@/app/actions/custom-option-actions';

export const DEFAULT_CATEGORIES = [
  'Grocery',
  'Utilities',
  'Rent',
  'Dining Out',
  'Transportation',
  'Clothing',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others',
];

export const DEFAULT_VENDORS = [
  'Amazon',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'Uber',
  'Ola',
  'D-Mart',
  'Supermarket',
  'Electricity Board',
];

interface CategoryVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCustomCategories: string[];
  userCustomVendors: string[];
  hiddenCategories: string[];
  hiddenVendors: string[];
}

export default function CategoryVendorModal({
  isOpen,
  onClose,
  userCustomCategories = [],
  userCustomVendors = [],
  hiddenCategories = [],
  hiddenVendors = [],
}: CategoryVendorModalProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'vendor'>('category');
  const [newInput, setNewInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCategory = activeTab === 'category';
  const defaultList = isCategory ? DEFAULT_CATEGORIES : DEFAULT_VENDORS;
  const customList = isCategory ? userCustomCategories : userCustomVendors;
  const hiddenList = isCategory ? hiddenCategories : hiddenVendors;

  const activeDefaults = defaultList.filter((item) => !hiddenList.includes(item));
  const hiddenDefaults = defaultList.filter((item) => hiddenList.includes(item));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newInput.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await saveCustomOption(activeTab, newInput.trim());
    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setNewInput('');
    }
  }

  async function handleDeleteCustom(optionValue: string) {
    if (!confirm(`SpendWise says: Remove custom ${activeTab} "${optionValue}"?`)) return;
    setLoading(true);
    await deleteCustomOption(activeTab, optionValue);
    setLoading(false);
  }

  async function handleHideDefault(optionValue: string) {
    setLoading(true);
    await hideDefaultOption(activeTab, optionValue);
    setLoading(false);
  }

  async function handleUnhideDefault(optionValue: string) {
    setLoading(true);
    await deleteCustomOption(activeTab, optionValue);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Manage Categories & Vendors
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Customize your dropdown lists and remove unwanted options.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl my-4">
          <button
            onClick={() => {
              setActiveTab('category');
              setNewInput('');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Categories ({activeDefaults.length + customList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('vendor');
              setNewInput('');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'vendor'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Vendors ({activeDefaults.length + customList.length})
          </button>
        </div>

        {/* Add input form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={`Add new custom ${activeTab} name...`}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-medium outline-none text-slate-800"
          />
          <button
            type="submit"
            disabled={loading || !newInput.trim()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Custom Options */}
          {customList.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 mb-2">
                Your Custom {activeTab === 'category' ? 'Categories' : 'Vendors'}
              </h4>
              <div className="space-y-1.5">
                {customList.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center px-3 py-2 bg-sky-50/60 border border-sky-100 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleDeleteCustom(item)}
                      disabled={loading}
                      title="Delete custom option"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Standard Defaults */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Standard {activeTab === 'category' ? 'Categories' : 'Vendors'}
            </h4>
            <div className="space-y-1.5">
              {activeDefaults.map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleHideDefault(item)}
                    disabled={loading}
                    title="Remove/Hide standard option from dropdowns"
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-slate-200"
                  >
                    <EyeOff className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Defaults */}
          {hiddenDefaults.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hidden / Removed {activeTab === 'category' ? 'Categories' : 'Vendors'}
              </h4>
              <div className="space-y-1.5">
                {hiddenDefaults.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center px-3 py-2 bg-slate-100/50 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-400 line-through"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleUnhideDefault(item)}
                      disabled={loading}
                      title="Restore to dropdown list"
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition border border-sky-200"
                    >
                      <Eye className="w-3 h-3" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}