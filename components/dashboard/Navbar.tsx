'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth-actions';
import { Wallet, LogOut, LayoutDashboard, ReceiptText, User } from 'lucide-react';

interface NavbarProps {
  userName: string;
}

export default function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: ReceiptText },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:bg-sky-700 transition">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">SpendWise</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Expense Management</p>
            </div>
          </Link>

          {/* Primary Navbar Navigation Tabs */}
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Navigation & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl transition text-xs font-bold border ${
              pathname === '/profile'
                ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-2xs'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
