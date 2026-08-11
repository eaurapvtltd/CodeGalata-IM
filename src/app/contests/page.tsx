'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getContests, 
  createContest, 
  deleteContest, 
  getCollegeBranches, 
  getBranchBatches, 
  getCollegeProblems,
  getBatchStudents
} from '@/lib/db';
import { Contest, Branch, Batch, Problem } from '@/lib/types';
import { EmailService } from '@/lib/emailService';
import { Trophy, Plus, Calendar, Clock, X, AlertTriangle, Eye, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContestsPage() {
  const { college } = useAuth();

  const [contests, setContests] = useState<Contest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Running' | 'Completed'>('All');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingContest, setDeletingContest] = useState<Contest | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const loadData = () => {
    if (!college) return;
    setContests(getContests(college.id));
    const brList = getCollegeBranches(college.id);
    setBranches(brList);
    if (brList.length > 0) {
      setSelectedBranchId(brList[0].id);
    }
    setProblems(getCollegeProblems(college.id));
  };

  useEffect(() => {
    loadData();
  }, [college]);

  useEffect(() => {
    if (selectedBranchId) {
      const batList = getBranchBatches(selectedBranchId);
      setBatches(batList);
      if (batList.length > 0) {
        setSelectedBatchId(batList[0].id);
      } else {
        setSelectedBatchId('');
      }
    }
  }, [selectedBranchId]);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setStartTime(new Date(Date.now() + 3600000 * 2).toISOString().substring(0, 16));
    setEndTime(new Date(Date.now() + 3600000 * 5).toISOString().substring(0, 16));
    setSelectedProblemIds([]);
    if (branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
    setIsCreateOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    if (!title.trim() || !startTime || !endTime || selectedProblemIds.length === 0 || !selectedBranchId || !selectedBatchId) {
      toast.error('Please fill in all details and select at least one coding problem.');
      return;
    }

    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      toast.error('Contest End Time must be strictly after Start Time.');
      return;
    }

    try {
      const created = createContest(college.id, {
        title: title.trim(),
        description: description.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        problemIds: selectedProblemIds,
        branchId: selectedBranchId,
        batchId: selectedBatchId,
      });

      // Dispatch notification email to batch students
      const batchStudents = getBatchStudents(selectedBatchId);
      const currentBatch = batches.find(b => b.id === selectedBatchId);
      EmailService.dispatchContestNotification(
        batchStudents,
        college.collegeName,
        currentBatch?.batchName || 'Selected Batch',
        created
      );

      toast.success(`Contest "${title}" scheduled & emailed to ${batchStudents.length} students!`);
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule contest');
    }
  };

  const handleDelete = () => {
    if (!college || !deletingContest) return;
    try {
      deleteContest(college.id, deletingContest.id);
      toast.success('Contest deleted successfully.');
      setDeletingContest(null);
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete contest.');
    }
  };

  const handleToggleProblem = (id: string) => {
    setSelectedProblemIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Filtered contests
  const filteredContests = contests.filter(c => {
    return statusFilter === 'All' || c.status === statusFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-emerald-500" />
              Contests & Test Module
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create and manage timed coding contests, view leaderboard standings, and monitor results.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Contest</span>
          </button>
        </div>

        {/* Tab Filter Controls */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto">
          {(['All', 'Upcoming', 'Running', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {st} Contests
            </button>
          ))}
        </div>

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">
            <Trophy className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Contests Scheduled</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
              {contests.length === 0 
                ? 'Create a live coding exam or competitive test event for targeted student batches.' 
                : 'No contests matched your status filter.'}
            </p>
            {contests.length === 0 && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Contest</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((c) => {
              const br = branches.find(b => b.id === c.branchId)?.branchName || 'CSE';
              const bat = batches.find(b => b.id === c.batchId)?.batchName || 'CSE-A';
              
              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500">
                        {br} &bull; {bat}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Running'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 animate-pulse'
                            : c.status === 'Upcoming'
                            ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-white truncate">
                      {c.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {c.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Starts: {new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Ends: {new Date(c.endTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      {c.problemIds.length} Problems
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/contests/${c.id}`}
                        className="p-2 rounded-xl text-zinc-500 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Enter Leaderboard"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Board</span>
                      </Link>
                      <button
                        onClick={() => setDeletingContest(c)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Contest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Contest */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Schedule New Contest</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Contest Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Code Galatta Weekly #1"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contest agenda or guidelines..."
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Branch & Batch Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Branch Selection *
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Batch Selection *
                    </label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {batches.length === 0 ? (
                        <option value="">No batches found</option>
                      ) : (
                        batches.map(b => (
                          <option key={b.id} value={b.id}>{b.batchName}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Problems Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Select Coding Problems * ({selectedProblemIds.length} Selected)
                  </label>
                  {problems.length === 0 ? (
                    <p className="text-zinc-500 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200">
                      Create questions in Problem Setter first.
                    </p>
                  ) : (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2">
                      {problems.map((p) => {
                        const isChecked = selectedProblemIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                              isChecked ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleProblem(p.id)}
                                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                              />
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{p.title}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                              {p.difficulty}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Timing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Schedule Contest
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingContest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Delete Contest?</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Are you sure you want to cancel and delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{deletingContest.title}&quot;</span>? This will wipe leaderboard rankings.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingContest(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
