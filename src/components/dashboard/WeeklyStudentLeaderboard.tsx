'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Code2, 
  Coins, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Award,
  Crown,
  Medal,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface TopCoder {
  rank: number;
  id: string;
  studentName: string;
  college: string;
  xp: number;
  problemsSolved: number;
  avatar: string;
  badge: string;
}

export function WeeklyStudentLeaderboard() {
  const { college } = useAuth();
  const [topCoders, setTopCoders] = useState<TopCoder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const url = college?.id 
          ? `/api/students/leaderboard?collegeId=${college.id}` 
          : '/api/students/leaderboard';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTopCoders(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [college]);

  const rank1 = topCoders.find(c => c.rank === 1) || {
    rank: 1,
    id: '1',
    studentName: 'Arjun Sharma',
    college: 'Sri Eshwar College of Engineering',
    xp: 2450,
    problemsSolved: 136,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=b6e3f4',
    badge: 'Rank 1'
  };

  const rank2 = topCoders.find(c => c.rank === 2) || {
    rank: 2,
    id: '2',
    studentName: 'Priya Nandhini',
    college: 'PSG College of Technology',
    xp: 2180,
    problemsSolved: 118,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf',
    badge: 'Rank 2'
  };

  const rank3 = topCoders.find(c => c.rank === 3) || {
    rank: 3,
    id: '3',
    studentName: 'Karthik Balaji',
    college: 'VIT University, Chennai',
    xp: 1920,
    problemsSolved: 102,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik&backgroundColor=c0aede',
    badge: 'Rank 3'
  };

  return (
    <div className="space-y-8 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
      {/* Header Section matching reference design */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-extrabold text-xs uppercase tracking-wider shadow-2xs">
          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>WEEKLY LEADERBOARD</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-emerald-500 inline-block" />
          <span>Weekly <span className="text-emerald-600 dark:text-emerald-400">Top Coders</span></span>
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Celebrating the <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">best performers</strong> of this week.
        </p>
      </div>

      {/* Top 3 3D Podium Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-6 pb-2">
        
        {/* RANK 2 - LEFT PODIUM (Priya Nandhini) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md relative space-y-4 hover:-translate-y-1 transition-all duration-300 order-2 md:order-1">
          {/* Top Wreath Rank 2 Emblem */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-300 via-zinc-100 to-slate-200 text-zinc-900 border-2 border-white dark:border-zinc-800 flex items-center justify-center font-black text-sm shadow-md font-mono">
              2
            </div>
          </div>

          <div className="text-center space-y-2 pt-4">
            {/* Avatar Circle */}
            <div className="relative w-20 h-20 mx-auto">
              <img 
                src={rank2.avatar} 
                alt={rank2.studentName}
                className="w-20 h-20 rounded-full border-4 border-emerald-500/20 bg-emerald-50 dark:bg-zinc-800 object-cover shadow-md"
              />
            </div>

            {/* Rank 2 Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold font-mono">
              <Medal className="w-3.5 h-3.5 text-slate-400" />
              <span>Rank 2</span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                {rank2.studentName}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {rank2.college}
              </p>
            </div>
          </div>

          {/* 2 Stats Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-left">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Coins className="w-3.5 h-3.5" />
                <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank2.xp.toLocaleString()} XP</strong>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 block">XP Earned</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-left">
              <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                <Code2 className="w-3.5 h-3.5" />
                <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank2.problemsSolved}</strong>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 block">Problems Solved</span>
            </div>
          </div>
        </div>

        {/* RANK 1 - CENTER ELEVATED PODIUM (Arjun Sharma) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl relative space-y-4 hover:-translate-y-2 transition-all duration-300 order-1 md:order-2 scale-105 z-10">
          {/* Gold Wreath Rank 1 Emblem */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border-2 border-white dark:border-zinc-800 flex items-center justify-center font-black text-base shadow-lg font-mono">
              1
            </div>
          </div>

          <div className="text-center space-y-2 pt-5">
            {/* Avatar Circle with Gold Ring */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 blur-sm opacity-70 animate-pulse" />
              <img 
                src={rank1.avatar} 
                alt={rank1.studentName}
                className="relative w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 dark:bg-zinc-800 object-cover shadow-lg"
              />
            </div>

            {/* Rank 1 Green Crown Pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-md">
              <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Rank 1</span>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-tight">
                {rank1.studentName}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {rank1.college}
              </p>
            </div>
          </div>

          {/* 2 Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-left">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Coins className="w-4 h-4 fill-amber-400" />
                <strong className="text-sm font-black text-zinc-900 dark:text-white font-mono">{rank1.xp.toLocaleString()} XP</strong>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">XP Earned</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-left">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                <Code2 className="w-4 h-4" />
                <strong className="text-sm font-black text-zinc-900 dark:text-white font-mono">{rank1.problemsSolved}</strong>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">Problems Solved</span>
            </div>
          </div>

          {/* Pedestal Base Emblem */}
          <div className="pt-2 flex justify-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* RANK 3 - RIGHT PODIUM (Karthik Balaji) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md relative space-y-4 hover:-translate-y-1 transition-all duration-300 order-3">
          {/* Bronze Wreath Rank 3 Emblem */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white border-2 border-white dark:border-zinc-800 flex items-center justify-center font-black text-sm shadow-md font-mono">
              3
            </div>
          </div>

          <div className="text-center space-y-2 pt-4">
            {/* Avatar Circle */}
            <div className="relative w-20 h-20 mx-auto">
              <img 
                src={rank3.avatar} 
                alt={rank3.studentName}
                className="w-20 h-20 rounded-full border-4 border-amber-600/30 bg-amber-50 dark:bg-zinc-800 object-cover shadow-md"
              />
            </div>

            {/* Rank 3 Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/10 dark:bg-amber-950/40 border border-amber-600/30 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Rank 3</span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                {rank3.studentName}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {rank3.college}
              </p>
            </div>
          </div>

          {/* 2 Stats Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-left">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Coins className="w-3.5 h-3.5" />
                <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank3.xp.toLocaleString()} XP</strong>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 block">XP Earned</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-left">
              <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                <Code2 className="w-3.5 h-3.5" />
                <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank3.problemsSolved}</strong>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 block">Problems Solved</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Callout Banner Bar matching reference image */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-zinc-900/90 border border-emerald-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto shadow-2xs">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-mono text-lg font-black shrink-0 shadow-md">
            &lt;/&gt;
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
              Keep Coding. Keep Winning.
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Solve more problems, earn XP and climb the leaderboard!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFullModalOpen(true)}
          className="px-5 py-2.5 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Full Leaderboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full Leaderboard Modal */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  Full Weekly Student Leaderboard
                </h3>
              </div>
              <button onClick={() => setIsFullModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {topCoders.map((coder) => (
                <div 
                  key={coder.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                      coder.rank === 1 ? 'bg-amber-400 text-amber-950 font-bold' :
                      coder.rank === 2 ? 'bg-slate-300 text-zinc-900' :
                      coder.rank === 3 ? 'bg-amber-700 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      #{coder.rank}
                    </span>
                    <img src={coder.avatar} alt={coder.studentName} className="w-9 h-9 rounded-full bg-zinc-200" />
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-white">{coder.studentName}</h4>
                      <p className="text-[10px] text-zinc-400">{coder.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="block font-mono font-extrabold text-amber-500">{coder.xp.toLocaleString()} XP</span>
                      <span className="text-[10px] text-zinc-400">{coder.problemsSolved} solved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => setIsFullModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
