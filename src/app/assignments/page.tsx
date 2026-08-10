'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getAssignments, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment, 
  getCollegeBranches, 
  getBranchBatches, 
  getCollegeProblems,
  getBatchStudents
} from '@/lib/db';
import { Assignment, Branch, Batch, Problem } from '@/lib/types';
import { EmailService } from '@/lib/emailService';
import { 
  Code2, 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  X, 
  AlertTriangle, 
  Layers,
  Eye,
  Award,
  Terminal,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabFilter = 'ALL' | 'PUBLISHED' | 'SCHEDULED' | 'DRAFT';

export default function AssignmentsPage() {
  const { college } = useAuth();
  
  // Data State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [marks, setMarks] = useState<number>(100);
  const [codeTag, setCodeTag] = useState<string>('CG-MID-2026-CSE');
  const [isPublished, setIsPublished] = useState(true);

  const loadData = () => {
    if (!college) return;
    const list = getAssignments(college.id);
    setAssignments(list);

    const brList = getCollegeBranches(college.id);
    setBranches(brList);
    if (brList.length > 0 && !selectedBranchId) {
      setSelectedBranchId(brList[0].id);
    }
    setProblems(getCollegeProblems(college.id));
  };

  useEffect(() => {
    loadData();
  }, [college]);

  // Load batches when branch selection changes
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
    setEditingAssignment(null);
    setTitle('CSE 3rd Year Mid-Term Lab Exam (Data Structures & Algos)');
    setDescription('Official proctored mid-term practical evaluation covering rotated arrays, hash maps, binary trees, and heap structures.');
    
    const freshProblems = college ? getCollegeProblems(college.id) : [];
    setProblems(freshProblems);

    if (branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
    
    setSelectedProblemIds(freshProblems.map(p => p.id));
    setDueDate(new Date(Date.now() + 3600000 * 24 * 7).toISOString().substring(0, 16));
    setMarks(100);
    setCodeTag('CG-MID-2026-CSE');
    setIsPublished(true);
    setIsFormOpen(true);
  };

  const openEditModal = (assign: Assignment) => {
    const freshProblems = college ? getCollegeProblems(college.id) : [];
    setProblems(freshProblems);
    setEditingAssignment(assign);
    setTitle(assign.title);
    setDescription(assign.description);
    setSelectedBranchId(assign.branchId);
    setSelectedBatchId(assign.batchId);
    setSelectedProblemIds(assign.problemIds);
    setDueDate(new Date(assign.dueDate).toISOString().substring(0, 16));
    setMarks(assign.marks || 100);
    setCodeTag(assign.codeTag || 'CG-MID-2026-CSE');
    setIsPublished(assign.isPublished);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    if (!title.trim() || !description.trim() || !selectedBranchId || !selectedBatchId || selectedProblemIds.length === 0 || !dueDate) {
      toast.error('Please complete all form fields and select at least one coding problem.');
      return;
    }

    try {
      if (editingAssignment) {
        updateAssignment(college.id, editingAssignment.id, {
          title: title.trim(),
          description: description.trim(),
          branchId: selectedBranchId,
          batchId: selectedBatchId,
          problemIds: selectedProblemIds,
          dueDate: new Date(dueDate).toISOString(),
          isPublished,
          marks,
          codeTag: codeTag.trim(),
        });
        toast.success(`Assignment "${title}" updated successfully!`);
      } else {
        const created = createAssignment(college.id, {
          title: title.trim(),
          description: description.trim(),
          branchId: selectedBranchId,
          batchId: selectedBatchId,
          problemIds: selectedProblemIds,
          dueDate: new Date(dueDate).toISOString(),
          isPublished,
          marks,
          codeTag: codeTag.trim(),
        });

        // Dispatch student emails for batch
        const batchStudents = getBatchStudents(selectedBatchId);
        const currentBatch = batches.find(b => b.id === selectedBatchId);
        EmailService.dispatchAssignmentNotification(
          batchStudents,
          college.collegeName,
          currentBatch?.batchName || 'Selected Batch',
          created
        );

        toast.success(`Assignment "${title}" created & emailed to ${batchStudents.length} enrolled students!`);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save assignment');
    }
  };

  const handleDelete = () => {
    if (!college || !deletingAssignment) return;
    try {
      deleteAssignment(college.id, deletingAssignment.id);
      toast.success('Assignment deleted.');
      setDeletingAssignment(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete assignment');
    }
  };

  const handleToggleProblem = (id: string) => {
    setSelectedProblemIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Filtered list
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'PUBLISHED') matchesTab = a.isPublished;
    if (activeTab === 'DRAFT') matchesTab = !a.isPublished;
    if (activeTab === 'SCHEDULED') matchesTab = new Date(a.dueDate) > new Date();

    return matchesSearch && matchesTab;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header - Image 1 Studio Design */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-7 h-7 text-emerald-500" />
              Assignment &amp; Examination Studio
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              Design auto-graded programming assignments, midterm lab exams, and draft version control.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Filter Navigation Tabs Bar (Image 1 Layout) */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-6 text-xs font-mono tracking-wider">
          {(['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFT'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold transition-all border-b-2 uppercase ${
                  isActive
                    ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400 font-extrabold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Control */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assignment title or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <span className="text-xs text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900 dark:text-white">{filteredAssignments.length}</strong> assignments
          </span>
        </div>

        {/* Assignments Cards Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">
            <Terminal className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Assignments Found</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
              {assignments.length === 0 
                ? 'Create auto-graded programming assignments and midterm practical exams.' 
                : 'No assignments matched your selected tab filter.'}
            </p>
            {assignments.length === 0 && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Assignment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((assign) => {
              const studentCount = getBatchStudents(assign.batchId).length;

              return (
                <div
                  key={assign.id}
                  className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 border border-zinc-200 dark:border-emerald-500/20 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Pill Badge & Marks (Image 1 Layout) */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {assign.isPublished ? 'LIVE' : 'DRAFT'} &bull; {assign.codeTag || 'CG-MID-2026-CSE'}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        {assign.marks || 100} Marks
                      </span>
                    </div>

                    {/* Card Title (Image 1 Layout) */}
                    <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white leading-snug">
                      {assign.title}
                    </h3>

                    {/* Card Description (Image 1 Layout - Rendered cleanly) */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                      {assign.description}
                    </p>
                  </div>

                  {/* Card Footer: Problems Count & Live Monitor Button (Image 1 Layout) */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                      {assign.problemIds.length} Coding Problems
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingAssignment(assign)}
                        className="px-4 py-1.5 rounded-full border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Monitor</span>
                      </button>

                      <button
                        onClick={() => openEditModal(assign)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Assignment"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingAssignment(assign)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Assignment"
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

        {/* Modal: Create/Edit Assignment */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CSE 3rd Year Mid-Term Lab Exam (Data Structures & Algos)"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed assignment description..."
                    required
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                  />
                </div>

                {/* Code Tag & Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Code Tag / ID
                    </label>
                    <input
                      type="text"
                      value={codeTag}
                      onChange={(e) => setCodeTag(e.target.value)}
                      placeholder="e.g. CG-MID-2026-CSE"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      placeholder="100"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Branch & Batch Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Branch *
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {branches.map(br => (
                        <option key={br.id} value={br.id}>{br.branchName}</option>
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
                      {batches.map(bt => (
                        <option key={bt.id} value={bt.id}>{bt.batchName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coding Problems Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Select Coding Problems ({selectedProblemIds.length} Selected) *
                    </label>

                    {problems.length > 0 && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSelectedProblemIds(problems.map(p => p.id))}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                        >
                          Select All
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedProblemIds([])}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {problems.length === 0 ? (
                    <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center bg-zinc-50 dark:bg-zinc-800/50">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">No coding problems found in your question bank.</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (college) {
                            const fresh = getCollegeProblems(college.id);
                            setProblems(fresh);
                            setSelectedProblemIds(fresh.map(p => p.id));
                            toast.success('Question bank problems loaded!');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                      >
                        + Load Starter Question Bank
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 bg-zinc-50 dark:bg-zinc-800 space-y-1.5">
                      {problems.map(prob => {
                        const isChecked = selectedProblemIds.includes(prob.id);
                        return (
                          <label
                            key={prob.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                              isChecked 
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleProblem(prob.id)}
                                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
                              />
                              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                {prob.title}
                              </span>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                              prob.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                              prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                              'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            }`}>
                              {prob.difficulty}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Due Date & Publish Switch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Due Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Publish Immediately</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Assignment Details */}
        {viewingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-[11px] font-bold">
                  {viewingAssignment.codeTag || 'CG-MID-2026-CSE'} &bull; {viewingAssignment.marks || 100} Marks
                </span>
                <button onClick={() => setViewingAssignment(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">{viewingAssignment.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">{viewingAssignment.description}</p>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Assigned Problems:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{viewingAssignment.problemIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Due Date:</span>
                  <span className="font-bold text-emerald-500">{new Date(viewingAssignment.dueDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Delete Assignment?</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{deletingAssignment.title}&quot;</span>?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingAssignment(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
