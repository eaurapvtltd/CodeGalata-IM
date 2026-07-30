'use client';

import React from 'react';
import { 
  GitBranch, 
  BookOpen, 
  ChevronRight, 
  Building2,
  ChevronLeft,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'BRANCHES' | 'COURSES';
  setActiveTab: (tab: 'BRANCHES' | 'COURSES') => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  setIsOpenMobile,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const handleNavClick = (tab: 'BRANCHES' | 'COURSES') => {
    setActiveTab(tab);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile && setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col p-4 fixed top-0 bottom-0 left-0 z-50 overflow-y-auto select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          isOpenMobile ? 'translate-x-0 shadow-2xl w-[260px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between mb-5 pt-1 relative">
          {!isCollapsed || isOpenMobile ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F8EF] border border-[#bbf7d0] text-[#16A34A] flex items-center justify-center font-extrabold text-base shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-slate-900 leading-tight">Code Galatta</h1>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Super Admin Portal</span>
              </div>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl bg-[#E8F8EF] border border-[#bbf7d0] text-[#16A34A] font-extrabold text-base flex items-center justify-center shadow-xs mx-auto"
              title="Code Galatta Admin"
            >
              CG
            </div>
          )}

          {/* Desktop Collapse Arrow */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#16A34A] hover:text-white transition-all shadow-xs border border-slate-200"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          {setIsOpenMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 text-xs font-mono">
          
          {(!isCollapsed || isOpenMobile) && (
            <div className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase px-2 pt-2 pb-1">
              ACADEMIC CONTROL
            </div>
          )}

          {/* ITEM 1: BRANCHES */}
          <button
            onClick={() => handleNavClick('BRANCHES')}
            title="Branches"
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all ${
              activeTab === 'BRANCHES'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 mx-auto lg:mx-0">
              <GitBranch className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isOpenMobile) && <span className="truncate">Branches</span>}
            </div>
            {(!isCollapsed || isOpenMobile) && activeTab === 'BRANCHES' && (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-90" />
            )}
          </button>

          {/* ITEM 2: COURSES */}
          <button
            onClick={() => handleNavClick('COURSES')}
            title="Courses"
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all ${
              activeTab === 'COURSES'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 mx-auto lg:mx-0">
              <BookOpen className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isOpenMobile) && <span className="truncate">Courses</span>}
            </div>
            {(!isCollapsed || isOpenMobile) && activeTab === 'COURSES' && (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-90" />
            )}
          </button>

        </nav>

        {/* Sidebar Footer User Profile */}
        <div className="border-t border-slate-200 pt-3 mt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
              SA
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex flex-col min-w-0 font-mono">
                <span className="text-xs font-extrabold text-slate-900 truncate">Super Admin</span>
                <span className="text-[10px] text-slate-400 truncate">admin@cgit.edu</span>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
