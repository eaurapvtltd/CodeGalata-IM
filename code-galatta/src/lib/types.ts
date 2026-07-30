export interface College {
  id: string;
  collegeName: string;
  collegeEmail: string;
  password: string; // Hashed password
  createdAt: string;
}

export interface Branch {
  id: string;
  collegeId: string;
  branchName: string; // e.g. "CSE", "AI", "AIML", "ECE", "EEE", "Mechanical", "Civil"
}

export interface Batch {
  id: string;
  branchId: string;
  batchName: string; // e.g. "CSE-A", "CSE-B"
  createdAt: string;
}

export interface StudentTopicStat {
  topic: string;
  solved: number;
  total: number;
  accuracy: number; // percentage
  status: 'Strong' | 'Average' | 'Weak';
}

export interface StudentSubmissionRecord {
  id: string;
  problemTitle: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
  score: number;
  timeTaken: string;
  date: string;
}

export interface Student {
  id: string;
  batchId: string;
  studentName: string;
  cgpa: number;
  email: string;
  status: 'Not Activated' | 'Activated' | 'Working';
  lastActive?: string;
  registeredOn?: string;
  lastLogin?: string;
  role?: string;
  createdAt: string;
  // Extended student diagnostic details:
  rollNo?: string;
  phone?: string;
  avatar?: string;
  attendancePct?: number;
  solvedProblemsCount?: number;
  totalQuestionsAttempted?: number;
  accuracyPct?: number;
  totalPoints?: number;
  weakPoints?: string[]; // Array of identified weak topics e.g. ["Dynamic Programming", "Graph Algorithms"]
  topicStats?: StudentTopicStat[];
  submissionsHistory?: StudentSubmissionRecord[];
  activityLogs?: { action: string; timestamp: string }[];
}

export interface Problem {
  id: string;
  collegeId: string;
  title: string;
  shortDescription?: string;
  description: string;
  languages?: string[];
  defaultCode?: Record<string, string>;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  hiddenTestCases?: string;
  hints?: string[];
  solutionTitle?: string;
  solutionCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  isSolutionPublic?: boolean;
  companies?: string[];
  topics?: string[];
  realWorldOutcome?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  collegeId: string;
  type: 'batch_created' | 'students_uploaded' | 'problem_created' | 'problem_updated' | 'problem_deleted';
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  studentsWorking: number;
  statusDistribution: { name: string; value: number; color: string }[];
  activityTrend: { day: string; students: number; submissions: number }[];
  branchDistribution: { branch: string; students: number; batches: number }[];
  recentActivities: Activity[];
}

export interface Assignment {
  id: string;
  collegeId: string;
  title: string;
  description: string;
  branchId: string;
  batchId: string;
  problemIds: string[];
  dueDate: string;
  isPublished: boolean;
  marks?: number;
  codeTag?: string;
  createdAt: string;
  submissionCount?: number;
}

export interface Contest {
  id: string;
  collegeId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problemIds: string[];
  branchId: string;
  batchId: string;
  status: 'Upcoming' | 'Running' | 'Completed';
  createdAt: string;
}

export interface ContestLeaderboardEntry {
  rank: number;
  studentName: string;
  email: string;
  score: number;
  solvedCount: number;
  timeTaken: string;
}

export interface TimedPractice {
  id: string;
  collegeId: string;
  title: string;
  durationMinutes: number;
  problemIds: string[];
  startDate: string;
  endDate: string;
  batchId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  collegeId: string;
  type: 'auth' | 'student' | 'batch' | 'problem' | 'assignment' | 'contest' | 'practice' | 'settings';
  action: string;
  description: string;
  adminEmail: string;
  timestamp: string;
}

export interface CollegeSettings {
  collegeId: string;
  logoUrl?: string;
  academicYear: string;
  defaultBranchId?: string;
  defaultBatchId?: string;
  notificationsEnabled: boolean;
  theme: 'Light' | 'Dark' | 'System';
}

// Faculty Chat Interfaces
export interface FacultyMember {
  id: string;
  collegeId: string;
  name: string;
  email: string;
  department: string; // e.g., "CSE", "AI & ML", "ECE"
  designation: string; // e.g., "Professor & Head", "Assistant Professor", "Lab In-Charge"
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  createdAt: string;
  unreadCount?: number;
}

export interface FacultyChatMessage {
  id: string;
  collegeId: string;
  facultyId: string;
  sender: 'admin' | 'faculty';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  referenceContext?: {
    type: 'contest' | 'assignment' | 'problem';
    title: string;
    id: string;
  };
}
