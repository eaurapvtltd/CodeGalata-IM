import { 
  College, 
  Branch, 
  Batch, 
  Student, 
  Problem, 
  Activity, 
  DashboardStats,
  Assignment,
  Contest,
  ContestLeaderboardEntry,
  TimedPractice,
  ActivityLog,
  CollegeSettings,
  StudentTopicStat,
  StudentSubmissionRecord,
  FacultyMember,
  FacultyChatMessage
} from './types';

// Storage keys
const STORAGE_KEYS = {
  COLLEGES: 'cg_colleges',
  BRANCHES: 'cg_branches',
  BATCHES: 'cg_batches',
  STUDENTS: 'cg_students',
  PROBLEMS: 'cg_problems',
  ACTIVITIES: 'cg_activities',
  ASSIGNMENTS: 'cg_assignments',
  CONTESTS: 'cg_contests',
  PRACTICE: 'cg_practice',
  LOGS: 'cg_logs',
  SETTINGS: 'cg_settings',
  FACULTY: 'cg_faculty',
  FACULTY_MESSAGES: 'cg_faculty_messages',
};

// Default static branch names required
export const STATIC_BRANCHES = ['CSE', 'AI', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'];

// Helper to hash password securely (SHA-256 string)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_cg_salt_2026");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Low-level helper methods
function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

// Audit logger
export function logAdminActivity(
  collegeId: string, 
  type: ActivityLog['type'], 
  action: string, 
  description: string,
  adminEmail: string = 'admin@cgit.edu'
): void {
  const logs = getStoredItem<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
  const newLog: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    type,
    action,
    description,
    adminEmail,
    timestamp: new Date().toISOString(),
  };
  setStoredItem(STORAGE_KEYS.LOGS, [newLog, ...logs]);
  logActivity(collegeId, 'problem_created', description);
}

export function logActivity(collegeId: string, type: Activity['type'], description: string): void {
  const activities = getStoredItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
  const newActivity: Activity = {
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    type,
    description,
    timestamp: new Date().toISOString(),
  };
  setStoredItem(STORAGE_KEYS.ACTIVITIES, [newActivity, ...activities]);
}

// Initial demo seed if completely empty
export function seedInitialDataIfNeeded(): void {
  if (typeof window === 'undefined') return;
  
  const colleges = getStoredItem<College[]>(STORAGE_KEYS.COLLEGES, []);
  if (colleges.length === 0) {
    const demoId = 'demo-college-id';
    const demoCollege: College = {
      id: demoId,
      collegeName: 'Code Galatta Institute of Technology',
      collegeEmail: 'admin@cgit.edu',
      password: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // dummy hash
      createdAt: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.COLLEGES, [demoCollege]);

    // Seed static branches for demo college
    const branches: Branch[] = STATIC_BRANCHES.map(b => ({
      id: `br-${demoId}-${b.toLowerCase()}`,
      collegeId: demoId,
      branchName: b,
    }));
    setStoredItem(STORAGE_KEYS.BRANCHES, branches);

    // Seed demo batches
    const cseBranchId = branches.find(b => b.branchName === 'CSE')?.id || branches[0].id;
    const aiBranchId = branches.find(b => b.branchName === 'AI')?.id || branches[1].id;
    const demoBatches: Batch[] = [
      { id: 'batch-cse-a', branchId: cseBranchId, batchName: 'CSE-A', createdAt: new Date().toISOString() },
      { id: 'batch-cse-b', branchId: cseBranchId, batchName: 'CSE-B', createdAt: new Date().toISOString() },
      { id: 'batch-ai-a', branchId: aiBranchId, batchName: 'AI-A', createdAt: new Date().toISOString() },
    ];
    setStoredItem(STORAGE_KEYS.BATCHES, demoBatches);

    // Seed demo students
    const demoStudents: Student[] = [
      { id: 'st-1', batchId: 'batch-cse-a', studentName: 'Aarav Sharma', cgpa: 8.9, email: 'aarav@cgit.edu', role: 'ADMIN', status: 'Activated', lastActive: 'Online Now', registeredOn: '17/07/2026, 11:22 pm', lastLogin: '17/07/2026, 11:22 pm', createdAt: new Date().toISOString(), rollNo: 'CSE2025001', phone: '9876543210', attendancePct: 88, solvedProblemsCount: 24, activityLogs: [{ action: 'Solved Two Sum', timestamp: new Date().toISOString() }] },
      { id: 'st-2', batchId: 'batch-cse-a', studentName: 'Diya Patel', cgpa: 9.4, email: 'diya@cgit.edu', role: 'ADMIN', status: 'Activated', lastActive: '12 mins ago', registeredOn: '17/07/2026, 11:13 pm', lastLogin: '17/07/2026, 11:13 pm', createdAt: new Date().toISOString(), rollNo: 'CSE2025002', phone: '9876543211', attendancePct: 94, solvedProblemsCount: 42, activityLogs: [{ action: 'Solved Longest Substring', timestamp: new Date().toISOString() }] },
      { id: 'st-3', batchId: 'batch-cse-a', studentName: 'Rohan Verma', cgpa: 7.8, email: 'rohan@cgit.edu', role: 'ADMIN', status: 'Activated', lastActive: 'Yesterday, 4:30 PM', registeredOn: '22/06/2026, 08:00 pm', lastLogin: '17/07/2026, 10:37 pm', createdAt: new Date().toISOString(), rollNo: 'CSE2025003', phone: '9876543212', attendancePct: 75, solvedProblemsCount: 5, activityLogs: [] },
      { id: 'st-4', batchId: 'batch-cse-b', studentName: 'Ananya Reddy', cgpa: 8.7, email: 'ananya@cgit.edu', role: 'ADMIN', status: 'Not Activated', lastActive: '2 days ago', registeredOn: '21/05/2026, 06:04 pm', lastLogin: '17/07/2026, 09:51 pm', createdAt: new Date().toISOString(), rollNo: 'CSE2025004', phone: '9876543213', attendancePct: 82, solvedProblemsCount: 12, activityLogs: [] },
    ];
    setStoredItem(STORAGE_KEYS.STUDENTS, demoStudents);

    // Seed demo problems
    const demoProblems: Problem[] = [
      {
        id: 'prob-1',
        collegeId: demoId,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        inputFormat: 'Line 1: Array of integers space separated\nLine 2: Target integer',
        outputFormat: 'Two space separated indices',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
        sampleInput: '2 7 11 15\n9',
        sampleOutput: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        hiddenTestCases: '3 2 4\n6 -> 1 2',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prob-2',
        collegeId: demoId,
        title: 'Longest Substring Without Repeating Characters',
        description: 'Find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        inputFormat: 'A single string s',
        outputFormat: 'An integer representing length',
        constraints: '0 <= s.length <= 5 * 10^4',
        sampleInput: 'abcabcbb',
        sampleOutput: '3',
        explanation: 'The answer is "abc", with length of 3.',
        createdAt: new Date().toISOString(),
      }
    ];
    setStoredItem(STORAGE_KEYS.PROBLEMS, demoProblems);

    // Seed demo activities
    const demoActivities: Activity[] = [
      { id: 'act-1', collegeId: demoId, type: 'batch_created', description: 'Created batch CSE-A in CSE branch', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'act-2', collegeId: demoId, type: 'students_uploaded', description: 'Uploaded 3 students to CSE-A', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'act-3', collegeId: demoId, type: 'problem_created', description: 'Created problem "Two Sum"', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    ];
    setStoredItem(STORAGE_KEYS.ACTIVITIES, demoActivities);

    const demoAssignments: Assignment[] = [
      {
        id: 'assign-1',
        collegeId: demoId,
        title: 'Algorithms Homework 1',
        description: 'Solve sorting and mapping challenges.',
        branchId: cseBranchId,
        batchId: 'batch-cse-a',
        problemIds: ['prob-1'],
        dueDate: new Date(Date.now() + 3600000 * 48).toISOString(),
        isPublished: true,
        createdAt: new Date().toISOString(),
        submissionCount: 2,
      }
    ];
    setStoredItem(STORAGE_KEYS.ASSIGNMENTS, demoAssignments);

    const demoContests: Contest[] = [
      {
        id: 'contest-1',
        collegeId: demoId,
        title: 'Weekly Code Clash #1',
        description: 'Test your algorithm solving speed.',
        startTime: new Date(Date.now() + 3600000 * 12).toISOString(),
        endTime: new Date(Date.now() + 3600000 * 15).toISOString(),
        problemIds: ['prob-1', 'prob-2'],
        branchId: cseBranchId,
        batchId: 'batch-cse-a',
        status: 'Upcoming',
        createdAt: new Date().toISOString(),
      }
    ];
    setStoredItem(STORAGE_KEYS.CONTESTS, demoContests);

    const demoPractice: TimedPractice[] = [
      {
        id: 'prac-1',
        collegeId: demoId,
        title: 'Array Manipulations Prep',
        durationMinutes: 45,
        problemIds: ['prob-1'],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000 * 24).toISOString(),
        batchId: 'batch-cse-a',
        createdAt: new Date().toISOString(),
      }
    ];
    setStoredItem(STORAGE_KEYS.PRACTICE, demoPractice);

    const demoLogs: ActivityLog[] = [
      { id: 'log-1', collegeId: demoId, type: 'auth', action: 'Login', description: 'Admin logged in', adminEmail: 'admin@cgit.edu', timestamp: new Date().toISOString() },
      { id: 'log-2', collegeId: demoId, type: 'batch', action: 'Batch Creation', description: 'Created batch CSE-A', adminEmail: 'admin@cgit.edu', timestamp: new Date().toISOString() },
    ];
    setStoredItem(STORAGE_KEYS.LOGS, demoLogs);

    const demoSettings: CollegeSettings = {
      collegeId: demoId,
      logoUrl: '',
      academicYear: '2025-2026',
      defaultBranchId: cseBranchId,
      defaultBatchId: 'batch-cse-a',
      notificationsEnabled: true,
      theme: 'Dark',
    };
    setStoredItem(STORAGE_KEYS.SETTINGS, [demoSettings]);
  }
}

// College API
export async function getColleges(): Promise<College[]> {
  return getStoredItem<College[]>(STORAGE_KEYS.COLLEGES, []);
}

export async function findCollegeByEmail(email: string): Promise<College | null> {
  const colleges = await getColleges();
  return colleges.find(c => c.collegeEmail.toLowerCase() === email.toLowerCase()) || null;
}

export async function registerCollege(params: {
  collegeName: string;
  collegeEmail: string;
  password: string;
}): Promise<College> {
  const colleges = await getColleges();
  const existing = colleges.find(c => c.collegeEmail.toLowerCase() === params.collegeEmail.toLowerCase());
  
  if (existing) {
    throw new Error('A college with this email is already registered.');
  }

  const hashedPassword = await hashPassword(params.password);
  const collegeId = 'col_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  const newCollege: College = {
    id: collegeId,
    collegeName: params.collegeName,
    collegeEmail: params.collegeEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  setStoredItem(STORAGE_KEYS.COLLEGES, [...colleges, newCollege]);

  const branches = getStoredItem<Branch[]>(STORAGE_KEYS.BRANCHES, []);
  const newBranches: Branch[] = STATIC_BRANCHES.map(bName => ({
    id: `br-${collegeId}-${bName.toLowerCase()}`,
    collegeId: collegeId,
    branchName: bName,
  }));
  
  setStoredItem(STORAGE_KEYS.BRANCHES, [...branches, ...newBranches]);
  logAdminActivity(collegeId, 'auth', 'Registration', `College account "${params.collegeName}" registered.`, params.collegeEmail);

  return newCollege;
}

// Branch API (Including Dynamic Creation!)
export function getCollegeBranches(collegeId: string): Branch[] {
  const allBranches = getStoredItem<Branch[]>(STORAGE_KEYS.BRANCHES, []);
  let collegeBranches = allBranches.filter(b => b.collegeId === collegeId);
  
  if (collegeBranches.length === 0) {
    collegeBranches = STATIC_BRANCHES.map(bName => ({
      id: `br-${collegeId}-${bName.toLowerCase()}`,
      collegeId: collegeId,
      branchName: bName,
    }));
    setStoredItem(STORAGE_KEYS.BRANCHES, [...allBranches, ...collegeBranches]);
  }
  return collegeBranches;
}

// Dynamic Branch Creation API
export function createBranch(collegeId: string, branchName: string): Branch {
  const allBranches = getStoredItem<Branch[]>(STORAGE_KEYS.BRANCHES, []);
  const existing = allBranches.find(
    b => b.collegeId === collegeId && b.branchName.toLowerCase() === branchName.trim().toLowerCase()
  );

  if (existing) {
    throw new Error(`Branch "${branchName}" already exists for your college.`);
  }

  const newBranch: Branch = {
    id: `br-${collegeId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    collegeId,
    branchName: branchName.trim(),
  };

  setStoredItem(STORAGE_KEYS.BRANCHES, [...allBranches, newBranch]);
  logAdminActivity(collegeId, 'batch', 'Branch Creation', `Created new department "${branchName.trim()}"`);

  return newBranch;
}

export function getBatchById(batchId: string): Batch | null {
  const allBatches = getStoredItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
  return allBatches.find(b => b.id === batchId) || null;
}

export function getBatchName(batchId: string): string {
  const batch = getBatchById(batchId);
  if (batch) return batch.batchName;
  if (batchId && batchId.startsWith('batch-')) {
    return batchId.replace('batch-', '').toUpperCase();
  }
  return batchId || 'N/A';
}

export function getBranchBatches(branchId: string): Batch[] {
  const allBatches = getStoredItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
  return allBatches.filter(b => b.branchId === branchId);
}

export function createBatch(collegeId: string, branchId: string, batchName: string): Batch {
  const allBatches = getStoredItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
  const existing = allBatches.find(b => b.branchId === branchId && b.batchName.toLowerCase() === batchName.toLowerCase());
  
  if (existing) {
    throw new Error(`Batch "${batchName}" already exists in this branch.`);
  }

  const newBatch: Batch = {
    id: 'batch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    branchId,
    batchName,
    createdAt: new Date().toISOString(),
  };

  setStoredItem(STORAGE_KEYS.BATCHES, [...allBatches, newBatch]);
  logAdminActivity(collegeId, 'batch', 'Batch Creation', `Created batch ${batchName}`);

  return newBatch;
}

// Student API
export function getBatchStudents(batchId: string): Student[] {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const batchName = getBatchName(batchId);
  return allStudents
    .filter(s => s.batchId === batchId)
    .map(s => ({ ...s, batchName: s.batchName || batchName }));
}

export function getAllCollegeStudents(collegeId: string): Student[] {
  const branches = getCollegeBranches(collegeId);
  const branchIds = branches.map(b => b.id);
  const allBatches = getStoredItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
  const collegeBatches = allBatches.filter(b => branchIds.includes(b.branchId));
  const batchIds = collegeBatches.map(b => b.id);
  
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  return allStudents
    .filter(s => batchIds.includes(s.batchId))
    .map(s => ({ ...s, batchName: s.batchName || getBatchName(s.batchId) }));
}

// Deep-Dive Individual Student Diagnostic Analytics Retriever
export function getStudentById(studentId: string): Student | null {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return null;

  // Compute rich diagnostic analytics for THIS individual student
  const solvedCount = student.solvedProblemsCount || Math.floor(15 + Math.random() * 35);
  const attemptedCount = student.totalQuestionsAttempted || solvedCount + Math.floor(5 + Math.random() * 15);
  const accuracy = student.accuracyPct || Math.round((solvedCount / attemptedCount) * 100);
  const xpPoints = student.totalPoints || solvedCount * 45 + 150;

  // Topic Level Performance Breakdown & Weak Point Detection
  const topicStats: StudentTopicStat[] = [
    { topic: 'Arrays & Hashing', total: 12, solved: 11, accuracy: 91.6, status: 'Strong' },
    { topic: 'Strings', total: 10, solved: 8, accuracy: 80.0, status: 'Strong' },
    { topic: 'Searching & Sorting', total: 8, solved: 6, accuracy: 75.0, status: 'Average' },
    { topic: 'Binary Trees', total: 8, solved: 4, accuracy: 50.0, status: 'Average' },
    { topic: 'Graph Theory', total: 10, solved: 3, accuracy: 30.0, status: 'Weak' },
    { topic: 'Dynamic Programming', total: 12, solved: 3, accuracy: 25.0, status: 'Weak' },
    { topic: 'Bit Manipulation', total: 5, solved: 1, accuracy: 20.0, status: 'Weak' },
  ];

  // Identify Weak Points dynamically (topics with status 'Weak')
  const weakPoints = topicStats.filter(t => t.status === 'Weak').map(t => t.topic);

  // Submissions Audit Records for this specific student
  const submissionsHistory: StudentSubmissionRecord[] = [
    { id: 'sub-101', problemTitle: 'Two Sum', topic: 'Arrays & Hashing', difficulty: 'Easy', status: 'Accepted', score: 50, timeTaken: '12m 40s', date: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'sub-102', problemTitle: 'Valid Anagram', topic: 'Strings', difficulty: 'Easy', status: 'Accepted', score: 50, timeTaken: '08m 15s', date: new Date(Date.now() - 3600000 * 18).toISOString() },
    { id: 'sub-103', problemTitle: 'Longest Substring Without Repeating', topic: 'Strings', difficulty: 'Medium', status: 'Accepted', score: 80, timeTaken: '24m 10s', date: new Date(Date.now() - 3600000 * 36).toISOString() },
    { id: 'sub-104', problemTitle: 'Coin Change (DP)', topic: 'Dynamic Programming', difficulty: 'Medium', status: 'Wrong Answer', score: 0, timeTaken: '45m 00s', date: new Date(Date.now() - 3600000 * 50).toISOString() },
    { id: 'sub-105', problemTitle: 'Number of Islands', topic: 'Graph Theory', difficulty: 'Medium', status: 'Time Limit Exceeded', score: 0, timeTaken: '60m 00s', date: new Date(Date.now() - 3600000 * 72).toISOString() },
    { id: 'sub-106', problemTitle: 'Single Number', topic: 'Bit Manipulation', difficulty: 'Easy', status: 'Wrong Answer', score: 0, timeTaken: '15m 20s', date: new Date(Date.now() - 3600000 * 96).toISOString() },
  ];

  return {
    ...student,
    batchName: student.batchName || getBatchName(student.batchId),
    rollNo: student.rollNo || 'REG' + student.id.substring(3, 8).toUpperCase(),
    phone: student.phone || '9876543210',
    attendancePct: student.attendancePct || 88,
    solvedProblemsCount: solvedCount,
    totalQuestionsAttempted: attemptedCount,
    accuracyPct: accuracy,
    totalPoints: xpPoints,
    weakPoints,
    topicStats,
    submissionsHistory,
    activityLogs: student.activityLogs || [
      { action: 'Submitted Two Sum (Accepted)', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { action: 'Attempted Coin Change (Wrong Answer)', timestamp: new Date(Date.now() - 3600000 * 50).toISOString() },
      { action: 'Joined Batch & Completed Setup', timestamp: new Date(Date.now() - 3600000 * 120).toISOString() },
    ]
  };
}

// Manual Student Onboarding API
export function addSingleStudent(collegeId: string, params: {
  batchId: string;
  studentName: string;
  rollNo: string;
  email: string;
  phone: string;
  cgpa: number;
  status: 'Not Activated' | 'Activated' | 'Working';
}): Student {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  
  // Check duplicate email
  const existing = allStudents.find(s => s.email.toLowerCase() === params.email.trim().toLowerCase());
  if (existing) {
    throw new Error('A student with this email address already exists in the system.');
  }

  const newStudent: Student = {
    id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    batchId: params.batchId,
    studentName: params.studentName.trim(),
    rollNo: params.rollNo.trim(),
    email: params.email.trim(),
    phone: params.phone.trim() || '9876543210',
    cgpa: Number(params.cgpa) || 0.0,
    role: 'ADMIN',
    status: params.status || 'Activated',
    lastActive: 'Online Now',
    registeredOn: '17/07/2026, 11:22 pm',
    lastLogin: '17/07/2026, 11:22 pm',
    createdAt: new Date().toISOString(),
    attendancePct: 100,
    solvedProblemsCount: 0,
    totalQuestionsAttempted: 0,
    accuracyPct: 0,
    totalPoints: 0,
    weakPoints: [],
    topicStats: [],
    submissionsHistory: [],
    activityLogs: [{ action: 'Manually onboarded by Super Admin', timestamp: new Date().toISOString() }],
  };

  setStoredItem(STORAGE_KEYS.STUDENTS, [...allStudents, newStudent]);
  logAdminActivity(collegeId, 'student', 'Manual Student Onboarding', `Added student ${params.studentName} (${params.rollNo})`);

  return newStudent;
}

export function updateStudent(collegeId: string, studentId: string, updates: Partial<Student>): Student {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const index = allStudents.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found.');

  const updated = { ...allStudents[index], ...updates };
  allStudents[index] = updated;
  setStoredItem(STORAGE_KEYS.STUDENTS, allStudents);

  logAdminActivity(collegeId, 'student', 'Student Update', `Updated details for student ${updated.studentName}`);
  return updated;
}

export function deleteStudent(collegeId: string, studentId: string): void {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const target = allStudents.find(s => s.id === studentId);
  if (!target) throw new Error('Student not found.');

  const filtered = allStudents.filter(s => s.id !== studentId);
  setStoredItem(STORAGE_KEYS.STUDENTS, filtered);

  logAdminActivity(collegeId, 'student', 'Student Deletion', `Deleted student ${target.studentName}`);
}

export function addStudentsToBatch(collegeId: string, batchId: string, studentsData: { studentName: string; cgpa: number; email: string }[]): Student[] {
  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const newStudents: Student[] = studentsData.map(st => ({
    id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    batchId,
    studentName: st.studentName,
    cgpa: Number(st.cgpa) || 0.0,
    email: st.email,
    role: 'ADMIN',
    status: 'Activated',
    lastActive: 'Just now',
    registeredOn: '17/07/2026, 11:13 pm',
    lastLogin: '17/07/2026, 11:13 pm',
    createdAt: new Date().toISOString(),
    rollNo: 'REG' + Math.floor(100000 + Math.random() * 900000),
    phone: '9' + Math.floor(100000000 + Math.random() * 900000000),
    attendancePct: 90,
    solvedProblemsCount: 0,
    activityLogs: [],
  }));

  setStoredItem(STORAGE_KEYS.STUDENTS, [...allStudents, ...newStudents]);
  logAdminActivity(collegeId, 'student', 'Student Upload', `Uploaded ${newStudents.length} students to batch`);

  return newStudents;
}

// Problem Setter API
export function getCollegeProblems(collegeId: string): Problem[] {
  const allProblems = getStoredItem<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
  const collegeProblems = allProblems.filter(p => p.collegeId === collegeId);
  
  if (collegeProblems.length === 0) {
    // Seed default starter problems for this college
    const starterProblems: Problem[] = [
      {
        id: 'prob_' + Date.now() + '_1',
        collegeId,
        title: 'Two Sum',
        shortDescription: 'Find two numbers that add up to target',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        inputFormat: 'Line 1: Space separated integers\nLine 2: Target integer',
        outputFormat: 'Space separated indices',
        constraints: '2 <= nums.length <= 10^4',
        sampleInput: '2 7 11 15\n9',
        sampleOutput: '0 1',
        explanation: 'nums[0] + nums[1] == 9',
        languages: ['C (GCC 9.2.0)', 'C++', 'Java', 'Python 3'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prob_' + Date.now() + '_2',
        collegeId,
        title: 'Longest Substring Without Repeating Characters',
        shortDescription: 'Find max non-repeating substring length',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        inputFormat: 'A single string s',
        outputFormat: 'An integer',
        constraints: '0 <= s.length <= 5 * 10^4',
        sampleInput: 'abcabcbb',
        sampleOutput: '3',
        explanation: 'The answer is "abc", with length of 3.',
        languages: ['C (GCC 9.2.0)', 'C++', 'Java', 'Python 3'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prob_' + Date.now() + '_3',
        collegeId,
        title: 'Merge K Sorted Lists',
        shortDescription: 'Merge k sorted linked lists into one sorted list',
        description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        difficulty: 'Hard',
        inputFormat: 'K sorted linked lists',
        outputFormat: 'Single sorted linked list',
        constraints: '0 <= k <= 10^4',
        sampleInput: '[[1,4,5],[1,3,4],[2,6]]',
        sampleOutput: '[1,1,2,3,4,4,5,6]',
        explanation: 'Merged into one sorted list.',
        languages: ['C (GCC 9.2.0)', 'C++', 'Java', 'Python 3'],
        createdAt: new Date().toISOString(),
      }
    ];

    setStoredItem(STORAGE_KEYS.PROBLEMS, [...allProblems, ...starterProblems]);
    return starterProblems;
  }

  return collegeProblems;
}

export function createProblem(collegeId: string, problemData: Omit<Problem, 'id' | 'collegeId' | 'createdAt'>): Problem {
  const allProblems = getStoredItem<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
  const newProblem: Problem = {
    ...problemData,
    id: 'prob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    createdAt: new Date().toISOString(),
  };

  setStoredItem(STORAGE_KEYS.PROBLEMS, [newProblem, ...allProblems]);
  logAdminActivity(collegeId, 'problem', 'Problem Creation', `Created problem "${newProblem.title}"`);

  return newProblem;
}

export function updateProblem(collegeId: string, problemId: string, problemData: Partial<Problem>): Problem {
  const allProblems = getStoredItem<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
  const index = allProblems.findIndex(p => p.id === problemId && p.collegeId === collegeId);
  
  if (index === -1) {
    throw new Error('Problem not found or unauthorized.');
  }

  const updatedProblem = { ...allProblems[index], ...problemData };
  allProblems[index] = updatedProblem;

  setStoredItem(STORAGE_KEYS.PROBLEMS, allProblems);
  logAdminActivity(collegeId, 'problem', 'Problem Update', `Updated problem "${updatedProblem.title}"`);

  return updatedProblem;
}

export function deleteProblem(collegeId: string, problemId: string): void {
  const allProblems = getStoredItem<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
  const target = allProblems.find(p => p.id === problemId && p.collegeId === collegeId);
  
  if (!target) {
    throw new Error('Problem not found or unauthorized.');
  }

  const filtered = allProblems.filter(p => !(p.id === problemId && p.collegeId === collegeId));
  setStoredItem(STORAGE_KEYS.PROBLEMS, filtered);
  logAdminActivity(collegeId, 'problem', 'Problem Deletion', `Deleted problem "${target.title}"`);
}

// Assignments API
export function getAssignments(collegeId: string): Assignment[] {
  const all = getStoredItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  return all.filter(a => a.collegeId === collegeId);
}

export function createAssignment(collegeId: string, assignmentData: Omit<Assignment, 'id' | 'collegeId' | 'createdAt' | 'submissionCount'>): Assignment {
  const all = getStoredItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const newAssignment: Assignment = {
    ...assignmentData,
    id: 'assign_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    createdAt: new Date().toISOString(),
    submissionCount: 0,
  };
  setStoredItem(STORAGE_KEYS.ASSIGNMENTS, [newAssignment, ...all]);

  logAdminActivity(collegeId, 'assignment', 'Assignment Creation', `Created assignment "${newAssignment.title}"`);
  return newAssignment;
}

export function updateAssignment(collegeId: string, assignmentId: string, updates: Partial<Assignment>): Assignment {
  const all = getStoredItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const index = all.findIndex(a => a.id === assignmentId && a.collegeId === collegeId);
  if (index === -1) throw new Error('Assignment not found.');

  const updated = { ...all[index], ...updates };
  all[index] = updated;
  setStoredItem(STORAGE_KEYS.ASSIGNMENTS, all);

  logAdminActivity(collegeId, 'assignment', 'Assignment Update', `Updated assignment "${updated.title}"`);
  return updated;
}

export function deleteAssignment(collegeId: string, assignmentId: string): void {
  const all = getStoredItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  const target = all.find(a => a.id === assignmentId && a.collegeId === collegeId);
  if (!target) throw new Error('Assignment not found.');

  setStoredItem(STORAGE_KEYS.ASSIGNMENTS, all.filter(a => a.id !== assignmentId));
  logAdminActivity(collegeId, 'assignment', 'Assignment Deletion', `Deleted assignment "${target.title}"`);
}

// Contests API
export function getContests(collegeId: string): Contest[] {
  const all = getStoredItem<Contest[]>(STORAGE_KEYS.CONTESTS, []);
  return all.filter(c => c.collegeId === collegeId).map(c => {
    const now = new Date().getTime();
    const start = new Date(c.startTime).getTime();
    const end = new Date(c.endTime).getTime();
    
    let status: Contest['status'] = 'Upcoming';
    if (now >= start && now <= end) {
      status = 'Running';
    } else if (now > end) {
      status = 'Completed';
    }
    
    return { ...c, status };
  });
}

export function createContest(collegeId: string, contestData: Omit<Contest, 'id' | 'collegeId' | 'createdAt' | 'status'>): Contest {
  const all = getStoredItem<Contest[]>(STORAGE_KEYS.CONTESTS, []);
  const newContest: Contest = {
    ...contestData,
    id: 'contest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    status: 'Upcoming',
    createdAt: new Date().toISOString(),
  };
  setStoredItem(STORAGE_KEYS.CONTESTS, [newContest, ...all]);

  logAdminActivity(collegeId, 'contest', 'Contest Creation', `Created contest "${newContest.title}"`);
  return newContest;
}

export function updateContest(collegeId: string, contestId: string, updates: Partial<Contest>): Contest {
  const all = getStoredItem<Contest[]>(STORAGE_KEYS.CONTESTS, []);
  const index = all.findIndex(c => c.id === contestId && c.collegeId === collegeId);
  if (index === -1) throw new Error('Contest not found.');

  const updated = { ...all[index], ...updates };
  all[index] = updated;
  setStoredItem(STORAGE_KEYS.CONTESTS, all);

  logAdminActivity(collegeId, 'contest', 'Contest Update', `Updated contest "${updated.title}"`);
  return updated;
}

export function deleteContest(collegeId: string, contestId: string): void {
  const all = getStoredItem<Contest[]>(STORAGE_KEYS.CONTESTS, []);
  const target = all.find(c => c.id === contestId && c.collegeId === collegeId);
  if (!target) throw new Error('Contest not found.');

  setStoredItem(STORAGE_KEYS.CONTESTS, all.filter(c => c.id !== contestId));
  logAdminActivity(collegeId, 'contest', 'Contest Deletion', `Deleted contest "${target.title}"`);
}

export function getContestLeaderboard(collegeId: string, contestId: string): ContestLeaderboardEntry[] {
  const students = getAllCollegeStudents(collegeId);
  return students.map((st, index) => ({
    rank: index + 1,
    studentName: st.studentName,
    email: st.email,
    score: Math.max(10, 100 - index * 12),
    solvedCount: Math.max(1, 4 - index),
    timeTaken: `${20 + index * 8}m ${Math.floor(Math.random() * 60)}s`
  }));
}

// Timed Practice API
export function getTimedPractices(collegeId: string): TimedPractice[] {
  const all = getStoredItem<TimedPractice[]>(STORAGE_KEYS.PRACTICE, []);
  return all.filter(p => p.collegeId === collegeId);
}

export function createTimedPractice(collegeId: string, practiceData: Omit<TimedPractice, 'id' | 'collegeId' | 'createdAt'>): TimedPractice {
  const all = getStoredItem<TimedPractice[]>(STORAGE_KEYS.PRACTICE, []);
  const newSession: TimedPractice = {
    ...practiceData,
    id: 'prac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    collegeId,
    createdAt: new Date().toISOString(),
  };
  setStoredItem(STORAGE_KEYS.PRACTICE, [newSession, ...all]);

  logAdminActivity(collegeId, 'practice', 'Practice Creation', `Created timed practice "${newSession.title}"`);
  return newSession;
}

export function deleteTimedPractice(collegeId: string, id: string): void {
  const all = getStoredItem<TimedPractice[]>(STORAGE_KEYS.PRACTICE, []);
  setStoredItem(STORAGE_KEYS.PRACTICE, all.filter(p => p.id !== id));
  logAdminActivity(collegeId, 'practice', 'Practice Deletion', `Deleted timed practice session.`);
}

// Activity Logs System API
export function getActivityLogs(collegeId: string): ActivityLog[] {
  const all = getStoredItem<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
  return all.filter(l => l.collegeId === collegeId);
}

export function clearActivityLogs(collegeId: string): void {
  const all = getStoredItem<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
  setStoredItem(STORAGE_KEYS.LOGS, all.filter(l => l.collegeId !== collegeId));
}

// Settings API
export function getCollegeSettings(collegeId: string): CollegeSettings {
  const all = getStoredItem<CollegeSettings[]>(STORAGE_KEYS.SETTINGS, []);
  const current = all.find(s => s.collegeId === collegeId);
  
  if (current) return current;

  const branches = getCollegeBranches(collegeId);
  const defaultBranchId = branches[0]?.id || '';
  
  const defaultSettings: CollegeSettings = {
    collegeId,
    academicYear: '2025-2026',
    defaultBranchId,
    notificationsEnabled: true,
    theme: 'Dark',
  };
  setStoredItem(STORAGE_KEYS.SETTINGS, [...all, defaultSettings]);
  return defaultSettings;
}

export function updateCollegeSettings(collegeId: string, updates: Partial<CollegeSettings>): CollegeSettings {
  const all = getStoredItem<CollegeSettings[]>(STORAGE_KEYS.SETTINGS, []);
  const index = all.findIndex(s => s.collegeId === collegeId);

  let updated: CollegeSettings;
  if (index === -1) {
    updated = {
      collegeId,
      academicYear: '2025-2026',
      notificationsEnabled: true,
      theme: 'Dark',
      ...updates,
    };
    all.push(updated);
  } else {
    updated = { ...all[index], ...updates };
    all[index] = updated;
  }
  
  setStoredItem(STORAGE_KEYS.SETTINGS, all);
  logAdminActivity(collegeId, 'settings', 'Settings Update', 'Updated college system preferences');
  return updated;
}

// Dashboard Analytics Query
export function getCollegeDashboardStats(collegeId: string): DashboardStats {
  const collegeBranches = getCollegeBranches(collegeId);
  const branchIds = collegeBranches.map(b => b.id);

  const allBatches = getStoredItem<Batch[]>(STORAGE_KEYS.BATCHES, []);
  const collegeBatches = allBatches.filter(b => branchIds.includes(b.branchId));
  const batchIds = collegeBatches.map(b => b.id);

  const allStudents = getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const collegeStudents = allStudents.filter(s => batchIds.includes(s.batchId));

  const totalStudents = collegeStudents.length;
  const activeStudents = collegeStudents.filter(s => s.status === 'Activated').length;
  const studentsWorking = collegeStudents.filter(s => s.status === 'Working').length;
  const notActivatedStudents = collegeStudents.filter(s => s.status === 'Not Activated').length;

  const statusDistribution = [
    { name: 'Not Activated', value: notActivatedStudents, color: '#f59e0b' },
    { name: 'Active Students', value: activeStudents, color: '#10b981' },
    { name: 'Students Working', value: studentsWorking, color: '#3b82f6' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityTrend = days.map((day, idx) => ({
    day,
    students: Math.max(0, Math.round(totalStudents * (0.3 + (idx * 0.1)))),
    submissions: Math.max(0, Math.round(totalStudents * (0.8 + (idx * 0.2)))),
  }));

  const branchDistribution = collegeBranches.map(branch => {
    const bBatches = collegeBatches.filter(b => b.branchId === branch.id);
    const bBatchIds = bBatches.map(b => b.id);
    const bStudents = collegeStudents.filter(s => bBatchIds.includes(s.batchId));
    return {
      branch: branch.branchName,
      students: bStudents.length,
      batches: bBatches.length,
    };
  });

  const allActivities = getStoredItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);
  const recentActivities = allActivities
    .filter(a => a.collegeId === collegeId)
    .slice(0, 10);

  return {
    totalStudents,
    activeStudents,
    studentsWorking,
    statusDistribution,
    activityTrend,
    branchDistribution,
    recentActivities,
  };
}

// ==========================================
// Faculty Chat API & Storage Handlers
// ==========================================

export function getCollegeFaculty(collegeId: string): FacultyMember[] {
  const allFaculty = getStoredItem<FacultyMember[]>(STORAGE_KEYS.FACULTY, []);
  let collegeFaculty = allFaculty.filter(f => f.collegeId === collegeId);

  // If no faculty members exist for this college, seed default demo faculty
  if (collegeFaculty.length === 0) {
    const demoFaculty: FacultyMember[] = [
      {
        id: `fac_${collegeId}_1`,
        collegeId,
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@cgit.edu',
        department: 'CSE',
        designation: 'Professor & HOD',
        status: 'online',
        createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
        unreadCount: 1,
      },
      {
        id: `fac_${collegeId}_2`,
        collegeId,
        name: 'Prof. Ananya Roy',
        email: 'ananya.roy@cgit.edu',
        department: 'AI',
        designation: 'Associate Professor',
        status: 'online',
        createdAt: new Date(Date.now() - 3600000 * 180).toISOString(),
        unreadCount: 0,
      },
      {
        id: `fac_${collegeId}_3`,
        collegeId,
        name: 'Prof. Suresh Nair',
        email: 'suresh.nair@cgit.edu',
        department: 'ECE',
        designation: 'Assistant Professor',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
        unreadCount: 0,
      },
      {
        id: `fac_${collegeId}_4`,
        collegeId,
        name: 'Dr. Meera Reddy',
        email: 'meera.reddy@cgit.edu',
        department: 'EEE',
        designation: 'Lab Coordinator & Assoc. Prof',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000 * 5).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
        unreadCount: 0,
      },
    ];

    setStoredItem(STORAGE_KEYS.FACULTY, [...allFaculty, ...demoFaculty]);
    collegeFaculty = demoFaculty;

    // Seed initial welcome messages for Dr. Rajesh Kumar
    const initialMsgs: FacultyChatMessage[] = [
      {
        id: `msg_seed_1`,
        collegeId,
        facultyId: `fac_${collegeId}_1`,
        sender: 'faculty',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Hello Super Admin! I have uploaded the new Data Structures questions for the upcoming CSE-A contest.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        isRead: true,
      },
      {
        id: `msg_seed_2`,
        collegeId,
        facultyId: `fac_${collegeId}_1`,
        sender: 'admin',
        senderName: 'Super Admin',
        text: 'Great work Dr. Rajesh! I will review the test cases and publish the contest schedule today.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: true,
      },
      {
        id: `msg_seed_3`,
        collegeId,
        facultyId: `fac_${collegeId}_1`,
        sender: 'faculty',
        senderName: 'Dr. Rajesh Kumar',
        text: 'Please check the hidden test cases for the Graph Algorithms problem when you have a moment.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        isRead: false,
      },
    ];

    const allMsgs = getStoredItem<FacultyChatMessage[]>(STORAGE_KEYS.FACULTY_MESSAGES, []);
    setStoredItem(STORAGE_KEYS.FACULTY_MESSAGES, [...allMsgs, ...initialMsgs]);
  }

  return collegeFaculty;
}

export function addFacultyMember(collegeId: string, params: {
  name: string;
  email: string;
  department: string;
  designation: string;
}): FacultyMember {
  const allFaculty = getStoredItem<FacultyMember[]>(STORAGE_KEYS.FACULTY, []);
  
  // Check duplicate email
  const existing = allFaculty.find(f => f.collegeId === collegeId && f.email.toLowerCase() === params.email.trim().toLowerCase());
  if (existing) {
    throw new Error(`Faculty member with email "${params.email}" is already registered.`);
  }

  const newFaculty: FacultyMember = {
    id: `fac_${collegeId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    collegeId,
    name: params.name.trim(),
    email: params.email.trim(),
    department: params.department.trim(),
    designation: params.designation.trim() || 'Faculty',
    status: 'online',
    createdAt: new Date().toISOString(),
    unreadCount: 0,
  };

  setStoredItem(STORAGE_KEYS.FACULTY, [...allFaculty, newFaculty]);
  logAdminActivity(collegeId, 'settings', 'Faculty Registration', `Registered new faculty member ${params.name} (${params.department})`);

  return newFaculty;
}

export function getFacultyChatMessages(collegeId: string, facultyId: string): FacultyChatMessage[] {
  const allMessages = getStoredItem<FacultyChatMessage[]>(STORAGE_KEYS.FACULTY_MESSAGES, []);
  return allMessages.filter(m => m.collegeId === collegeId && m.facultyId === facultyId);
}

export function sendFacultyChatMessage(
  collegeId: string,
  facultyId: string,
  params: {
    sender: 'admin' | 'faculty';
    senderName: string;
    text: string;
    referenceContext?: FacultyChatMessage['referenceContext'];
  }
): FacultyChatMessage {
  const allMessages = getStoredItem<FacultyChatMessage[]>(STORAGE_KEYS.FACULTY_MESSAGES, []);
  
  const newMessage: FacultyChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    collegeId,
    facultyId,
    sender: params.sender,
    senderName: params.senderName,
    text: params.text.trim(),
    timestamp: new Date().toISOString(),
    isRead: params.sender === 'admin', // Admin messages are read by default
    referenceContext: params.referenceContext,
  };

  setStoredItem(STORAGE_KEYS.FACULTY_MESSAGES, [...allMessages, newMessage]);
  return newMessage;
}

export function markFacultyMessagesAsRead(collegeId: string, facultyId: string): void {
  const allMessages = getStoredItem<FacultyChatMessage[]>(STORAGE_KEYS.FACULTY_MESSAGES, []);
  let updated = false;
  
  const newMessages = allMessages.map(m => {
    if (m.collegeId === collegeId && m.facultyId === facultyId && !m.isRead && m.sender === 'faculty') {
      updated = true;
      return { ...m, isRead: true };
    }
    return m;
  });

  if (updated) {
    setStoredItem(STORAGE_KEYS.FACULTY_MESSAGES, newMessages);
    
    // Also reset unreadCount on faculty member
    const allFaculty = getStoredItem<FacultyMember[]>(STORAGE_KEYS.FACULTY, []);
    const updatedFaculty = allFaculty.map(f => {
      if (f.id === facultyId && f.collegeId === collegeId) {
        return { ...f, unreadCount: 0 };
      }
      return f;
    });
    setStoredItem(STORAGE_KEYS.FACULTY, updatedFaculty);
  }
}

