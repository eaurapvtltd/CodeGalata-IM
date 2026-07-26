'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getActivityLogs, clearActivityLogs } from '@/lib/db';
import { ActivityLog } from '@/lib/types';
import { Activity, Search, Trash2, Clock, ShieldCheck, Mail, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityLogsPage() {
  const { college } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const loadLogs = () => {
    if (college) {
      setLogs(getActivityLogs(college.id));
    }
  };

  useEffect(() => {
    loadLogs();
  }, [college]);

  const handleClearLogs = () => {
    if (!college) return;
    try {
      clearActivityLogs(college.id);
      toast.success('Activity audit history cleared successfully.');
      setIsClearConfirmOpen(false);
      loadLogs();
    } catch (err: any) {
      toast.error('Failed to clear logs.');
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(term) ||
                          log.description.toLowerCase().includes(term) ||
                          log.adminEmail.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || log.type === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-7 h-7 text-emerald-500" />
              System Activity Logs
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Audit trails tracking logins, roster updates, batch allocations, problem edits, and exam scheduling.
            </p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-semibold text-xs transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Audit Log</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, details, admin email..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-500 shrink-0">Category:</span>
            {['All', 'Auth', 'Student', 'Batch', 'Problem', 'Assignment', 'Contest', 'Practice', 'Settings'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Activity className="w-12 h-12 text-zinc-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No system events logged</p>
              <p className="text-xs text-zinc-400 mt-1">Actions performed by college admins will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Operator Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-600 dark:text-zinc-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
                        {log.type}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          {log.adminEmail}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Clear Confirmation */}
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Clear Audit Logs?</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Are you sure you want to permanently clear the activity audit history? This action is irreversible.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
