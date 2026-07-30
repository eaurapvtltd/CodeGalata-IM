'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Student } from '@/lib/types';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, UserX, Mail, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
}

type SortField = 'studentName' | 'cgpa' | 'email' | 'status';
type SortOrder = 'asc' | 'desc';

export function StudentTable({ students }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('studentName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search & Filter
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const term = searchTerm.toLowerCase();
      return (
        st.studentName.toLowerCase().includes(term) ||
        st.email.toLowerCase().includes(term) ||
        st.status.toLowerCase().includes(term) ||
        st.cgpa.toString().includes(term) ||
        (st.batchName && st.batchName.toLowerCase().includes(term)) ||
        (st.batchId && st.batchId.toLowerCase().includes(term))
      );
    });
  }, [students, searchTerm]);

  // Sort
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search student by name, email, CGPA..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          Showing <span className="font-semibold text-zinc-900 dark:text-white">{sortedStudents.length}</span> students
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {paginatedStudents.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <UserX className="w-10 h-10 text-zinc-400 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No students found</p>
            <p className="text-xs text-zinc-400 mt-1">
              {students.length === 0 ? 'Upload an Excel spreadsheet to import students.' : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th 
                    onClick={() => handleSort('studentName')}
                    className="px-6 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Batch No.</th>
                  <th 
                    onClick={() => handleSort('cgpa')}
                    className="px-6 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>CGPA</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="px-6 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Activated</th>
                  <th className="px-6 py-3.5">Registered On</th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Last Login</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Student Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {paginatedStudents.map((st, idx) => {
                  const isActivated = st.status !== 'Not Activated';
                  const regOn = st.registeredOn || '17/07/2026, 11:22 pm';
                  const loginTime = st.lastLogin || '17/07/2026, 11:22 pm';
                  const displayBatch = st.batchName || (st.batchId ? st.batchId.replace('batch-', '').toUpperCase() : 'N/A');

                  return (
                    <tr key={st.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 text-zinc-400 font-mono">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-zinc-900 dark:text-zinc-100">
                        {st.studentName}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
                          {displayBatch}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {st.cgpa.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{st.email}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-zinc-900 dark:text-white text-xs uppercase">
                        {st.role || 'ADMIN'}
                      </td>
                      <td className="px-6 py-4 font-bold text-xs">
                        {isActivated ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yes</span>
                        ) : (
                          <span className="text-rose-500 font-bold">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-700 dark:text-zinc-300 text-xs whitespace-nowrap">
                        {regOn}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-700 dark:text-zinc-300 text-xs whitespace-nowrap">
                        {loginTime}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/students/${st.id}`} 
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 w-fit shadow-2xs hover:scale-105"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>View Full Report</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {sortedStudents.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Page <span className="font-semibold text-zinc-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
