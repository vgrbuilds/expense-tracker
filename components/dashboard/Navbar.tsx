'use client';

import { useState } from 'react';
import { signOut } from '@/app/actions/auth-actions';
import ProfileModal from './ProfileModal';
import { ReportFrequency } from '@/types';
import { Wallet, LogOut, Settings } from 'lucide-react';

interface NavbarProps {
  userName: string;
  userEmail?: string;
  reportFrequency?: ReportFrequency;
  userCustomCategories?: string[];
  userCustomVendors?: string[];
}

export default function Navbar({
  userName,
  userEmail,
  reportFrequency = 'Monthly',
  userCustomCategories = [],
  userCustomVendors = [],
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">SpendWise</h1>
              <p className="text-xs text-slate-400 font-medium">Personal Expense Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition text-sm font-medium border border-slate-200"
            >
              <div className="w-6 h-6 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-semibold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <ProfileModal
        currentName={userName}
        currentEmail={userEmail}
        currentReportFrequency={reportFrequency}
        userCustomCategories={userCustomCategories}
        userCustomVendors={userCustomVendors}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
