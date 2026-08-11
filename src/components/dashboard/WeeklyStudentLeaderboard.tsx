'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Code2, 
  TrendingUp, 
  ChevronRight, 
  Award,
  Crown,
  Medal,
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

{/* Laurel Wreath Badge Component matching reference design 100% */}
function LaurelWreathBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Left Laurel Branch Leaves */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end rotate-[-20deg] z-0">
          <span className="w-3.5 h-2 bg-amber-400 rounded-full transform -rotate-45 shadow-2xs" />
          <span className="w-4 h-2 bg-amber-400 rounded-full transform -rotate-15 shadow-2xs" />
          <span className="w-3.5 h-2 bg-amber-400 rounded-full transform rotate-15 shadow-2xs" />
        </div>
        {/* Right Laurel Branch Leaves */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-start rotate-[20deg] z-0">
          <span className="w-3.5 h-2 bg-amber-400 rounded-full transform rotate-45 shadow-2xs" />
          <span className="w-4 h-2 bg-amber-400 rounded-full transform rotate-15 shadow-2xs" />
          <span className="w-3.5 h-2 bg-amber-400 rounded-full transform -rotate-15 shadow-2xs" />
        </div>
        {/* Gold Number 1 Badge */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-amber-950 font-black text-lg border-2 border-white dark:border-zinc-800 shadow-lg flex items-center justify-center font-mono relative z-10">
          1
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Left Laurel Branch Leaves */}
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end rotate-[-20deg] z-0">
          <span className="w-3 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform -rotate-45" />
          <span className="w-3.5 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform -rotate-15" />
          <span className="w-3 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform rotate-15" />
        </div>
        {/* Right Laurel Branch Leaves */}
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-start rotate-[20deg] z-0">
          <span className="w-3 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform rotate-45" />
          <span className="w-3.5 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform rotate-15" />
          <span className="w-3 h-1.5 bg-slate-300 dark:bg-zinc-500 rounded-full transform -rotate-15" />
        </div>
        {/* Silver Number 2 Badge */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-300 via-zinc-100 to-slate-200 text-zinc-900 border-2 border-white dark:border-zinc-800 flex items-center justify-center font-black text-sm shadow-md font-mono relative z-10">
          2
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex items-center justify-center">
      {/* Left Laurel Branch Leaves */}
      <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end rotate-[-20deg] z-0">
        <span className="w-3 h-1.5 bg-amber-700 rounded-full transform -rotate-45" />
        <span className="w-3.5 h-1.5 bg-amber-700 rounded-full transform -rotate-15" />
        <span className="w-3 h-1.5 bg-amber-700 rounded-full transform rotate-15" />
      </div>
      {/* Right Laurel Branch Leaves */}
      <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-start rotate-[20deg] z-0">
        <span className="w-3 h-1.5 bg-amber-700 rounded-full transform rotate-45" />
        <span className="w-3.5 h-1.5 bg-amber-700 rounded-full transform rotate-15" />
        <span className="w-3 h-1.5 bg-amber-700 rounded-full transform -rotate-15" />
      </div>
      {/* Bronze Number 3 Badge */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white border-2 border-white dark:border-zinc-800 flex items-center justify-center font-black text-sm shadow-md font-mono relative z-10">
        3
      </div>
    </div>
  );
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

  {/* High quality 3D avatars matching reference image 100% */}
  const rank1 = topCoders.find(c => c.rank === 1) || {
    rank: 1,
    id: '1',
    studentName: 'Arjun Sharma',
    college: 'Sri Eshwar College of Engineering',
    xp: 2450,
    problemsSolved: 136,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma3D&top=shortHairShortFlat&hairColor=black&clothing=hoodie&clothingColor=green&skinColor=edb98a',
    badge: 'Rank 1'
  };

  const rank2 = topCoders.find(c => c.rank === 2) || {
    rank: 2,
    id: '2',
    studentName: 'Priya Nandhini',
    college: 'PSG College of Technology',
    xp: 2180,
    problemsSolved: 118,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaNandhini3D&top=longHairStraight&hairColor=black&clothing=overall&clothingColor=green&skinColor=edb98a',
    badge: 'Rank 2'
  };

  const rank3 = topCoders.find(c => c.rank === 3) || {
    rank: 3,
    id: '3',
    studentName: 'Karthik Balaji',
    college: 'VIT University, Chennai',
    xp: 1920,
    problemsSolved: 102,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikBalaji3D&top=shortHairShortWaved&hairColor=black&accessories=prescription02&clothing=hoodie&clothingColor=green&skinColor=edb98a',
    badge: 'Rank 3'
  };

  return (
    <div className="space-y-8 bg-gradient-to-b from-[#f8fafc] via-white to-[#f1f5f9] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
      
      {/* Top Header Section matching reference design */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-extrabold text-xs uppercase tracking-wider shadow-2xs">
          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>WEEKLY LEADERBOARD</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-3">
          <Trophy className="w-9 h-9 text-emerald-500 inline-block" />
          <span>Weekly <span className="text-emerald-600 dark:text-emerald-400">Top Coders</span></span>
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Celebrating the <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">best performers</strong> of this week.
        </p>
      </div>

      {/* 3D Stage & Podium Container */}
      <div className="w-full max-w-5xl mx-auto pt-8 pb-6 relative">
        
        {/* 3 Columns Grid for Rank 2, Rank 1, Rank 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end relative z-10">
          
          {/* RANK 2 COLUMN (LEFT) */}
          <div className="flex flex-col items-center order-2 md:order-1 w-full relative">
            {/* Card 2 - Card sits on top of pedestal tray */}
            <div className="w-[92%] min-h-[390px] bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-slate-200 dark:border-zinc-800 shadow-md relative flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 z-10">
              
              {/* Wreath Rank 2 Crown */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <LaurelWreathBadge rank={2} />
              </div>

              <div className="text-center space-y-3 pt-5">
                {/* 3D Avatar Circle */}
                <div className="relative w-24 h-24 mx-auto">
                  <img 
                    src={rank2.avatar} 
                    alt={rank2.studentName}
                    className="w-24 h-24 rounded-full border-4 border-emerald-500/30 bg-emerald-50 dark:bg-zinc-800 object-cover shadow-md"
                  />
                </div>

                {/* Rank 2 Pill */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                  <Medal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rank 2</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white leading-tight">
                    {rank2.studentName}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {rank2.college}
                  </p>
                </div>
              </div>

              {/* 2 Stats Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-left">
                  <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                    <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-950">
                      $
                    </div>
                    <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank2.xp.toLocaleString()} XP</strong>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 block">XP Earned</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-left">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Code2 className="w-3.5 h-3.5" />
                    <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank2.problemsSolved}</strong>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 block">Problems Solved</span>
                </div>
              </div>
            </div>

            {/* White 3D Step Platform Base Tray (Card sits on top) */}
            <div className="w-full relative -mt-6 z-0 pt-6">
              <div className="w-full h-12 bg-slate-100 dark:bg-zinc-800 rounded-[24px] border-2 border-slate-200 dark:border-zinc-700 shadow-lg flex flex-col overflow-hidden">
                {/* Top Shelf Surface (where card rests) */}
                <div className="h-4 bg-white dark:bg-zinc-750 border-b border-slate-200 dark:border-zinc-700" />
                {/* Front 3D Bevel Wall */}
                <div className="h-8 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900" />
              </div>
            </div>
          </div>

          {/* RANK 1 COLUMN (CENTER ELEVATED) */}
          <div className="flex flex-col items-center order-1 md:order-2 w-full z-20 relative">
            {/* Card 1 - Card sits on top of pedestal tray */}
            <div className="w-[92%] min-h-[450px] bg-gradient-to-b from-[#f0fdf4] via-white to-white dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 rounded-[28px] p-7 border-2 border-[#86efac] dark:border-emerald-500/60 shadow-2xl relative flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              
              {/* Wreath Rank 1 Gold Crown */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                <LaurelWreathBadge rank={1} />
              </div>

              <div className="text-center space-y-3 pt-6">
                {/* 3D Avatar Circle */}
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute -inset-1.5 rounded-full bg-emerald-500/30 blur-xs animate-pulse" />
                  <img 
                    src={rank1.avatar} 
                    alt={rank1.studentName}
                    className="relative w-28 h-28 rounded-full border-4 border-emerald-500 bg-emerald-50 dark:bg-zinc-800 object-cover shadow-xl"
                  />
                </div>

                {/* Rank 1 Green Crown Pill */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-md">
                  <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>Rank 1</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xl text-zinc-900 dark:text-white leading-tight">
                    {rank1.studentName}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {rank1.college}
                  </p>
                </div>
              </div>

              {/* 2 Stats Cards */}
              <div className="grid grid-cols-2 gap-2.5 text-xs pt-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs text-left">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                    <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-950">
                      $
                    </div>
                    <strong className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white font-mono">{rank1.xp.toLocaleString()} XP</strong>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">XP Earned</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs text-left">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Code2 className="w-4 h-4" />
                    <strong className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white font-mono">{rank1.problemsSolved}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block">Problems Solved</span>
                </div>
              </div>
            </div>

            {/* Green 3D Step Platform Base Tray (Card sits on top) */}
            <div className="w-full relative -mt-6 z-0 pt-6">
              <div className="w-full h-14 bg-[#16a34a] dark:bg-emerald-600 rounded-[26px] border-2 border-[#22c55e] shadow-xl flex flex-col relative">
                {/* Light Green Top Shelf Surface (visible around card base) */}
                <div className="h-4 bg-[#bbf7d0] dark:bg-emerald-800/80 rounded-t-[24px] border-b border-[#22c55e]" />
                {/* Front 3D Green Bevel Wall */}
                <div className="h-10 bg-gradient-to-b from-[#16a34a] to-[#15803d] rounded-b-[24px] flex items-center justify-center relative">
                  {/* Hexagon Shield Badge with Green Trophy Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-[#16a34a] text-[#16a34a] flex items-center justify-center shadow-lg transform -translate-y-3">
                    <Trophy className="w-6 h-6 text-[#16a34a] fill-[#16a34a]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RANK 3 COLUMN (RIGHT) */}
          <div className="flex flex-col items-center order-3 w-full relative">
            {/* Card 3 - Card sits on top of pedestal tray */}
            <div className="w-[92%] min-h-[390px] bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-slate-200 dark:border-zinc-800 shadow-md relative flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 z-10">
              
              {/* Wreath Rank 3 Crown */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <LaurelWreathBadge rank={3} />
              </div>

              <div className="text-center space-y-3 pt-5">
                {/* 3D Avatar Circle */}
                <div className="relative w-24 h-24 mx-auto">
                  <img 
                    src={rank3.avatar} 
                    alt={rank3.studentName}
                    className="w-24 h-24 rounded-full border-4 border-amber-600/30 bg-amber-50 dark:bg-zinc-800 object-cover shadow-md"
                  />
                </div>

                {/* Rank 3 Pill */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-900/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rank 3</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white leading-tight">
                    {rank3.studentName}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {rank3.college}
                  </p>
                </div>
              </div>

              {/* 2 Stats Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-left">
                  <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                    <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-[9px] font-black text-amber-950">
                      $
                    </div>
                    <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank3.xp.toLocaleString()} XP</strong>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 block">XP Earned</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-left">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                    <Code2 className="w-3.5 h-3.5" />
                    <strong className="text-xs font-black text-zinc-900 dark:text-white font-mono">{rank3.problemsSolved}</strong>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 block">Problems Solved</span>
                </div>
              </div>
            </div>

            {/* White 3D Step Platform Base Tray (Card sits on top) */}
            <div className="w-full relative -mt-6 z-0 pt-6">
              <div className="w-full h-12 bg-slate-100 dark:bg-zinc-800 rounded-[24px] border-2 border-slate-200 dark:border-zinc-700 shadow-lg flex flex-col overflow-hidden">
                {/* Top Shelf Surface (where card rests) */}
                <div className="h-4 bg-white dark:bg-zinc-750 border-b border-slate-200 dark:border-zinc-700" />
                {/* Front 3D Bevel Wall */}
                <div className="h-8 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Callout Banner Bar matching reference image */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-zinc-900/90 border border-emerald-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto shadow-2xs">
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
                    <img src={coder.avatar} alt={coder.studentName} className="w-9 h-9 rounded-full bg-zinc-200 object-cover" />
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
