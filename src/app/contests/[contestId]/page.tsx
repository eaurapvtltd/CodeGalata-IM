'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getContests, getContestLeaderboard, getCollegeProblems } from '@/lib/db';
import { Contest, ContestLeaderboardEntry, Problem } from '@/lib/types';
import { ArrowLeft, Clock, Award, Users, ShieldCheck, Mail, Timer, Trophy, Lock } from 'lucide-react';

export default function ContestDetailPage({ params }: { params: Promise<{ contestId: string }> }) {
  const resolvedParams = use(params);
  const { college } = useAuth();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    if (!college) return;
    
    const allContests = getContests(college.id);
    const target = allContests.find(c => c.id === resolvedParams.contestId);
    
    if (target) {
      setContest(target);
      
      // Fetch dynamic leaderboard entries
      const board = getContestLeaderboard(college.id, target.id);
      setLeaderboard(board);
      
      // Fetch all coding problems
      const allProblems = getCollegeProblems(college.id);
      setProblems(allProblems.filter(p => target.problemIds.includes(p.id)));
    }
  }, [college, resolvedParams.contestId]);

  if (!contest) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-sm font-semibold text-zinc-500">Contest not found.</p>
          <Link href="/contests" className="text-emerald-500 hover:underline text-xs mt-2 block">&larr; Back to Contests</Link>
        </div>
      </AdminLayout>
    );
  }

  const isExpired = contest.status === 'Completed' || new Date(contest.endTime).getTime() < Date.now();

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/contests"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contests
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">{contest.title}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  contest.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  contest.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {isExpired ? 'Deadline Passed' : contest.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">{contest.description}</p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm self-start sm:self-center">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {isExpired ? 'Submissions Locked' : contest.status === 'Running' ? 'Live Contest' : 'Upcoming'}
              </span>
            </div>
          </div>
        </div>

        {/* Lockout Notice Banner if Expired */}
        {isExpired && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <Lock className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Contest Deadline Crossed — Submissions Closed</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                The scheduled end time ({new Date(contest.endTime).toLocaleString()}) has elapsed. Further code submissions for this contest are locked.
              </p>
            </div>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contest problems list */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-500" /> Assigned Problems
            </h3>
            {problems.length === 0 ? (
              <p className="text-xs text-zinc-400">No problems associated with this contest.</p>
            ) : (
              <div className="space-y-2">
                {problems.map((p) => (
                  <div key={p.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{p.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10' :
                      p.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Table Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" /> Live Standings
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Auto Updates
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                No submissions logged. Leaderboard will populate as students begin solving problems.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-zinc-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5">Rank</th>
                      <th className="py-2.5">Student Name</th>
                      <th className="py-2.5">Solved</th>
                      <th className="py-2.5">Score</th>
                      <th className="py-2.5">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-600 dark:text-zinc-300">
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 font-mono font-bold text-emerald-500 text-sm">
                          #{entry.rank}
                        </td>
                        <td className="py-3 font-bold text-zinc-900 dark:text-white">
                          <div>
                            <p>{entry.studentName}</p>
                            <p className="text-[10px] text-zinc-400 font-normal">{entry.email}</p>
                          </div>
                        </td>
                        <td className="py-3 font-semibold font-mono">
                          {entry.solvedCount} / {contest.problemIds.length}
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {entry.score} XP
                        </td>
                        <td className="py-3 text-zinc-500 font-mono">
                          {entry.timeTaken}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
