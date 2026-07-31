'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getAllCollegeStudents, 
  updateStudent, 
  deleteStudent, 
  getCollegeBranches, 
  getBranchBatches,
  addSingleStudent 
} from '@/lib/db';
import { Student, Branch, Batch } from '@/lib/types';
import { Users, Search, Edit3, Trash2, Mail, Phone, ChevronRight, X, AlertTriangle, UserPlus, FileSpreadsheet, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const { college } = useAuth();

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('All');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Online Now' | 'Recent' | 'Inactive'>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Manual Add Form Fields
  const [addName, setAddName] = useState('');
  const [addRollNo, setAddRollNo] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCgpa, setAddCgpa] = useState<number>(8.5);
  const [addBranchId, setAddBranchId] = useState('');
  const [addBatchId, setAddBatchId] = useState('');
  const [addBatchesList, setAddBatchesList] = useState<Batch[]>([]);
  const [addStatus, setAddStatus] = useState<'Not Activated' | 'Activated' | 'Working'>('Activated');

  // Edit Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cgpa, setCgpa] = useState(0.0);
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');

  const loadData = () => {
    if (!college) return;
    setStudents(getAllCollegeStudents(college.id));
    const brList = getCollegeBranches(college.id);
    setBranches(brList);
    if (brList.length > 0 && !addBranchId) {
      setAddBranchId(brList[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [college]);

  // Load batches when branch filter changes
  useEffect(() => {
    if (selectedBranchId !== 'All') {
      setBatches(getBranchBatches(selectedBranchId));
    } else {
      setBatches([]);
      setSelectedBatchId('All');
    }
  }, [selectedBranchId]);

  // Load batches for Manual Add modal
  useEffect(() => {
    if (addBranchId) {
      const batList = getBranchBatches(addBranchId);
      setAddBatchesList(batList);
      if (batList.length > 0) {
        setAddBatchId(batList[0].id);
      } else {
        setAddBatchId('');
      }
    }
  }, [addBranchId]);

  const openAddModal = () => {
    setAddName('');
    setAddRollNo(`REG${Math.floor(100000 + Math.random() * 900000)}`);
    setAddEmail('');
    setAddPhone('');
    setAddCgpa(8.5);
    setAddStatus('Activated');
    if (branches.length > 0) {
      setAddBranchId(branches[0].id);
    }
    setIsAddModalOpen(true);
  };

  const handleManualAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    if (!addName.trim() || !addRollNo.trim() || !addEmail.trim() || !addBatchId) {
      toast.error('Please complete all required fields and select a batch.');
      return;
    }

    try {
      const newSt = addSingleStudent(college.id, {
        batchId: addBatchId,
        studentName: addName.trim(),
        rollNo: addRollNo.trim(),
        email: addEmail.trim(),
        phone: addPhone.trim(),
        cgpa: Number(addCgpa) || 0.0,
        status: addStatus,
      });

      toast.success(`Student "${newSt.studentName}" onboarded successfully!`);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    }
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setName(st.studentName);
    setEmail(st.email);
    setCgpa(st.cgpa);
    setRollNo(st.rollNo || '');
    setPhone(st.phone || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !editingStudent) return;

    try {
      updateStudent(college.id, editingStudent.id, {
        studentName: name.trim(),
        email: email.trim(),
        cgpa: Number(cgpa) || 0.0,
        rollNo: rollNo.trim(),
        phone: phone.trim(),
      });
      toast.success(`Student "${name}" updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student');
    }
  };

  const handleStatusToggle = (st: Student) => {
    if (!college) return;
    const nextStatus = st.status === 'Not Activated' ? 'Activated' : 'Not Activated';
    try {
      updateStudent(college.id, st.id, { status: nextStatus });
      toast.success(`Student status toggled to "${nextStatus}"`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to change status.');
    }
  };

  const handleDelete = () => {
    if (!college || !deletingStudent) return;
    try {
      deleteStudent(college.id, deletingStudent.id);
      toast.success(`Student roster removed.`);
      setDeletingStudent(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(st => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = st.studentName.toLowerCase().includes(term) ||
                          st.email.toLowerCase().includes(term) ||
                          (st.rollNo && st.rollNo.toLowerCase().includes(term));
    
    let matchesStatus = true;
    const activeText = st.lastActive || (st.status === 'Activated' ? 'Online Now' : st.status === 'Working' ? '12 mins ago' : 'Yesterday, 4:30 PM');
    if (statusFilter === 'Online Now') {
      matchesStatus = activeText === 'Online Now' || activeText === 'Just now';
    } else if (statusFilter === 'Recent') {
      matchesStatus = activeText.includes('min') || activeText === 'Online Now';
    } else if (statusFilter === 'Inactive') {
      matchesStatus = activeText.includes('Yesterday') || activeText.includes('days ago');
    }
    
    let matchesBranch = true;
    let matchesBatch = true;
    
    if (selectedBranchId !== 'All') {
      const branchBatches = getBranchBatches(selectedBranchId);
      const branchBatchIds = branchBatches.map(b => b.id);
      
      if (selectedBatchId !== 'All') {
        matchesBatch = st.batchId === selectedBatchId;
      } else {
        matchesBranch = branchBatchIds.includes(st.batchId);
      }
    }

    return matchesSearch && matchesStatus && matchesBranch && matchesBatch;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-500" />
              Student Roster Directory
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Browse, search, add students manually or via Excel upload, and view deep-dive analytical scorecards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student Manually</span>
            </button>
            <Link
              href="/branches"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Upload Excel Roster</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Panel */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, email, roll number..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="All">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                disabled={selectedBranchId === 'All'}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              >
                <option value="All">All Batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batchName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-500">Activity filter:</span>
            {(['All', 'Online Now', 'Recent', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          {filteredStudents.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-zinc-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No students matched search criteria</p>
              <p className="text-xs text-zinc-400 mt-1">Try resetting filters or adding a new student.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-w-full">
            <table className="w-full text-xs text-left whitespace-nowrap min-w-[950px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap">Roll No</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Student Name</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Batch No.</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">CGPA</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Registered On</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Last Login</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Student Report</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 whitespace-nowrap">
                {filteredStudents.map((st) => {
                  const regOn = st.registeredOn || '17/07/2026, 11:22 pm';
                  const loginTime = st.lastLogin || '17/07/2026, 11:22 pm';
                  const displayBatch = st.batchName || (st.batchId ? st.batchId.replace('batch-', '').toUpperCase() : 'N/A');

                  return (
                    <tr key={st.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group">
                      <td className="px-5 py-4 font-mono font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {st.rollNo || 'ROLL' + st.id.substring(3, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-zinc-900 dark:text-white whitespace-nowrap">
                        {st.studentName}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-extrabold whitespace-nowrap inline-block shrink-0">
                          {displayBatch}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {st.cgpa.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{st.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300 text-xs whitespace-nowrap">
                        {regOn}
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300 text-xs whitespace-nowrap">
                        {loginTime}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link 
                          href={`/students/${st.id}`} 
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 w-fit shadow-2xs group-hover:scale-105 whitespace-nowrap shrink-0"
                        >
                          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">View Full Report</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(st)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Student"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(st)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Manual Student Addition */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" /> Add Student Manually
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManualAddStudent} className="space-y-4 text-xs">
                {/* Branch & Batch Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Target Branch *
                    </label>
                    <select
                      value={addBranchId}
                      onChange={(e) => setAddBranchId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Target Batch *
                    </label>
                    <select
                      value={addBatchId}
                      onChange={(e) => setAddBatchId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {addBatchesList.length === 0 ? (
                        <option value="">No batches found in branch</option>
                      ) : (
                        addBatchesList.map(b => (
                          <option key={b.id} value={b.id}>{b.batchName}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Roll / Reg Number *
                    </label>
                    <input
                      type="text"
                      value={addRollNo}
                      onChange={(e) => setAddRollNo(e.target.value)}
                      placeholder="e.g. CSE2025099"
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="student@college.edu"
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Academic CGPA *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={addCgpa}
                      onChange={(e) => setAddCgpa(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Initial Status *
                    </label>
                    <select
                      value={addStatus}
                      onChange={(e) => setAddStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      <option value="Activated">Activated</option>
                      <option value="Not Activated">Not Activated</option>
                      <option value="Working">Working</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!addBatchId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Onboard Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Student */}
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Edit Student Details</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Registration / Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Academic CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Delete Student Roster?</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Are you sure you want to delete student <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{deletingStudent.studentName}&quot;</span>?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingStudent(null)}
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
