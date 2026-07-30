'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Code2, 
  Zap, 
  TrendingUp, 
  Building2, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  X,
  Medal,
  Award
} from 'lucide-react';

interface CollegeRank {
  rank: number;
  name: string;
  location: string;
  activeStudents: string;
  problemsSolved: string;
  weeklyXP: string;
  participationPct: string;
  logo: string;
  isTopPerformer?: boolean;
}

const mockColleges: CollegeRank[] = [
  {
    rank: 1,
    name: 'Anna University',
    location: 'Chennai, Tamil Nadu',
    activeStudents: '2,756',
    problemsSolved: '12,896',
    weeklyXP: '145,230',
    participationPct: '92%',
    logo: 'AU',
    isTopPerformer: true
  },
  {
    rank: 2,
    name: 'PSG College of Technology',
    location: 'Coimbatore, Tamil Nadu',
    activeStudents: '1,842',
    problemsSolved: '8,642',
    weeklyXP: '96,540',
    participationPct: '78%',
    logo: 'PSG'
  },
  {
    rank: 3,
    name: 'AC Tech Campus',
    location: 'Chennai, Tamil Nadu',
    activeStudents: '1,356',
    problemsSolved: '6,231',
    weeklyXP: '72,860',
    participationPct: '65%',
    logo: 'ACET'
  },
  {
    rank: 4,
    name: 'Coimbatore Institute of Technology',
    location: 'Coimbatore, Tamil Nadu',
    activeStudents: '1,120',
    problemsSolved: '5,420',
    weeklyXP: '64,120',
    participationPct: '62%',
    logo: 'CIT'
  },
  {
    rank: 5,
    name: 'SSN College of Engineering',
    location: 'Chennai, Tamil Nadu',
    activeStudents: '1,050',
    problemsSolved: '4,980',
    weeklyXP: '58,900',
    participationPct: '59%',
    logo: 'SSN'
  }
];

export function CampusLeaderboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rank1 = mockColleges[0];
  const rank2 = mockColleges[1];
  const rank3 = mockColleges[2];

  return (
    <div className="space-y-8 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-6 left-8 text-zinc-200 dark:text-zinc-800/40 font-mono text-3xl font-bold select-none pointer-events-none">{`{ }`}</div>
      <div className="absolute top-6 right-8 text-zinc-200 dark:text-zinc-800/40 font-mono text-3xl font-bold select-none pointer-events-none">{`< />`}</div>

      {/* Section Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>CAMPUS LEADERBOARD</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          Top Performing <span className="text-emerald-600 dark:text-emerald-400">Colleges</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Colleges leading the <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">coding revolution</strong> this week.
        </p>
      </div>

      {/* 3D Podium Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2 max-w-5xl mx-auto">
        {/* RANK 2 - PSG (Left) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md relative space-y-4 hover:-translate-y-1 transition-all duration-300 order-2 md:order-1">
          {/* Rank Badge */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-900 flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-zinc-900">
            2
          </div>

          <div className="text-center space-y-2 pt-3">
            {/* Logo Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 mx-auto flex items-center justify-center font-black text-blue-700 dark:text-blue-300 text-lg shadow-inner">
              <span className="font-mono">PSG</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-snug">{rank2.name}</h3>
              <p className="text-[11px] text-zinc-400 font-medium">{rank2.location}</p>
            </div>
          </div>

          {/* 2x2 Stats Box */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Active Students</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank2.activeStudents}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Problems Solved</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank2.problemsSolved}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span className="text-[10px] font-bold">Weekly XP</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank2.weeklyXP}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Participation</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank2.participationPct}</span>
            </div>
          </div>
        </div>

        {/* RANK 1 - Anna University (Center - Highlighted & Taller with Pedestal) */}
        <div className="relative order-1 md:order-2 group">
          {/* Card #1 */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-amber-400/80 dark:border-amber-500/80 shadow-xl relative space-y-4 hover:-translate-y-1 transition-all duration-300 z-10">
            {/* Rank 1 Gold Ribbon Medal */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 flex items-center justify-center font-black text-lg shadow-lg border-2 border-white dark:border-zinc-900">
              1
            </div>

            <div className="text-center space-y-2 pt-4">
              {/* Crest Logo */}
              <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 mx-auto flex items-center justify-center font-black text-amber-800 dark:text-amber-300 text-xl shadow-inner">
                <span className="font-serif font-black">AU</span>
              </div>
              <div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-white leading-snug">{rank1.name}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{rank1.location}</p>
              </div>
            </div>

            {/* 2x2 Stats Box */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold">Active Students</span>
                </div>
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm">{rank1.activeStudents}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold">Problems Solved</span>
                </div>
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm">{rank1.problemsSolved}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                  <span className="text-[10px] font-bold">Weekly XP</span>
                </div>
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm">{rank1.weeklyXP}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold">Participation</span>
                </div>
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm">{rank1.participationPct}</span>
              </div>
            </div>

            {/* Gold Tag */}
            <div className="pt-1 flex justify-center">
              <span className="px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs border border-amber-300 dark:border-amber-700">
                ≡ƒÅå Top Performer
              </span>
            </div>
          </div>

          {/* 3D Green Base Pedestal Stand */}
          <div className="w-[104%] -ml-[2%] h-7 rounded-b-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-lg border-t border-emerald-400" />
        </div>

        {/* RANK 3 - AC Tech Campus (Right) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md relative space-y-4 hover:-translate-y-1 transition-all duration-300 order-3">
          {/* Rank Badge */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-zinc-900">
            3
          </div>

          <div className="text-center space-y-2 pt-3">
            {/* Logo Avatar */}
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 mx-auto flex items-center justify-center font-black text-amber-700 dark:text-amber-300 text-base shadow-inner">
              <span className="font-mono">ACET</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-snug">{rank3.name}</h3>
              <p className="text-[11px] text-zinc-400 font-medium">{rank3.location}</p>
            </div>
          </div>

          {/* 2x2 Stats Box */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Active Students</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank3.activeStudents}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Problems Solved</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank3.problemsSolved}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span className="text-[10px] font-bold">Weekly XP</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank3.weeklyXP}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold">Participation</span>
              </div>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{rank3.participationPct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Together, these colleges solved <strong className="text-emerald-600 dark:text-emerald-400 font-mono">27,769</strong> problems and earned <strong className="text-emerald-600 dark:text-emerald-400 font-mono">314,630 XP</strong> this week!
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Keep participating, keep improving, and keep coding! ≡ƒÜÇ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 shadow-2xs"
        >
          <span>View Full Rankings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full Rankings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Statewide Campus Leaderboard Rankings
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Top 5 Accredited Institutions ΓÇö Updated Live</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {mockColleges.map((col) => (
                  <div 
                    key={col.rank}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        col.rank === 1 ? 'bg-amber-400 text-amber-950 font-mono' :
                        col.rank === 2 ? 'bg-slate-300 text-slate-900 font-mono' :
                        col.rank === 3 ? 'bg-amber-700 text-white font-mono' :
                        'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono'
                      }`}>
                        #{col.rank}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">{col.name}</h4>
                        <span className="text-[11px] text-zinc-400">{col.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{col.problemsSolved} Solved</span>
                      <span className="font-bold text-amber-500">{col.weeklyXP} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-right bg-zinc-50/50 dark:bg-zinc-800/40">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs transition-all"
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
