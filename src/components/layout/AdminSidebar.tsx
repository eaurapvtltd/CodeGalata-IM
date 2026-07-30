'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  GitFork, 
  Code2, 
  User, 
  LogOut,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Users,
  Trophy,
  Timer,
  BarChart3,
  Activity,
  Settings,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ isMobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, college } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/dashboard');
  };

  const academicItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Branches', href: '/branches', icon: GitFork },
    { name: 'Problem Setter', href: '/problem-setter', icon: Code2 },
    { name: 'Assignments', href: '/assignments', icon: BookOpen },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Faculty Chat', href: '/faculty-chat', icon: MessageSquare },
  ];

  const evaluationItems = [
    { name: 'Daily Challenge', href: '/daily-challenge', icon: Sparkles },
    { name: 'Campus Leaderboard', href: '/campus-leaderboard', icon: Trophy },
    { name: 'Contests & Tests', href: '/contests', icon: Trophy },
    { name: 'Timed Practice', href: '/practice', icon: Timer },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  ];

  const systemItems = [
    { name: 'Activity Logs', href: '/activity-logs', icon: Activity },
    { name: 'Profile Settings', href: '/profile', icon: User },
    { name: 'System Settings', href: '/settings', icon: Settings },
  ];

  const renderLink = (item: { name: string; href: string; icon: any }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
          isActive
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
          <span>{item.name}</span>
        </div>
        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight leading-none">
                Code Galatta
              </h1>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Super Admin
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* College Name Pill */}
        {college && (
          <div className="mx-4 my-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/50">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Institution</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={college.collegeName}>
              {college.collegeName}
            </p>
          </div>
        )}

        {/* Navigation Menu Sections */}
        <div className="px-3 py-2 space-y-4">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Academic Control
            </p>
            <nav className="space-y-1">{academicItems.map(renderLink)}</nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Evaluation & Metrics
            </p>
            <nav className="space-y-1">{evaluationItems.map(renderLink)}</nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              System Operations
            </p>
            <nav className="space-y-1">{systemItems.map(renderLink)}</nav>
          </div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Logout Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col h-screen sticky top-0 z-40 shrink-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Overlay & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobile} 
          />
          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-50 overflow-y-auto shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
