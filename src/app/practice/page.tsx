'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getTimedPractices, 
  createTimedPractice, 
  deleteTimedPractice, 
  getCollegeBranches, 
  getBranchBatches, 
  getCollegeProblems 
} from '@/lib/db';
import { TimedPractice, Branch, Batch, Problem } from '@/lib/types';
import { Timer, Plus, Calendar, Clock, X, AlertTriangle, Layers, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimedPracticePage() {
  const { college } = useAuth();

  const [practices, setPractices] = useState<TimedPractice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);

  const loadData = () => {
    if (!college) return;
    setPractices(getTimedPractices(college.id));
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
    setDurationMinutes(60);
    setStartDate(new Date().toISOString().substring(0, 16));
    setEndDate(new Date(Date.now() + 3600000 * 24).toISOString().substring(0, 16));
    setSelectedProblemIds([]);
    if (branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
    setIsCreateOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    if (!title.trim() || !durationMinutes || !startDate || !endDate || !selectedBatchId || selectedProblemIds.length === 0) {
      toast.error('Please complete all form fields and select at least one coding problem.');
      return;
    }

    try {
      createTimedPractice(college.id, {
        title: title.trim(),
        durationMinutes: Number(durationMinutes),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        batchId: selectedBatchId,
        problemIds: selectedProblemIds,
      });
      toast.success(`Timed Practice "${title}" scheduled!`);
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule session');
    }
  };

  const handleDelete = (id: string) => {
    if (!college) return;
    try {
      deleteTimedPractice(college.id, id);
      toast.success('Session deleted.');
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete session.');
    }
  };

  const handleToggleProblem = (id: string) => {
    setSelectedProblemIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Timer className="w-7 h-7 text-emerald-500" />
              Timed Practice Sessions
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Configure coding practice workouts with explicit duration thresholds and batch targeting.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        </div>

        {/* Practices Listing */}
        {practices.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">
            <Timer className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Timed Practices Configured</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
              Create a timed coding practice workout with customizable problem packages.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Practice</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((p) => {
              const bat = batches.find(b => b.id === p.batchId)?.batchName || 'CSE-A';
              
              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500">
                        Batch targeted: {bat}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-white truncate">
                      {p.title}
                    </h3>

                    <div className="mt-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Package: <strong className="text-zinc-800 dark:text-zinc-200">{p.problemIds.length} questions</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Active until: {new Date(p.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-semibold flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" /> Timer active
                    </span>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Timed Practice */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Create Timed Practice Session</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Dynamic Programming Blitz"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Duration & Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      required
                      min="5"
                      max="480"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Branch *
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
                      Batch *
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
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                              {p.difficulty}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scheduling Date Window */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Start Window Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      End Window Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                    Save Practice Session
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
