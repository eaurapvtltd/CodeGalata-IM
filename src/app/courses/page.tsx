'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { 
  getCollegeCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getCollegeBranches, 
  getBranchBatches 
} from '@/lib/db';
import { Course, Branch, Batch } from '@/lib/types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  User, 
  Layers, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { college } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  const [isMapCourseOpen, setIsMapCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const [editingCourseForBatches, setEditingCourseForBatches] = useState<Course | null>(null);
  const [selectedBatchesForCourse, setSelectedBatchesForCourse] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('4');
  const [newCourseSemester, setNewCourseSemester] = useState('Sem III');
  const [newCourseBranch, setNewCourseBranch] = useState('CSE');
  const [newCourseInstructor, setNewCourseInstructor] = useState('Dr. K. Raman');

  const loadData = async () => {
    if (!college) return;
    const apiCourses = await apiClient.courses.getAll(college.id);
    if (apiCourses && apiCourses.length > 0) {
      setCourses(apiCourses);
    } else {
      setCourses(getCollegeCourses(college.id));
    }
    const brList = getCollegeBranches(college.id);
    setBranches(brList);
    if (brList.length > 0 && !newCourseBranch) {
      setNewCourseBranch(brList[0].branchName);
    }
  };

  useEffect(() => {
    loadData();
  }, [college]);

  const openAddCourseModal = () => {
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewCourseCredits('4');
    setNewCourseSemester('Sem III');
    setNewCourseInstructor('Dr. K. Raman');
    if (branches.length > 0) {
      setNewCourseBranch(branches[0].branchName);
    } else {
      setNewCourseBranch('CSE');
    }
    setIsMapCourseOpen(true);
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !newCourseCode.trim() || !newCourseTitle.trim()) {
      toast.error('Please enter Course Code and Course Title.');
      return;
    }

    try {
      const created = createCourse(college.id, {
        code: newCourseCode.trim(),
        title: newCourseTitle.trim(),
        credits: parseInt(newCourseCredits, 10) || 4,
        semester: newCourseSemester,
        branchCode: newCourseBranch,
        instructor: newCourseInstructor.trim() || 'Dr. K. Raman',
        mappedBatches: [`${newCourseBranch}-A`],
      });

      toast.success(`Mapped Course "${created.title}" (${created.code}) to ${created.branchCode}!`);
      setIsMapCourseOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course');
    }
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setNewCourseCode(course.code);
    setNewCourseTitle(course.title);
    setNewCourseCredits(String(course.credits));
    setNewCourseSemester(course.semester);
    setNewCourseBranch(course.branchCode);
    setNewCourseInstructor(course.instructor);
  };

  const handleUpdateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !editingCourse) return;

    try {
      updateCourse(college.id, editingCourse.id, {
        code: newCourseCode.trim().toUpperCase(),
        title: newCourseTitle.trim(),
        credits: parseInt(newCourseCredits, 10) || 4,
        semester: newCourseSemester,
        branchCode: newCourseBranch,
        instructor: newCourseInstructor.trim(),
      });

      toast.success(`Updated Course "${newCourseTitle}"!`);
      setEditingCourse(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = () => {
    if (!college || !deletingCourse) return;
    try {
      deleteCourse(college.id, deletingCourse.id);
      toast.success(`Deleted course "${deletingCourse.title}".`);
      setDeletingCourse(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const openMapBatchesModal = (course: Course) => {
    setEditingCourseForBatches(course);
    setSelectedBatchesForCourse(course.mappedBatches || []);

    if (college) {
      const br = branches.find(b => b.branchName.toLowerCase() === course.branchCode.toLowerCase());
      if (br) {
        setAvailableBatches(getBranchBatches(br.id));
      } else {
        setAvailableBatches([]);
      }
    }
  };

  const handleToggleBatchSelection = (batchName: string) => {
    if (selectedBatchesForCourse.includes(batchName)) {
      setSelectedBatchesForCourse(selectedBatchesForCourse.filter(b => b !== batchName));
    } else {
      setSelectedBatchesForCourse([...selectedBatchesForCourse, batchName]);
    }
  };

  const handleSaveBatchMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !editingCourseForBatches) return;

    try {
      updateCourse(college.id, editingCourseForBatches.id, {
        mappedBatches: selectedBatchesForCourse,
      });

      toast.success(`Updated batch mapping for ${editingCourseForBatches.code}!`);
      setEditingCourseForBatches(null);
      loadData();
    } catch (err: any) {
      toast.error('Failed to update batch mapping');
    }
  };

  // Filter Courses
  const filteredCourses = courses.filter((crs) => {
    const matchesBranch = selectedBranchFilter === 'ALL' || crs.branchCode.toLowerCase() === selectedBranchFilter.toLowerCase();
    const matchesSearch =
      crs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crs.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crs.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-emerald-500" />
              Academic Course Catalog & Mapping
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage department courses, syllabus credits, semester allocation, and batch enrollment mapping.
            </p>
          </div>

          <button
            onClick={openAddCourseModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Map New Course</span>
          </button>
        </div>

        {/* Search & Branch Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course code, title, instructor..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">Filter Branch:</span>
              <button
                onClick={() => setSelectedBranchFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  selectedBranchFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                All Departments
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranchFilter(b.branchName)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    selectedBranchFilter.toLowerCase() === b.branchName.toLowerCase()
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {b.branchName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full py-16 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <BookOpen className="w-12 h-12 text-zinc-400 mb-3 opacity-50" />
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base">No courses found</h3>
              <p className="text-xs text-zinc-400 mt-1">Try resetting search criteria or map a new course.</p>
            </div>
          ) : (
            filteredCourses.map((crs) => (
              <div
                key={crs.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-extrabold">
                      {crs.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {crs.credits} Credits &bull; {crs.semester}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditCourseModal(crs)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCourse(crs)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {crs.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{crs.instructor}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">Mapped Batches</span>
                    <button
                      onClick={() => openMapBatchesModal(crs)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-[11px] flex items-center gap-1"
                    >
                      <span>Manage Batches</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {crs.mappedBatches.length === 0 ? (
                      <span className="text-xs text-zinc-400 italic">No batches mapped</span>
                    ) : (
                      crs.mappedBatches.map((bName) => (
                        <span
                          key={bName}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          {bName}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      {crs.studentCount || 30} Students Enrolled
                    </span>
                    <span className="text-emerald-500 font-bold">{crs.branchCode} Department</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Map New Course */}
        {isMapCourseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" /> Map New Course
                </h3>
                <button onClick={() => setIsMapCourseOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-301"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Department Branch *
                    </label>
                    <select
                      value={newCourseBranch}
                      onChange={(e) => setNewCourseBranch(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.branchName}>
                          {b.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems & Kernel Architecture"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Credits *
                    </label>
                    <input
                      type="number"
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Semester *
                    </label>
                    <input
                      type="text"
                      value={newCourseSemester}
                      onChange={(e) => setNewCourseSemester(e.target.value)}
                      placeholder="Sem III"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Assigned Lead Instructor
                  </label>
                  <input
                    type="text"
                    value={newCourseInstructor}
                    onChange={(e) => setNewCourseInstructor(e.target.value)}
                    placeholder="Dr. K. Raman"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMapCourseOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Map Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Course */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-500" /> Edit Course
                </h3>
                <button onClick={() => setEditingCourse(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCourseSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Course Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Branch
                    </label>
                    <select
                      value={newCourseBranch}
                      onChange={(e) => setNewCourseBranch(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.branchName}>
                          {b.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={newCourseSemester}
                      onChange={(e) => setNewCourseSemester(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Lead Instructor
                  </label>
                  <input
                    type="text"
                    value={newCourseInstructor}
                    onChange={(e) => setNewCourseInstructor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Map Batches to Course */}
        {editingCourseForBatches && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" /> Map Batches to Course
                  </h3>
                  <p className="text-xs text-emerald-500 font-mono font-bold mt-0.5">
                    {editingCourseForBatches.code} - {editingCourseForBatches.title}
                  </p>
                </div>
                <button onClick={() => setEditingCourseForBatches(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBatchMappingSubmit} className="space-y-4 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Select student batches in <strong className="text-zinc-900 dark:text-white">{editingCourseForBatches.branchCode}</strong> department to enroll in this course:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(availableBatches.length > 0 ? availableBatches.map(b => b.batchName) : [`${editingCourseForBatches.branchCode}-A`, `${editingCourseForBatches.branchCode}-B`]).map((bName) => {
                    const isChecked = selectedBatchesForCourse.includes(bName);
                    return (
                      <div
                        key={bName}
                        onClick={() => handleToggleBatchSelection(bName)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-zinc-900 dark:text-white font-extrabold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span>Batch {bName}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Enrolled Roster</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCourseForBatches(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Save Batch Mapping
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Course */}
        {deletingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Delete Course Mapping?</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to delete course <strong className="text-zinc-800 dark:text-zinc-200">&quot;{deletingCourse.title}&quot;</strong> ({deletingCourse.code})?
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingCourse(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
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
