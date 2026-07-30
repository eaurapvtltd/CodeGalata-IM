'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeDashboardStats, getCollegeProblems, getCollegeBranches } from '@/lib/db';
import { Building, Mail, Calendar, ShieldCheck, User, GraduationCap, Code2, Layers } from 'lucide-react';

export default function ProfilePage() {
  const { college } = useAuth();

  if (!college) return null;

  const stats = getCollegeDashboardStats(college.id);
  const problems = getCollegeProblems(college.id);
  const branches = getCollegeBranches(college.id);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <User className="w-7 h-7 text-emerald-500" />
            College Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Institutional account credentials, status, and system metadata.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/20 shrink-0">
              {college.collegeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{college.collegeName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {college.collegeEmail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Account Details
              </span>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-500" /> College Name
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{college.collegeName}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" /> College Email
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{college.collegeEmail}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Registered On
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {new Date(college.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Platform Summary
              </span>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" /> Active Branches
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{branches.length} Branches</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500" /> Total Students
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{stats.totalStudents} Enrolled</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-500" /> Created Problems
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{problems.length} Problems</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
