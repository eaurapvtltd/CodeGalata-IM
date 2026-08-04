'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeBranches, createBranch, getBranchBatches, getBatchStudents, updateBranch, deleteBranch } from '@/lib/db';
import { Branch } from '@/lib/types';
import { GitFork, ChevronRight, Layers, Users, Plus, X, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BranchesPage() {
  const router = useRouter();
  const { college } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editBranchName, setEditBranchName] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

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

  const handleEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !editingBranch || !editBranchName.trim()) return;

    try {
      updateBranch(college.id, editingBranch.id, { branchName: editBranchName.trim() });
      toast.success(`Department updated to "${editBranchName.trim()}"`);
      setEditingBranch(null);
      setEditBranchName('');
      loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update branch');
    }
  };

  const handleDeleteBranch = (branchId: string, branchName: string) => {
    if (!college) return;
    if (confirm(`Are you sure you want to delete the ${branchName} department? This will also affect associated batches and students.`)) {
      try {
        deleteBranch(college.id, branchId);
        toast.success(`Department "${branchName}" deleted successfully`);
        loadBranches();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete branch');
      }
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
              <div
                key={branch.id}
                onClick={() => router.push(`/branches/${branch.id}`)}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group relative overflow-visible flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-110 transition-transform">
                      {branch.branchName.substring(0, 3).toUpperCase()}
                    </div>

                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === branch.id ? null : branch.id);
                        }}
                        className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-emerald-100 text-zinc-600 hover:text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Branch options"
                      >
                        <MoreVertical className="w-5 h-5 pointer-events-none" />
                      </button>

                      {activeDropdown === branch.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 py-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBranch(branch);
                              setEditBranchName(branch.branchName);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Branch
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(null);
                              router.push(`/branches/${branch.id}`);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2"
                          >
                            <Layers className="w-4 h-4" /> Manage Batches
                          </button>
                          <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBranch(branch.id, branch.branchName);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Branch
                          </button>
                        </div>
                      )}
                    </div>
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
              </div>
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

        {/* Modal: Edit Branch */}
        {editingBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Edit Academic Branch</h3>
                <button onClick={() => setEditingBranch(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditBranch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Branch / Department Name *
                  </label>
                  <input
                    type="text"
                    value={editBranchName}
                    onChange={(e) => setEditBranchName(e.target.value)}
                    placeholder="e.g. Data Science, Cyber Security, IT"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBranch(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Save Changes
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
