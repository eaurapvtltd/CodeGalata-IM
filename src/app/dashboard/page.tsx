'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeDashboardStats } from '@/lib/db';
import { DashboardStats } from '@/lib/types';
import { Users, UserCheck, Briefcase, TrendingUp, Activity, PieChart as PieIcon, BarChart3, Clock } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

export default function DashboardPage() {
  const { college } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    return getCollegeDashboardStats(college?.id || 'demo-college-id');
  });

  useEffect(() => {
    const data = getCollegeDashboardStats(college?.id || 'demo-college-id');
    setStats(data);
  }, [college]);

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-emerald-800/20 to-zinc-900 p-6 rounded-3xl border border-emerald-500/20 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{college?.collegeName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Here is your centralized college overview for students, batches, and problem analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm self-start sm:self-center">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Students */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Total Students
                </p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
                  {stats.totalStudents}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>All registered batches</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% database match</span>
            </div>
          </div>

          {/* Card 2: Active Students */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Active Students
                </p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
                  {stats.activeStudents}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Activated student accounts</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Card 3: Students Working */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Students Working
                </p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
                  {stats.studentsWorking}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Actively solving problems</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Live activity</span>
            </div>
          </div>
        </div>

        {/* Analytics Section: Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart: Status Breakdown */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-500" />
                  Student Distribution
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Account status allocation</p>
              </div>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution.every(s => s.value === 0) 
                      ? [{ name: 'No Students', value: 1, color: '#3f3f46' }] 
                      : stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats.statusDistribution.every(s => s.value === 0) 
                      ? [{ name: 'No Students', value: 1, color: '#3f3f46' }] 
                      : stats.statusDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
              {stats.statusDistribution.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[80px]">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart: Activity Trend */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Activity & Submissions Trend
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Weekly student engagement metrics</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.activityTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="submissions" name="Code Submissions" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="students" name="Active Students" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Graph: Branch Overview & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Graph: Branch Distribution */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Branch-wise Student Count
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Student enrollment per department</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.branchDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="branch" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="students" name="Students" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="batches" name="Batches" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-amber-500" />
                Recent Activity
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Audit log for college operations</p>

              {stats.recentActivities.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <Clock className="w-8 h-8 text-zinc-400 mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">No activity logged yet</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Activities will appear when you create batches or problems.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                  {stats.recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {act.description}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                Live Data Stream Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
