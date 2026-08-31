'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Tag, Store } from 'lucide-react';
import { saveCustomOption, deleteCustomOption } from '@/app/actions/custom-option-actions';

interface CategoryVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCustomCategories: string[];
  userCustomVendors: string[];
}

export default function CategoryVendorModal({
  isOpen,
  onClose,
  userCustomCategories = [],
  userCustomVendors = [],
}: CategoryVendorModalProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'vendor'>('category');
  const [newInput, setNewInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const customList = activeTab === 'category' ? userCustomCategories : userCustomVendors;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newInput.trim()) return;
    setLoading(true);
    await saveCustomOption(activeTab, newInput.trim());
    setLoading(false);
    setNewInput('');
  }

  async function handleDeleteCustom(optionValue: string) {
    if (!confirm(`SpendWise says: Delete custom ${activeTab} "${optionValue}"?`)) return;
    setLoading(true);
    await deleteCustomOption(activeTab, optionValue);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Manage Custom Options
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Add or remove your custom categories and vendors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'category' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Categories ({userCustomCategories.length})
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'vendor' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Vendors ({userCustomVendors.length})
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={`Add custom ${activeTab}...`}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
          />
          <button
            type="submit"
            disabled={loading || !newInput.trim()}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[220px]">
          {customList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No custom {activeTab}s added yet.</p>
          ) : (
            customList.map((item) => (
              <div
                key={item}
                className="flex justify-between items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleDeleteCustom(item)}
                  disabled={loading}
                  title="Delete option"
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}