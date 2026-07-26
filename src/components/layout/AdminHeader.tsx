'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, ShieldCheck, User, Menu } from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const { college } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input Placeholder */}
        <div className="relative w-44 sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search students, batches, problems..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:truncate"
          />
        </div>
      </div>

      {/* Right User & Badge Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Verified Tenant Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified College Admin</span>
        </div>

        {/* Notifications Icon */}
        <button className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white dark:ring-zinc-900" />
        </button>

        {/* College Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            {college?.collegeName ? college.collegeName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {college?.collegeName || 'Super Admin'}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate max-w-[160px]">
              {college?.collegeEmail || 'admin@college.edu'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
