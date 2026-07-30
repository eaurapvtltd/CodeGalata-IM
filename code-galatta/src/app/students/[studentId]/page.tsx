'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getStudentById, getBatchById } from '@/lib/db';
import { Student } from '@/lib/types';
import { 
  ArrowLeft, 
  User, 
  Users,
  Award, 
  CheckCircle2, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Printer, 
  Zap, 
  Target, 
  TrendingUp, 
  FileText, 
  Calendar,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const { college } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (resolvedParams.studentId) {
      const data = getStudentById(resolvedParams.studentId);
      setStudent(data);
    }
  }, [resolvedParams.studentId]);

  if (!student) {
    return (
      <AdminLayout>
        <div className="py-20 text-center space-y-4 max-w-7xl mx-auto">
          <User className="w-12 h-12 text-zinc-400 mx-auto opacity-50" />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Student Profile Not Found</h2>
          <Link href="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Student Roster
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Chart data calculations
  const topicChartData = student.topicStats || [];
  const weakTopics = topicChartData.filter(t => t.status === 'Weak');
  const strongTopics = topicChartData.filter(t => t.status === 'Strong');

  const difficultyData = [
    { name: 'Easy', value: Math.round((student.solvedProblemsCount || 20) * 0.5), color: '#10b981' },
    { name: 'Medium', value: Math.round((student.solvedProblemsCount || 20) * 0.35), color: '#f59e0b' },
    { name: 'Hard', value: Math.round((student.solvedProblemsCount || 20) * 0.15), color: '#ef4444' },
  ];

  const progressData = [
    { week: 'W1', score: 120, solved: 4 },
    { week: 'W2', score: 350, solved: 9 },
    { week: 'W3', score: 680, solved: 16 },
    { week: 'W4', score: 1100, solved: 27 },
    { week: 'W5', score: student.totalPoints || 1450, solved: student.solvedProblemsCount || 35 },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto print:p-0 print:m-0">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/students"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Student Directory
          </Link>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF Report</span>
          </button>
        </div>

        {/* Student Profile Identity Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-emerald-500/20 shrink-0">
                {student.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-2.5">
                {/* Title & Primary Identifiers */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {student.studentName}
                  </h1>
                  
                  {/* Roll No Badge (Appears ONCE) */}
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    Roll No: {student.rollNo || 'REG302423'}
                  </span>

                  {/* Batch Badge (Appears ONCE) */}
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    Batch: CSE 2026-A
                  </span>
                </div>

                {/* Secondary Metadata Row: Timestamps & Contact Details */}
                <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-zinc-500 font-medium">Registered On:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{student.registeredOn || '17/07/2026, 11:22 pm'}</span>
                  </span>

                  <span className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-zinc-500 font-medium">Last Login:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{student.lastLogin || '17/07/2026, 11:22 pm'}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{student.email}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{student.phone || '9876543210'}</span>
                  </span>

                  <span className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>CGPA: {student.cgpa.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Global Points</span>
                <span className="text-xl font-extrabold text-amber-500 flex items-center md:justify-end gap-1">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  {student.totalPoints || 1850} XP
                </span>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Accuracy Rate</span>
                <span className="text-xl font-extrabold text-emerald-500">
                  {student.accuracyPct || 76.5}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span>Questions Solved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {student.solvedProblemsCount || 42} <span className="text-xs font-normal text-zinc-400">/ {student.totalQuestionsAttempted || 55} attempted</span>
            </p>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${Math.min(100, ((student.solvedProblemsCount || 42) / (student.totalQuestionsAttempted || 55)) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span>Overall Accuracy</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {student.accuracyPct || 76.5}%
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">Passed test cases on first submission</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span>Weak Topics Flagged</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-500">
              {weakTopics.length} Topics
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">Requires targeted practice</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span>Class Attendance</span>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {student.attendancePct || 92}%
            </p>
            <p className="text-[11px] text-emerald-500 mt-2 font-semibold">Excellent Lab Attendance</p>
          </div>
        </div>

        {/* WEAK POINTS & SKILL GAP DIAGNOSTIC ALERT SECTION */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                Diagnostic Weak Point Analysis for {student.studentName}
              </h2>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Our algorithmic evaluator detected key topic gaps where accuracy is below proficiency thresholds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {weakTopics.map((wt) => (
              <div key={wt.topic} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                  <span>{wt.topic}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-mono text-[10px]">
                    {wt.accuracy}% Accuracy (Weak)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Solved {wt.solved} out of {wt.total} questions.
                </p>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${wt.accuracy}%` }} />
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                  &bull; Recommended: Assign 5 targeted {wt.topic} practice problems.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Topic Strength Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Topic Strength & Skill Gap Analysis
              </h3>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Proficiency %</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#888' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', fontSize: '11px' }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {topicChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'Strong' ? '#10b981' : entry.status === 'Average' ? '#f59e0b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs pt-2">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Strong (&gt;75%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Average (50-75%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Weak (&lt;50%)</span>
            </div>
          </div>

          {/* Chart 2: Difficulty Distribution */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Problem Difficulty Breakdown
              </h3>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {difficultyData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name} Level
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">{item.value} solved</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT SUBMISSIONS AUDIT TRAIL */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Submissions Audit History
            </h3>
            <span className="text-xs font-semibold text-zinc-400">Total Submissions Recorded: {student.submissionsHistory?.length || 0}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Problem Title</th>
                  <th className="px-4 py-3">Topic / Category</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Evaluation Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Execution Time</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(student.submissionsHistory || []).map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                      {sub.problemTitle}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{sub.topic}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        sub.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {sub.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub.status === 'Accepted' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-500">+{sub.score} XP</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{sub.timeTaken}</td>
                    <td className="px-4 py-3 text-zinc-400">{new Date(sub.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
