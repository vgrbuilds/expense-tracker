'use client';

import { useState } from 'react';
import { updateProfile, updatePassword } from '@/app/actions/profile-actions';
import { saveCustomOption, deleteCustomOption } from '@/app/actions/custom-option-actions';
import { ReportFrequency } from '@/types';
import { User, KeyRound, Bell, Settings, X, CheckCircle2, AlertCircle, Plus, Trash2, Tag, Store } from 'lucide-react';

interface ProfileModalProps {
  currentName: string;
  currentEmail?: string;
  currentReportFrequency?: ReportFrequency;
  isOpen: boolean;
  onClose: () => void;
  userCustomCategories?: string[];
  userCustomVendors?: string[];
}

export default function ProfileModal({
  currentName,
  currentEmail = '',
  currentReportFrequency = 'Monthly',
  isOpen,
  onClose,
  userCustomCategories = [],
  userCustomVendors = [],
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'custom'>('profile');

  // Profile Form States
  const [fullName, setFullName] = useState(currentName);
  const [reportFrequency, setReportFrequency] = useState<ReportFrequency>(currentReportFrequency);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom Options Management State inside settings
  const [customTab, setCustomTab] = useState<'category' | 'vendor'>('category');
  const [customInput, setCustomInput] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  if (!isOpen) return null;

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('reportFrequency', reportFrequency);

    const result = await updateProfile(formData);
    setProfileLoading(false);

    if (result?.error) {
      setProfileMessage({ type: 'error', text: result.error });
    } else {
      setProfileMessage({ type: 'success', text: result?.message || 'SpendWise says: Profile updated!' });
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    const formData = new FormData();
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const result = await updatePassword(formData);
    setPasswordLoading(false);

    if (result?.error) {
      setPasswordMessage({ type: 'error', text: result.error });
    } else {
      setPasswordMessage({ type: 'success', text: result?.message || 'SpendWise says: Password updated!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  async function handleAddCustomOption(e: React.FormEvent) {
    e.preventDefault();
    if (!customInput.trim()) return;
    setCustomLoading(true);
    await saveCustomOption(customTab, customInput.trim());
    setCustomLoading(false);
    setCustomInput('');
  }

  async function handleDeleteCustomOption(val: string) {
    if (!confirm(`SpendWise says: Delete custom ${customTab} "${val}"?`)) return;
    setCustomLoading(true);
    await deleteCustomOption(customTab, val);
    setCustomLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center font-semibold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Account & Settings</h2>
              <p className="text-xs text-slate-400 font-medium">{currentEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile & Reports
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Password
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Custom Options
          </button>
        </div>

        {/* Tab 1: Profile & Report Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4 flex-1">
            {profileMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-sky-600" />
                Report Frequency Settings
              </label>
              <select
                value={reportFrequency}
                onChange={(e) => setReportFrequency(e.target.value as ReportFrequency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 font-medium bg-white"
              >
                <option value="Daily">Daily Summary Report Email</option>
                <option value="Weekly">Weekly Summary Report Email</option>
                <option value="Monthly">Monthly Summary Report Email (Default)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                SpendWise will automatically compile your expenses and send financial reports according to your preference.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {profileLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 flex-1">
            {passwordMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 font-medium"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Custom Categories & Vendors */}
        {activeTab === 'custom' && (
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCustomTab('category')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  customTab === 'category' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Tag className="w-3 h-3" /> Categories ({userCustomCategories.length})
              </button>
              <button
                onClick={() => setCustomTab('vendor')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  customTab === 'vendor' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Store className="w-3 h-3" /> Vendors ({userCustomVendors.length})
              </button>
            </div>

            <form onSubmit={handleAddCustomOption} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`Add custom ${customTab} name...`}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none"
              />
              <button
                type="submit"
                disabled={customLoading || !customInput.trim()}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[220px]">
              {(customTab === 'category' ? userCustomCategories : userCustomVendors).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No custom {customTab}s added yet.
                </p>
              ) : (
                (customTab === 'category' ? userCustomCategories : userCustomVendors).map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleDeleteCustomOption(item)}
                      disabled={customLoading}
                      title="Delete custom option"
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
        )}
      </div>
    </div>
  );
}
