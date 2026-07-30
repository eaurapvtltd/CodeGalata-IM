'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeBranches, getBranchBatches, createBatch, getBatchStudents, addSingleStudent } from '@/lib/db';
import { Branch, Batch, Student } from '@/lib/types';
import { StudentUploadModal } from '@/components/branches/StudentUploadModal';
import { StudentTable } from '@/components/branches/StudentTable';
import { ArrowLeft, Plus, Upload, Layers, Users, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BranchDetailPage({ params }: { params: Promise<{ branchId: string }> }) {
  const resolvedParams = use(params);
  const { college } = useAuth();
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Modals
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  // Manual Student Form
  const [mName, setMName] = useState('');
  const [mRollNo, setMRollNo] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mCgpa, setMCgpa] = useState(8.5);

  const loadBranchData = () => {
    if (!college) return;
    const branches = getCollegeBranches(college.id);
    const targetBranch = branches.find(b => b.id === resolvedParams.branchId);
    
    if (targetBranch) {
      setBranch(targetBranch);
      const bList = getBranchBatches(targetBranch.id);
      setBatches(bList);
      if (bList.length > 0 && !activeBatchId) {
        setActiveBatchId(bList[0].id);
      }
    }
  };

  useEffect(() => {
    loadBranchData();
  }, [college, resolvedParams.branchId]);

  useEffect(() => {
    if (activeBatchId) {
      const stList = getBatchStudents(activeBatchId);
      setStudents(stList);
    } else {
      setStudents([]);
    }
  }, [activeBatchId, batches]);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim() || !branch || !college) return;

    try {
      const created = createBatch(college.id, branch.id, newBatchName.trim());
      toast.success(`Batch "${created.batchName}" created successfully!`);
      setNewBatchName('');
      setIsCreateBatchOpen(false);
      
      const updatedBatches = getBranchBatches(branch.id);
      setBatches(updatedBatches);
      setActiveBatchId(created.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create batch');
    }
  };

  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !activeBatchId) return;

    if (!mName.trim() || !mRollNo.trim() || !mEmail.trim()) {
      toast.error('Please complete Name, Roll No, and Email.');
      return;
    }

    try {
      addSingleStudent(college.id, {
        batchId: activeBatchId,
        studentName: mName.trim(),
        rollNo: mRollNo.trim(),
        email: mEmail.trim(),
        phone: mPhone.trim(),
        cgpa: Number(mCgpa) || 0.0,
        status: 'Activated',
      });

      toast.success(`Student "${mName}" added to batch!`);
      setIsManualAddOpen(false);
      setMName('');
      setMEmail('');
      loadBranchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    }
  };

  const activeBatch = batches.find(b => b.id === activeBatchId);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Navigation & Breadcrumb */}
        <div>
          <Link
            href="/branches"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Branches
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {branch?.branchName || 'Branch'} Department
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage batches and student rosters for {branch?.branchName} Engineering.
              </p>
            </div>

            {/* Create Batch Button */}
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Create Batch</span>
            </button>
          </div>
        </div>

        {/* Batches Navigation Tabs */}
        <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto">
          {batches.length === 0 ? (
            <p className="text-xs text-zinc-400 px-3 py-2">No batches created yet. Click &quot;Create Batch&quot; to add your first batch.</p>
          ) : (
            batches.map((batch) => {
              const count = getBatchStudents(batch.id).length;
              const isActive = batch.id === activeBatchId;
              return (
                <button
                  key={batch.id}
                  onClick={() => setActiveBatchId(batch.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{batch.batchName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Active Batch Overview & Student Roster */}
        {activeBatch ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Batch {activeBatch.batchName}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {students.length} Enrolled Students
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Onboard students manually or upload an Excel spreadsheet (.xlsx).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMRollNo(`REG${Math.floor(100000 + Math.random() * 900000)}`);
                    setIsManualAddOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Student Manually</span>
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Upload Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Student Table */}
            <StudentTable students={students} />
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">
            <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Batches in {branch?.branchName}</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
              Create a batch to begin adding student lists.
            </p>
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Batch</span>
            </button>
          </div>
        )}

        {/* Modal: Create Batch */}
        {isCreateBatchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Create New Batch</h3>
                <button onClick={() => setIsCreateBatchOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder={`e.g. ${branch?.branchName}-A`}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">Example: {branch?.branchName}-A, {branch?.branchName}-B, {branch?.branchName}-C</p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateBatchOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Save Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Manual Add Student in Batch */}
        {isManualAddOpen && activeBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" /> Add Student to {activeBatch.batchName}
                </h3>
                <button onClick={() => setIsManualAddOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManualAddStudent} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="e.g. Diya Patel"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Roll / Registration Number *
                  </label>
                  <input
                    type="text"
                    value={mRollNo}
                    onChange={(e) => setMRollNo(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={mEmail}
                    onChange={(e) => setMEmail(e.target.value)}
                    placeholder="student@college.edu"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={mPhone}
                      onChange={(e) => setMPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={mCgpa}
                      onChange={(e) => setMCgpa(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManualAddOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Save Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Upload Excel Students */}
        {activeBatch && college && (
          <StudentUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            collegeId={college.id}
            collegeName={college.collegeName}
            batchId={activeBatch.id}
            batchName={activeBatch.batchName}
            onSuccess={loadBranchData}
          />
        )}
      </div>
    </AdminLayout>
  );
}
