'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeBranches, createBranch, getBranchBatches, getBatchStudents } from '@/lib/db';
import { Branch } from '@/lib/types';
import { GitFork, ChevronRight, Layers, Users, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BranchesPage() {
  const { college } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const loadBranches = () => {
    if (college) {
      const bList = getCollegeBranches(college.id);
      setBranches(bList);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [college]);

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !newBranchName.trim()) return;

    try {
      const created = createBranch(college.id, newBranchName.trim());
      toast.success(`New department "${created.branchName}" created!`);
      setNewBranchName('');
      setIsAddBranchOpen(false);
      loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create branch');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <GitFork className="w-7 h-7 text-emerald-500" />
              Academic Branches & Departments
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Select a branch to manage batches, or add new academic departments dynamically.
            </p>
          </div>

          <button
            onClick={() => setIsAddBranchOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => {
            const batches = getBranchBatches(branch.id);
            const totalStudents = batches.reduce((acc, b) => acc + getBatchStudents(b.id).length, 0);

            return (
              <Link
                key={branch.id}
                href={`/branches/${branch.id}`}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-110 transition-transform">
                      {branch.branchName.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {branch.branchName}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Department of {branch.branchName} Engineering
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span><strong className="text-zinc-900 dark:text-white">{batches.length}</strong> Batches</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span><strong className="text-zinc-900 dark:text-white">{totalStudents}</strong> Students</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Modal: Add New Branch */}
        {isAddBranchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Add New Academic Branch</h3>
                <button onClick={() => setIsAddBranchOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Branch / Department Name *
                  </label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="e.g. Data Science, Cyber Security, IT"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Examples: Data Science, Cyber Security, Information Technology, Robotics</p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddBranchOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Create Branch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
