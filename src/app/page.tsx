'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { 
  GitBranch, 
  BookOpen, 
  Plus, 
  Users, 
  ArrowLeft, 
  Upload, 
  UserPlus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  FileSpreadsheet,
  X,
  FileText,
  BarChart2,
  Building2,
  Edit3,
  Menu,
  Check,
  FileType,
  Clock,
  Trash2,
  Pencil
} from 'lucide-react';

interface StudentRosterItem {
  id: string;
  rollNo: string;
  name: string;
  cgpa: string;
  email: string;
  status: 'Activated' | 'Working' | 'Not Activated';
  lastActivated: string;
}

interface BranchCard {
  id: string;
  code: string;
  name: string;
  description: string;
  batchesCount: number;
  studentsCount: number;
  batches: { name: string; count: number }[];
}

interface CourseItem {
  id: string;
  code: string;
  title: string;
  credits: number;
  semester: string;
  branchCode: string;
  instructor: string;
  mappedBatches: string[];
  studentCount: number;
}

export default function UnifiedBranchesCoursesApp() {
  const [activeTab, setActiveTab] = useState<'BRANCHES' | 'COURSES'>('BRANCHES');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string>('CSE-A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseBranchFilter, setSelectedCourseBranchFilter] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Responsive Sidebar States
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 3-Dots Dropdown State for Branch Cards
  const [activeBranchMenuId, setActiveBranchMenuId] = useState<string | null>(null);

  // Edit & Delete Branch Modal States
  const [editingBranch, setEditingBranch] = useState<BranchCard | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchCard | null>(null);

  // Modals state
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isUploadExcelOpen, setIsUploadExcelOpen] = useState(false);
  const [isUploadCsvOpen, setIsUploadCsvOpen] = useState(false);
  const [isMapCourseOpen, setIsMapCourseOpen] = useState(false);

  // Map Batches Modal state
  const [editingCourseForBatches, setEditingCourseForBatches] = useState<CourseItem | null>(null);
  const [selectedBatchesForCourse, setSelectedBatchesForCourse] = useState<string[]>([]);

  // Form states for Branch Add & Edit
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDesc, setNewBranchDesc] = useState('');
  const [newBatchName, setNewBatchName] = useState('');

  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [studentCgpaInput, setStudentCgpaInput] = useState('8.50');

  // Form states for Course
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('4');
  const [newCourseSemester, setNewCourseSemester] = useState('Sem III');
  const [newCourseBranch, setNewCourseBranch] = useState('CSE');
  const [newCourseInstructor, setNewCourseInstructor] = useState('Dr. K. Raman');
  const [newCourseBatch, setNewCourseBatch] = useState('CSE-A');

  // Initial Branches Data (Matching Reference Screenshot 1)
  const [branches, setBranches] = useState<BranchCard[]>([
    {
      id: 'br-cse',
      code: 'CSE',
      name: 'CSE',
      description: 'Department of CSE Engineering',
      batchesCount: 2,
      studentsCount: 4,
      batches: [
        { name: 'CSE-A', count: 3 },
        { name: 'CSE-B', count: 1 },
        { name: 'CSE-C', count: 0 },
      ],
    },
    {
      id: 'br-ai',
      code: 'AI',
      name: 'AI',
      description: 'Department of AI Engineering',
      batchesCount: 1,
      studentsCount: 0,
      batches: [{ name: 'AI-1', count: 0 }],
    },
    {
      id: 'br-aiml',
      code: 'AIM',
      name: 'AIML',
      description: 'Department of AIML Engineering',
      batchesCount: 1,
      studentsCount: 0,
      batches: [{ name: 'AIML-1', count: 0 }],
    },
    {
      id: 'br-ece',
      code: 'ECE',
      name: 'ECE',
      description: 'Department of ECE Engineering',
      batchesCount: 1,
      studentsCount: 0,
      batches: [{ name: 'ECE-A', count: 0 }],
    },
    {
      id: 'br-eee',
      code: 'EEE',
      name: 'EEE',
      description: 'Department of EEE Engineering',
      batchesCount: 0,
      studentsCount: 0,
      batches: [],
    },
    {
      id: 'br-mec',
      code: 'MEC',
      name: 'Mechanical',
      description: 'Department of Mechanical Engineering',
      batchesCount: 0,
      studentsCount: 0,
      batches: [],
    },
    {
      id: 'br-civ',
      code: 'CIV',
      name: 'Civil',
      description: 'Department of Civil Engineering',
      batchesCount: 0,
      studentsCount: 0,
      batches: [],
    },
  ]);

  // Initial Student Directory per Batch
  const [students, setStudents] = useState<StudentRosterItem[]>([
    { id: '1', rollNo: '1', name: 'Aarav Sharma', cgpa: '8.90', email: 'aarav@cgit.edu', status: 'Activated', lastActivated: '2 mins ago' },
    { id: '2', rollNo: '2', name: 'Diya Patel', cgpa: '9.40', email: 'diya@cgit.edu', status: 'Working', lastActivated: '18 mins ago' },
    { id: '3', rollNo: '3', name: 'Rohan Verma', cgpa: '7.80', email: 'rohan@cgit.edu', status: 'Not Activated', lastActivated: 'Never' },
  ]);

  // Initial Courses Data
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: 'crs-101',
      code: 'CS-301',
      title: 'Data Structures & Algorithms in C++',
      credits: 4,
      semester: 'Sem III',
      branchCode: 'CSE',
      instructor: 'Dr. K. Raman',
      mappedBatches: ['CSE-A', 'CSE-B'],
      studentCount: 64,
    },
    {
      id: 'crs-102',
      code: 'CS-304',
      title: 'Object-Oriented Software Design',
      credits: 3,
      semester: 'Sem IV',
      branchCode: 'CSE',
      instructor: 'Prof. S. Varma',
      mappedBatches: ['CSE-A'],
      studentCount: 32,
    },
    {
      id: 'crs-103',
      code: 'AI-201',
      title: 'Deep Learning & Neural Networks',
      credits: 4,
      semester: 'Sem V',
      branchCode: 'AI',
      instructor: 'Prof. Arvind Raman',
      mappedBatches: ['AI-1'],
      studentCount: 45,
    },
    {
      id: 'crs-104',
      code: 'ML-302',
      title: 'Statistical Machine Learning Patterns',
      credits: 4,
      semester: 'Sem V',
      branchCode: 'AIML',
      instructor: 'Dr. S. Sundaram',
      mappedBatches: ['AIML-1'],
      studentCount: 40,
    },
    {
      id: 'crs-105',
      code: 'ECE-202',
      title: 'Embedded Systems & Microcontrollers',
      credits: 4,
      semester: 'Sem IV',
      branchCode: 'ECE',
      instructor: 'Prof. M. Anitha',
      mappedBatches: ['ECE-A'],
      studentCount: 50,
    },
  ]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchCode || !newBranchName) return;

    const newBr: BranchCard = {
      id: `br-${Date.now()}`,
      code: newBranchCode.toUpperCase(),
      name: newBranchName,
      description: newBranchDesc || `Department of ${newBranchName} Engineering`,
      batchesCount: 0,
      studentsCount: 0,
      batches: [],
    };

    setBranches([...branches, newBr]);
    setIsAddBranchOpen(false);
    setNewBranchCode('');
    setNewBranchName('');
    setNewBranchDesc('');
    triggerToast(`Added Academic Branch "${newBr.name}" (${newBr.code})`);
  };

  // OPEN EDIT BRANCH MODAL
  const handleOpenEditBranch = (b: BranchCard) => {
    setActiveBranchMenuId(null);
    setEditingBranch(b);
    setNewBranchCode(b.code);
    setNewBranchName(b.name);
    setNewBranchDesc(b.description);
  };

  // SUBMIT EDIT BRANCH
  const handleSaveEditBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !newBranchCode || !newBranchName) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              code: newBranchCode.toUpperCase(),
              name: newBranchName,
              description: newBranchDesc || b.description,
            }
          : b
      )
    );

    triggerToast(`Updated branch "${newBranchName}" (${newBranchCode.toUpperCase()})`);
    setEditingBranch(null);
    setNewBranchCode('');
    setNewBranchName('');
    setNewBranchDesc('');
  };

  // CONFIRM DELETE BRANCH
  const handleConfirmDeleteBranch = () => {
    if (!deletingBranch) return;

    setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
    triggerToast(`Deleted branch "${deletingBranch.name}" (${deletingBranch.code})`);
    setDeletingBranch(null);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || !activeBranch) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === activeBranch.id
          ? {
              ...b,
              batchesCount: b.batchesCount + 1,
              batches: [...b.batches, { name: newBatchName, count: 0 }],
            }
          : b
      )
    );

    setSelectedBatchName(newBatchName);
    setIsCreateBatchOpen(false);
    setNewBatchName('');
    triggerToast(`Created Batch "${newBatchName}" in ${activeBranch.name}`);
  };

  const handleAddStudentManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameInput || !studentEmailInput) return;

    const newStu: StudentRosterItem = {
      id: String(Date.now()),
      rollNo: String(students.length + 1),
      name: studentNameInput,
      cgpa: studentCgpaInput || '8.50',
      email: studentEmailInput,
      status: 'Activated',
      lastActivated: 'Just now',
    };

    setStudents([...students, newStu]);
    setIsAddStudentOpen(false);
    setStudentNameInput('');
    setStudentEmailInput('');
    triggerToast(`Enrolled student "${newStu.name}" to ${selectedBatchName}!`);
  };

  const handleUploadExcel = () => {
    triggerToast(`Excel (.xlsx) file parsed! Enrolled 5 students to ${selectedBatchName}.`);
    setIsUploadExcelOpen(false);
  };

  const handleUploadCsv = () => {
    triggerToast(`CSV (.csv) file parsed! Enrolled 4 students to ${selectedBatchName}.`);
    setIsUploadCsvOpen(false);
  };

  const handleMapCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    const newCourse: CourseItem = {
      id: String(Date.now()),
      code: newCourseCode.toUpperCase(),
      title: newCourseTitle,
      credits: parseInt(newCourseCredits, 10) || 4,
      semester: newCourseSemester,
      branchCode: newCourseBranch,
      instructor: newCourseInstructor,
      mappedBatches: [newCourseBatch],
      studentCount: 30,
    };

    setCourses([newCourse, ...courses]);
    setIsMapCourseOpen(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    triggerToast(`Mapped Course "${newCourse.title}" (${newCourse.code}) to ${newCourse.branchCode}`);
  };

  const handleOpenMapBatchesModal = (course: CourseItem) => {
    setEditingCourseForBatches(course);
    setSelectedBatchesForCourse(course.mappedBatches);
  };

  const handleToggleBatchSelection = (batchName: string) => {
    if (selectedBatchesForCourse.includes(batchName)) {
      setSelectedBatchesForCourse(selectedBatchesForCourse.filter((b) => b !== batchName));
    } else {
      setSelectedBatchesForCourse([...selectedBatchesForCourse, batchName]);
    }
  };

  const handleSaveBatchMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseForBatches) return;

    setCourses((prev) =>
      prev.map((c) =>
        c.id === editingCourseForBatches.id
          ? { ...c, mappedBatches: selectedBatchesForCourse }
          : c
      )
    );

    triggerToast(
      `Updated batch mapping for ${editingCourseForBatches.code}: ${
        selectedBatchesForCourse.join(', ') || 'None'
      }`
    );
    setEditingCourseForBatches(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cgpa.includes(searchQuery) ||
      s.lastActivated.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter((crs) => {
    const matchesBranch = selectedCourseBranchFilter === 'ALL' || crs.branchCode === selectedCourseBranchFilter;
    const matchesSearch =
      crs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crs.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crs.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  return (
    <div
      onClick={() => setActiveBranchMenuId(null)}
      className="flex min-h-screen bg-[#F8FAFC]"
    >
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setSelectedBranchId(null);
        }}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Responsive Body */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full ${
          isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobileSidebar(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                {activeTab === 'BRANCHES' && <GitBranch className="w-5 h-5 text-[#16A34A]" />}
                {activeTab === 'COURSES' && <BookOpen className="w-5 h-5 text-[#16A34A]" />}
                <span>
                  {activeTab === 'BRANCHES' && 'Branches'}
                  {activeTab === 'COURSES' && 'Courses'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Super Admin Control Panel • Connected Management System
              </p>
            </div>
          </div>

          <span className="bg-[#E8F8EF] border border-[#bbf7d0] text-[#16A34A] font-mono text-xs font-extrabold px-3 py-1 rounded-full uppercase hidden sm:inline-block">
            SUPER ADMIN MODE
          </span>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">

          {/* TAB 1: BRANCHES */}
          {activeTab === 'BRANCHES' && (
            <>
              {/* VIEW 1A: BRANCHES GRID (Matching Reference Screenshot 1) */}
              {!selectedBranchId ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <GitBranch className="w-6 h-6 text-[#16A34A]" /> Branches
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Select a branch to manage batches, or add new academic departments dynamically.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setNewBranchCode('');
                        setNewBranchName('');
                        setNewBranchDesc('');
                        setIsAddBranchOpen(true);
                      }}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#16A34A]/25 flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add New Branch
                    </button>
                  </div>

                  {/* Branch Cards Grid (7 Cards matching Screenshot 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#16A34A]/40 cursor-pointer transition-all space-y-4 group relative"
                      >
                        {/* Top Row: Code Pill Badge & 3-dots Menu */}
                        <div className="flex items-center justify-between relative">
                          <span className="bg-[#E8F8EF] border border-[#bbf7d0] text-[#16A34A] font-mono font-extrabold text-xs px-3 py-1 rounded-lg">
                            {b.code}
                          </span>

                          {/* 3-DOTS BUTTON WITH DROPDOWN MENU */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBranchMenuId(activeBranchMenuId === b.id ? null : b.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                              title="Branch Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* DROPDOWN MENU: EDIT & DELETE */}
                            {activeBranchMenuId === b.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-7 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 font-mono text-xs animate-in fade-in-50 zoom-in-95"
                              >
                                <button
                                  onClick={() => handleOpenEditBranch(b)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-bold transition-all text-left"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Edit Branch</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveBranchMenuId(null);
                                    setDeletingBranch(b);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-all text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  <span>Delete Branch</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name & Description */}
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#16A34A] transition-colors">
                            {b.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {b.description}
                          </p>
                        </div>

                        {/* Footer: Batches & Students Metrics */}
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-600 font-bold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#16A34A]" /> {b.batchesCount} Batches
                          </span>

                          <span className="text-slate-600 font-bold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#16A34A]" /> {b.studentsCount} Students
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* VIEW 1B: DEPARTMENT DETAIL & BATCH ROSTER (Matching Screenshot 2 + LAST ACTIVATED column) */
                <div className="space-y-6">
                  {/* Back Link & Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <button
                        onClick={() => setSelectedBranchId(null)}
                        className="text-xs font-mono font-bold text-slate-500 hover:text-[#16A34A] flex items-center gap-1 mb-1 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Branches
                      </button>

                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {activeBranch?.name} Department
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Manage batches and student rosters for {activeBranch?.name} Engineering.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreateBatchOpen(true)}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#16A34A]/25 flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Create Batch
                    </button>
                  </div>

                  {/* Batch Switcher Bar */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm flex items-center gap-2 overflow-x-auto">
                    {activeBranch?.batches.map((batch) => {
                      const isSelected = selectedBatchName === batch.name;
                      return (
                        <button
                          key={batch.name}
                          onClick={() => setSelectedBatchName(batch.name)}
                          className={`px-4 py-1.5 rounded-full font-mono text-xs font-extrabold flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-[#16A34A] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{batch.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {batch.count || (batch.name === 'CSE-A' ? 3 : 1)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Batch Header Card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-extrabold text-slate-900">Batch {selectedBatchName}</h3>
                        <span className="bg-[#E8F8EF] border border-[#bbf7d0] text-[#16A34A] font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {students.length} Enrolled Students
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Onboard students manually or upload an Excel (.xlsx) / CSV (.csv) spreadsheet.
                      </p>
                    </div>

                    {/* Action Buttons: Add Manually, Upload Excel, Upload CSV */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md shadow-[#16A34A]/25 flex items-center gap-1.5 transition-all transform active:scale-95"
                      >
                        <UserPlus className="w-4 h-4" /> Add Student Manually
                      </button>

                      <button
                        onClick={() => setIsUploadExcelOpen(true)}
                        className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" /> Upload Excel (.xlsx)
                      </button>

                      <button
                        onClick={() => setIsUploadCsvOpen(true)}
                        className="bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                      >
                        <FileType className="w-4 h-4 text-sky-200" /> Upload CSV (.csv)
                      </button>
                    </div>
                  </div>

                  {/* Search & Enrolled Student Directory Table (with LAST ACTIVATED column) */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search student by name, email, CGPA, active time..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-[#16A34A] transition-all"
                        />
                      </div>

                      <span className="font-mono text-xs text-slate-400 font-semibold">
                        Showing {filteredStudents.length} students
                      </span>
                    </div>

                    {/* Student Directory Table with LAST ACTIVATED */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">STUDENT NAME ⇅</th>
                            <th className="py-3 px-4">CGPA ⇅</th>
                            <th className="py-3 px-4">EMAIL ⇅</th>
                            <th className="py-3 px-4">STATUS ⇅</th>
                            <th className="py-3 px-4">LAST ACTIVATED ⇅</th>
                            <th className="py-3 px-4">STUDENT REPORT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map((s, idx) => (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3.5 px-4 font-extrabold text-slate-900">{s.name}</td>
                              <td className="py-3.5 px-4 font-extrabold text-[#16A34A]">{s.cgpa}</td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">{s.email}</td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full ${
                                    s.status === 'Activated'
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : s.status === 'Working'
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-600">
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {s.lastActivated}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => triggerToast(`Opening student report for ${s.name}...`)}
                                  className="bg-[#E8F8EF] hover:bg-[#bbf7d0] text-[#16A34A] border border-[#bbf7d0] font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1 transition-all"
                                >
                                  <BarChart2 className="w-3 h-3" /> View Full Report
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-mono text-slate-500">
                      <span>Page 1 of 1</span>
                      <div className="flex items-center gap-1">
                        <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                          &lt;
                        </button>
                        <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                          &gt;
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: COURSES */}
          {activeTab === 'COURSES' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <BookOpen className="w-6 h-6 text-[#16A34A]" /> Courses
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Manage course codes, credit allocations, semesters, and target branch mappings.
                  </p>
                </div>

                <button
                  onClick={() => setIsMapCourseOpen(true)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#16A34A]/25 flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Map New Course
                </button>
              </div>

              {/* Main Container Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Search & Branch Filter Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  
                  {/* Branch Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto font-mono text-xs">
                    <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Filter Branch:</span>
                    {['ALL', 'CSE', 'AI', 'AIML', 'ECE', 'EEE', 'MEC', 'CIV'].map((code) => (
                      <button
                        key={code}
                        onClick={() => setSelectedCourseBranchFilter(code)}
                        className={`px-3 py-1 rounded-full font-extrabold text-[11px] transition-all ${
                          selectedCourseBranchFilter === code
                            ? 'bg-[#16A34A] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>

                  {/* Search Box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search course code, title, instructor..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium outline-none focus:border-[#16A34A] transition-all"
                    />
                  </div>

                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((crs) => (
                    <div
                      key={crs.id}
                      className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 hover:bg-white hover:shadow-md transition-all group"
                    >
                      {/* Top Row: Course Code, Credits, Semester, Branch Badge */}
                      <div className="flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                            {crs.code}
                          </span>
                          <span className="text-slate-500 font-bold">
                            {crs.credits} Credits • {crs.semester}
                          </span>
                        </div>

                        <span className="bg-[#E8F8EF] text-[#16A34A] border border-[#bbf7d0] font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase">
                          {crs.branchCode}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-[#16A34A] transition-colors">
                        {crs.title}
                      </h3>

                      {/* Instructor & Mapped Batches */}
                      <div className="text-xs text-slate-600 font-mono space-y-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold">Assigned Instructor:</span>
                          <span className="font-bold text-slate-800">{crs.instructor}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold">Mapped Batches:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {crs.mappedBatches.length > 0 ? (
                              crs.mappedBatches.map((b) => (
                                <span key={b} className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-md">
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No batches mapped</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer: Enrolled Count + Action Button */}
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between font-mono text-xs">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{crs.studentCount}</strong> Enrolled Students
                        </span>

                        <button
                          onClick={() => handleOpenMapBatchesModal(crs)}
                          className="bg-[#E8F8EF] hover:bg-[#bbf7d0] text-[#16A34A] border border-[#bbf7d0] font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Map Batches
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT BRANCH MODAL */}
      {editingBranch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" /> Edit Academic Branch
              </h3>
              <button onClick={() => setEditingBranch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBranch} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Branch Code (e.g. CSE, IT)</label>
                <input
                  type="text"
                  required
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Branch / Department Name</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Description</label>
                <input
                  type="text"
                  value={newBranchDesc}
                  onChange={(e) => setNewBranchDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BRANCH CONFIRMATION MODAL */}
      {deletingBranch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" /> Delete Academic Branch
              </h3>
              <button onClick={() => setDeletingBranch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs text-slate-600">
              <p>
                Are you sure you want to delete the branch <strong className="text-slate-900">{deletingBranch.name} ({deletingBranch.code})</strong>?
              </p>
              <p className="text-red-500 font-semibold text-[11px]">
                This action cannot be undone and will remove associated batches from the branch grid.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBranch}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BRANCH MODAL */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-[#16A34A]" /> Add New Academic Branch
              </h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Branch Code (e.g. IT, MECH, CIV)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., IT"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Information Technology"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Department of IT Engineering"
                  value={newBranchDesc}
                  onChange={(e) => setNewBranchDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#16A34A]" /> Create New Batch
              </h3>
              <button onClick={() => setIsCreateBatchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Batch Name (e.g. CSE-C, AI-2)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CSE-C"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MANUALLY MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#16A34A]" /> Onboard Student Manually
              </h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentManually} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Aarav Sharma"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., aarav@cgit.edu"
                  value={studentEmailInput}
                  onChange={(e) => setStudentEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">CGPA</label>
                <input
                  type="text"
                  value={studentCgpaInput}
                  onChange={(e) => setStudentCgpaInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Onboard Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD EXCEL / CSV MODAL */}
      {isUploadExcelOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Upload Excel Spreadsheet (.xlsx)
              </h3>
              <button onClick={() => setIsUploadExcelOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50">
              <Upload className="w-8 h-8 text-[#16A34A] mx-auto" />
              <p className="font-mono text-xs font-bold text-slate-800">
                Drag and drop student roster (.xlsx)
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                Supported columns: Name, Email, CGPA, RollNo
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadExcelOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadExcel}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white font-mono font-extrabold text-xs shadow-md"
              >
                Upload Excel Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD CSV MODAL */}
      {isUploadCsvOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileType className="w-5 h-5 text-sky-600" /> Upload CSV File (.csv)
              </h3>
              <button onClick={() => setIsUploadCsvOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-sky-200 rounded-2xl p-6 text-center space-y-2 bg-sky-50/30">
              <FileType className="w-8 h-8 text-sky-600 mx-auto" />
              <p className="font-mono text-xs font-bold text-slate-800">
                Drag and drop student roster (.csv)
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                Format: Student Name, Email, CGPA, RollNo
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadCsvOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCsv}
                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-mono font-extrabold text-xs shadow-md"
              >
                Upload CSV Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP COURSE MODAL */}
      {isMapCourseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#16A34A]" /> Map New Course to Branch
              </h3>
              <button onClick={() => setIsMapCourseOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMapCourseSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CS-305"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Target Branch</label>
                  <select
                    value={newCourseBranch}
                    onChange={(e) => setNewCourseBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Operating Systems & Kernel Architecture"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Credits</label>
                  <input
                    type="number"
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Semester</label>
                  <input
                    type="text"
                    value={newCourseSemester}
                    onChange={(e) => setNewCourseSemester(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Target Batch</label>
                  <input
                    type="text"
                    value={newCourseBatch}
                    onChange={(e) => setNewCourseBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Assigned Lead Instructor</label>
                <input
                  type="text"
                  value={newCourseInstructor}
                  onChange={(e) => setNewCourseInstructor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMapCourseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Map Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAP BATCHES TO COURSE MODAL */}
      {editingCourseForBatches && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#16A34A]" /> Map Batches to Course
                </h3>
                <p className="text-xs text-[#16A34A] font-mono font-bold mt-0.5">
                  {editingCourseForBatches.code} - {editingCourseForBatches.title}
                </p>
              </div>
              <button onClick={() => setEditingCourseForBatches(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchMappingSubmit} className="space-y-4 font-mono text-xs">
              <p className="text-slate-600">
                Select student batches in <strong className="text-slate-900">{editingCourseForBatches.branchCode}</strong> department to enroll in this course:
              </p>

              {/* Batches Checkbox List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(
                  branches.find((b) => b.code === editingCourseForBatches.branchCode)?.batches || [
                    { name: `${editingCourseForBatches.branchCode}-A`, count: 3 },
                    { name: `${editingCourseForBatches.branchCode}-B`, count: 1 },
                  ]
                ).map((bItem) => {
                  const isChecked = selectedBatchesForCourse.includes(bItem.name);
                  return (
                    <div
                      key={bItem.name}
                      onClick={() => handleToggleBatchSelection(bItem.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-[#16A34A] bg-[#E8F8EF] text-slate-900 shadow-2xs font-extrabold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-slate-300 bg-white'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span>Batch {bItem.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Enrolled Roster</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourseForBatches(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow-md shadow-[#16A34A]/25"
                >
                  Save Batch Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#0B192C] text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border-l-4 border-[#16A34A] z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
