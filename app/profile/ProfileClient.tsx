'use client';

import { useState } from 'react';
import { updateProfile, updatePassword } from '@/app/actions/profile-actions';
import { saveCustomOption, deleteCustomOption } from '@/app/actions/custom-option-actions';
import { ReportFrequency } from '@/types';
import { User, KeyRound, Bell, Settings, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface ProfileClientProps {
  userName: string;
  userEmail?: string;
  reportFrequency: ReportFrequency;
  userCustomCategories: string[];
  userCustomVendors: string[];
  userCustomSpentForOptions: string[];
}

export default function ProfileClient({
  userName,
  userEmail = '',
  reportFrequency: initialReportFrequency = 'Monthly',
  userCustomCategories = [],
  userCustomVendors = [],
  userCustomSpentForOptions = [],
}: ProfileClientProps) {
  // Profile Form States
  const [fullName, setFullName] = useState(userName);
  const [reportFrequency, setReportFrequency] = useState<ReportFrequency>(initialReportFrequency);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom Options Management State
  const [customTab, setCustomTab] = useState<'category' | 'vendor' | 'spent_for'>('category');
  const [customInput, setCustomInput] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

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

  const currentCustomList =
    customTab === 'category'
      ? userCustomCategories
      : customTab === 'vendor'
      ? userCustomVendors
      : userCustomSpentForOptions;

  return (
    <div className="space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-sky-100 mb-3 border border-white/15">
            <User className="w-3.5 h-3.5" /> Account & Preferences Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profile & Settings</h1>
          <p className="text-sky-100 text-sm mt-1.5 max-w-xl">
            Manage your personal profile, security credentials, report frequency, and custom dropdown options.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Security (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Profile & Report Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-sky-600" /> Personal Details & Email Reports
            </h2>

            {profileMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

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
                  Report Email Frequency
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
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  SpendWise compiles your spending metrics and sends automated financial emails according to this setting.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password Update */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-600" /> Password & Security
            </h2>

            {passwordMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading || !newPassword}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Custom Dropdown Options Management */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-sky-600" /> Manage Dropdown Options
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage your personal custom categories, vendors, and spent for options cleanly without crowded defaults.
          </p>

          {/* Sub-tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCustomTab('category')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
                customTab === 'category' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Categories ({userCustomCategories.length})
            </button>
            <button
              onClick={() => setCustomTab('vendor')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
                customTab === 'vendor' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Vendors ({userCustomVendors.length})
            </button>
            <button
              onClick={() => setCustomTab('spent_for')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
                customTab === 'spent_for' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Spent For ({userCustomSpentForOptions.length})
            </button>
          </div>

          {/* Add Option Form */}
          <form onSubmit={handleAddCustomOption} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={`Add new custom ${customTab.replace('_', ' ')}...`}
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

          {/* Saved Options List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[300px]">
            {currentCustomList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">
                  No custom {customTab.replace('_', ' ')} options added yet.
                </p>
              </div>
            ) : (
              currentCustomList.map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleDeleteCustomOption(item)}
                    disabled={customLoading}
                    title="Delete option"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
