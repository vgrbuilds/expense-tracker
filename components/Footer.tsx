import Link from 'next/link';
import { Wallet, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-500 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">SpendWise</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Smart Personal Expense Management</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-sky-600 transition">
            Dashboard
          </Link>
          <Link href="/transactions" className="hover:text-sky-600 transition">
            Transactions
          </Link>
          <Link href="/profile" className="hover:text-sky-600 transition">
            Profile & Settings
          </Link>
        </div>

        {/* Copyright & Security Badge */}
        <div className="flex items-center gap-3 text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted & Secure
          </span>
          <p>© {new Date().getFullYear()} SpendWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
