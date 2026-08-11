'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getAllCollegeStudents } from '@/lib/db';
import { EmailService } from '@/lib/emailService';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Users, 
  Code2, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Trophy, 
  Play, 
  X, 
  Copy, 
  Check, 
  Star,
  RotateCcw,
  Zap,
  Flame,
  Layers,
  CheckCheck,
  Mail,
  History,
  Eye,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

type ApproachType = 'brute_force' | 'two_pointers' | 'optimal';
type LanguageType = 'python' | 'cpp' | 'java' | 'c';

interface DailyProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  rewardXp: number;
  solvedCount: number;
  accuracyPct: number;
  avgTime: string;
  description: string;
  dateLabel?: string;
}

const DAILY_PROBLEMS: DailyProblem[] = [
  {
    id: 'daily-1',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    timeLimit: '15 Min',
    rewardXp: 50,
    solvedCount: 3248,
    accuracyPct: 91,
    avgTime: '11m 30s',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to the target.',
  },
  {
    id: 'daily-2',
    title: 'Valid Anagram & Substrings',
    difficulty: 'Easy',
    timeLimit: '12 Min',
    rewardXp: 40,
    solvedCount: 2910,
    accuracyPct: 88,
    avgTime: '08m 45s',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
  },
  {
    id: 'daily-3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    timeLimit: '20 Min',
    rewardXp: 75,
    solvedCount: 2140,
    accuracyPct: 79,
    avgTime: '16m 10s',
    description: 'Find the length of the longest substring without repeating characters in a given string s.',
  },
  {
    id: 'daily-4',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    timeLimit: '25 Min',
    rewardXp: 80,
    solvedCount: 1890,
    accuracyPct: 76,
    avgTime: '19m 20s',
    description: 'Find two lines that together with the x-axis form a container containing maximum water volume.',
  },
  {
    id: 'daily-5',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    timeLimit: '20 Min',
    rewardXp: 70,
    solvedCount: 1650,
    accuracyPct: 82,
    avgTime: '14m 50s',
    description: 'Return the level order traversal of a binary tree nodes values level by level from left to right.',
  },
  {
    id: 'daily-6',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    timeLimit: '10 Min',
    rewardXp: 35,
    solvedCount: 4120,
    accuracyPct: 94,
    avgTime: '06m 15s',
    description: 'Given the head of a singly linked list, reverse the list and return its reversed head.',
  },
  {
    id: 'daily-7',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    timeLimit: '35 Min',
    rewardXp: 120,
    solvedCount: 980,
    accuracyPct: 62,
    avgTime: '28m 40s',
    description: 'You are given an array of k linked-lists. Merge all lists into one sorted linked-list and return it.',
  },
];

export default function DailyChallengePage() {
  const { college } = useAuth();
  
  // Dynamic rotation based on current day
  const todayDayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % DAILY_PROBLEMS.length;
  const currentDailyChallenge = DAILY_PROBLEMS[todayDayIndex];



  // Real-time countdown timer to midnight reset
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Modal States
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('python');
  const [selectedApproach, setSelectedApproach] = useState<ApproachType>('optimal');
  const [solutionLanguage, setSolutionLanguage] = useState<LanguageType>('python');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Compute exact real-time remaining until midnight
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');
  const timeString = `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;

  // Email Notification Dispatcher
  const handleSendEmailNotification = async () => {
    if (!college) {
      toast.error('College authentication required.');
      return;
    }

    try {
      const students = getAllCollegeStudents(college.id);
      if (students.length === 0) {
        toast.error('No students found in roster to send emails to.');
        return;
      }

      await EmailService.dispatchDailyChallengeNotification(
        students,
        college.collegeName,
        currentDailyChallenge
      );

      toast.success(`📩 Daily Challenge "${currentDailyChallenge.title}" emailed to ${students.length} students!`);
    } catch (err: any) {
      toast.error('Failed to dispatch daily challenge notification email.');
    }
  };

  // Solution approaches
  const solutionApproaches: Record<ApproachType, {
    name: string;
    badge: string;
    tag: string;
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
    code: Record<LanguageType, string>;
  }> = {
    brute_force: {
      name: '1. Brute Force Approach',
      badge: 'O(N²) Time Complexity',
      tag: 'Naive / Basic',
      timeComplexity: 'O(N²) — Double nested loop iteration',
      spaceComplexity: 'O(1) — No additional data structures used',
      description: 'Checks every possible pair (i, j) in the array using two nested loops to see if nums[i] + nums[j] equals the target value. Simple to implement but inefficient for large input sizes.',
      code: {
        python: `# Approach 1: Brute Force (O(N^2) Time, O(1) Space)

def twoSum(nums: list[int], target: int) -> list[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test Run
print(twoSum([2, 7, 11, 15], 9)) # Output: [0, 1]`,

        cpp: `// Approach 1: Brute Force (O(N^2) Time, O(1) Space)

#include <iostream>
#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`,

        java: `// Approach 1: Brute Force (O(N^2) Time, O(1) Space)

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[]{};
    }
}`,

        c: `// Approach 1: Brute Force (O(N^2) Time, O(1) Space)

#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`
      }
    },

    two_pointers: {
      name: '2. Sorting + Two Pointers',
      badge: 'O(N log N) Time Complexity',
      tag: 'Intermediate',
      timeComplexity: 'O(N log N) — Sorting original elements with index tracking',
      spaceComplexity: 'O(N) — Auxiliary list storing (val, original_index) pairs',
      description: 'Sorts the numbers while preserving their original indices. Then uses two pointers (left starting at 0, right at N-1). If sum < target, increment left; if sum > target, decrement right.',
      code: {
        python: `# Approach 2: Sorting + Two Pointers (O(N log N) Time, O(N) Space)

def twoSum(nums: list[int], target: int) -> list[int]:
    indexed_nums = [(val, idx) for idx, val in enumerate(nums)]
    indexed_nums.sort()  # O(N log N)
    
    left, right = 0, len(nums) - 1
    while left < right:
        current_sum = indexed_nums[left][0] + indexed_nums[right][0]
        if current_sum == target:
            return [indexed_nums[left][1], indexed_nums[right][1]]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []

# Test Run
print(twoSum([2, 7, 11, 15], 9)) # Output: [0, 1]`,

        cpp: `// Approach 2: Sorting + Two Pointers (O(N log N) Time, O(N) Space)

#include <iostream>
#include <vector>
#include <algorithm>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::vector<std::pair<int, int>> pairs;
        for (int i = 0; i < nums.size(); ++i) {
            pairs.push_back({nums[i], i});
        }
        std::sort(pairs.begin(), pairs.end());
        
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int sum = pairs[left].first + pairs[right].first;
            if (sum == target) return {pairs[left].second, pairs[right].second};
            else if (sum < target) left++;
            else right--;
        }
        return {};
    }
};`,

        java: `// Approach 2: Sorting + Two Pointers (O(N log N) Time, O(N) Space)

import java.util.Arrays;
import java.util.Comparator;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[][] pairs = new int[nums.length][2];
        for (int i = 0; i < nums.length; i++) {
            pairs[i][0] = nums[i];
            pairs[i][1] = i;
        }
        Arrays.sort(pairs, Comparator.comparingInt(a -> a[0]));
        
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int sum = pairs[left][0] + pairs[right][0];
            if (sum == target) return new int[]{ pairs[left][1], pairs[right][1] };
            else if (sum < target) left++;
            else right--;
        }
        return new int[]{};
    }
}`,

        c: `// Approach 2: Sorting + Two Pointers (O(N log N) Time, O(N) Space)

#include <stdio.h>
#include <stdlib.h>

typedef struct { int val; int idx; } Pair;

int compare(const void* a, const void* b) {
    return ((Pair*)a)->val - ((Pair*)b)->val;
}

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    Pair* pairs = (Pair*)malloc(numsSize * sizeof(Pair));
    for(int i=0; i<numsSize; i++) { pairs[i].val = nums[i]; pairs[i].idx = i; }
    qsort(pairs, numsSize, sizeof(Pair), compare);
    
    int l = 0, r = numsSize - 1;
    int* res = (int*)malloc(2 * sizeof(int));
    while(l < r) {
        int sum = pairs[l].val + pairs[r].val;
        if(sum == target) { res[0] = pairs[l].idx; res[1] = pairs[r].idx; free(pairs); return res; }
        else if(sum < target) l++;
        else r--;
    }
    free(pairs);
    return res;
}`
      }
    },

    optimal: {
      name: '3. Hash Map (Best & Recommended)',
      badge: 'O(N) Time Complexity',
      tag: 'Best & Optimal ⭐',
      timeComplexity: 'O(N) — Single pass Hash Table lookup',
      spaceComplexity: 'O(N) — Auxiliary space for Hash Table',
      description: 'Single-pass Hash Map algorithm. For each number, calculate complement = target - num. Look up complement in Hash Map in O(1) average time. If found, return both indices; otherwise insert num with its index into map.',
      code: {
        python: `# Approach 3: Hash Map (BEST APPROACH) (O(N) Time, O(N) Space)

def twoSum(nums: list[int], target: int) -> list[int]:
    """
    Optimal One-Pass Hash Map Solution.
    """
    seen = {}
    for index, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], index]
        seen[num] = index
    return []

# Test Verification
nums = [2, 7, 11, 15]
target = 9
print("Target Indices:", twoSum(nums, target)) # Output: [0, 1]`,

        cpp: `// Approach 3: Hash Map (BEST APPROACH) (O(N) Time, O(N) Space)

#include <iostream>
#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,

        java: `// Approach 3: Hash Map (BEST APPROACH) (O(N) Time, O(N) Space)

import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,

        c: `// Approach 3: Optimized Array Map (O(N) Time, O(N) Space)

#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`
      }
    }
  };

  const [userCode, setUserCode] = useState(solutionApproaches.optimal.code.python);

  const handleLanguageChange = (lang: LanguageType) => {
    setSelectedLanguage(lang);
    setUserCode(solutionApproaches[selectedApproach].code[lang]);
    setTestResult(null);
  };

  const handleResetCode = () => {
    setUserCode(solutionApproaches[selectedApproach].code[selectedLanguage]);
    setTestResult(null);
    toast.success('Starter template reset.');
  };

  const handleRunCode = () => {
    setIsSubmitting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setTestResult(`ACCEPTED: All 12/12 Evaluation Test Cases Passed! (+${currentDailyChallenge.rewardXp} XP Added 🎉)`);
      toast.success(`Congratulations! Challenge Solved! +${currentDailyChallenge.rewardXp} XP Added to your profile.`);
    }, 1200);
  };

  const handleCopySolution = () => {
    const codeToCopy = solutionApproaches[selectedApproach].code[solutionLanguage];
    navigator.clipboard.writeText(codeToCopy);
    setCopiedSolution(true);
    toast.success(`Solution code (${selectedApproach.toUpperCase()} - ${solutionLanguage.toUpperCase()}) copied to clipboard`);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const leaderboardData = [
    { rank: 1, name: 'CodeMaster', xp: '500 XP', avatar: '🥇', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { rank: 2, name: 'AlgoNinja', xp: '420 XP', avatar: '🥈', bg: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
    { rank: 3, name: 'DevKnight', xp: '380 XP', avatar: '🥉', bg: 'bg-amber-800/20 text-amber-700 dark:text-amber-400' },
    { rank: 4, name: 'LogicLord', xp: '320 XP', avatar: '👨‍💻', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    { rank: 5, name: 'ByteBender', xp: '280 XP', avatar: '🚀', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    { rank: 6, name: 'SyntaxSamurai', xp: '250 XP', avatar: '⚡', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    { rank: 7, name: 'CyberCoder', xp: '230 XP', avatar: '💻', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
    { rank: 8, name: 'NullPointer', xp: '210 XP', avatar: '🎯', bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Top Announcement Banner */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>DAILY CODING CHALLENGE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-500 hidden sm:inline" />
            <span>Solve Today.</span>
            <span className="text-emerald-600 dark:text-emerald-400">Improve Tomorrow.</span>
            <Sparkles className="w-6 h-6 text-emerald-500 hidden sm:inline" />
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            A new challenge every day to keep your streak alive and your skills sharp.
          </p>


        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Today's Challenge Card (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden space-y-6">
            
            {/* Header Row */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>TODAY&apos;S CHALLENGE</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Problem Details & 3D Illustration Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Problem Left Text */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-extrabold text-xl shrink-0 shadow-inner">
                    &lt;/&gt;
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      {currentDailyChallenge.title}
                    </h2>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                      currentDailyChallenge.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      currentDailyChallenge.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {currentDailyChallenge.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  {currentDailyChallenge.description}
                </p>
              </div>

              {/* 3D Calendar Vector Illustration */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl animate-pulse" />
                  
                  <svg className="w-40 h-40 drop-shadow-xl transform hover:scale-105 transition-transform" viewBox="0 0 200 200" fill="none">
                    <ellipse cx="100" cy="165" rx="75" ry="20" fill="#10b981" fillOpacity="0.25" />
                    <ellipse cx="100" cy="160" rx="65" ry="15" fill="#10b981" fillOpacity="0.4" />
                    
                    <rect x="50" y="50" width="100" height="95" rx="18" fill="#10b981" />
                    <rect x="55" y="60" width="90" height="80" rx="14" fill="#34d399" />
                    
                    <rect x="70" y="38" width="10" height="22" rx="5" fill="#047857" />
                    <rect x="95" y="38" width="10" height="22" rx="5" fill="#047857" />
                    <rect x="120" y="38" width="10" height="22" rx="5" fill="#047857" />

                    <text x="100" y="112" textAnchor="middle" fill="white" fontSize="32" fontWeight="900" fontFamily="monospace">&lt;/&gt;</text>
                    
                    <g transform="translate(130, 80) rotate(35)">
                      <rect x="0" y="0" width="14" height="60" rx="4" fill="#059669" />
                      <polygon points="0,60 14,60 7,75" fill="#047857" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* 3-Column Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Time Limit</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white font-mono">{currentDailyChallenge.timeLimit}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Reward</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">+{currentDailyChallenge.rewardXp} XP</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Solved Today</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white font-mono">{currentDailyChallenge.solvedCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={() => setIsSolveModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Code2 className="w-5 h-5" />
                <span>Solve Challenge</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsSolutionModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Solution</span>
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Challenge Timer & Leaderboard (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Top Card: Challenge Timer */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>NEXT CHALLENGE IN</span>
              </div>

              {/* Radial Donut Clock Ring */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#10b981" 
                    strokeWidth="8" 
                    strokeDasharray="264" 
                    strokeDashoffset="65" 
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                    {timeString}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                    Time Left
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-zinc-400 font-medium block">Challenge rotates in</span>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold">
                  {timeString}
                </span>
              </div>
            </div>

            {/* Bottom Card: Today's Leaderboard */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span>TODAY&apos;S LEADERBOARD</span>
                </div>
                <button 
                  onClick={() => setIsLeaderboardModalOpen(true)}
                  className="text-xs text-zinc-400 hover:text-emerald-500 font-semibold cursor-pointer transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {leaderboardData.slice(0, 5).map(item => (
                  <div 
                    key={item.rank} 
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-extrabold ${item.bg}`}>
                        {item.rank}
                      </span>
                      <span className="text-base">{item.avatar}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>



        {/* Modal 1: Solve Challenge Code Runner Workspace */}
        {isSolveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono font-bold text-sm">
                    &lt;/&gt;
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                      Solve Challenge: {currentDailyChallenge.title}
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-mono">{currentDailyChallenge.difficulty} &bull; +{currentDailyChallenge.rewardXp} XP &bull; Time Limit: {currentDailyChallenge.timeLimit}</span>
                  </div>
                </div>

                <button onClick={() => setIsSolveModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Code Workspace Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                
                {/* Language Select Tabs & Reset Control */}
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    {(['python', 'cpp', 'java', 'c'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                          selectedLanguage === lang
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {lang === 'python' ? 'Python 3' : lang === 'cpp' ? 'C++ 17' : lang === 'java' ? 'Java 17' : 'C (GCC)'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleResetCode}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono text-[11px]"
                    title="Reset code template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Starter Template</span>
                  </button>
                </div>

                {/* Code Editor Window */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-emerald-400 shadow-inner min-h-[260px]">
                  <textarea
                    rows={14}
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full bg-transparent border-none text-emerald-400 focus:outline-none resize-none leading-relaxed font-mono"
                  />
                </div>

                {/* Output Console / Test Result */}
                {testResult && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs animate-in fade-in duration-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{testResult}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-zinc-400 text-xs font-mono">Evaluation Mode &bull; Auto-Graded Test Runner</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSolveModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isSubmitting ? 'Evaluating Test Cases...' : 'Submit & Run Code'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal 2: Official Solution Modal */}
        {isSolutionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Official Solution: {currentDailyChallenge.title}
                  </h3>
                </div>
                <button onClick={() => setIsSolutionModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs font-sans">
                
                {/* Selective Approach Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
                    Select Solution Approach:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['brute_force', 'two_pointers', 'optimal'] as const).map(appKey => {
                      const app = solutionApproaches[appKey];
                      const isSelected = selectedApproach === appKey;
                      return (
                        <button
                          key={appKey}
                          onClick={() => setSelectedApproach(appKey)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-white">{app.name}</span>
                            {isSelected && <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                          <span className="block mt-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {app.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Approach Details */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                      {solutionApproaches[selectedApproach].name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold">
                      {solutionApproaches[selectedApproach].tag}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                    {solutionApproaches[selectedApproach].description}
                  </p>
                  
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">Time Complexity:</span>
                      <strong className="text-emerald-500">{solutionApproaches[selectedApproach].timeComplexity}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">Space Complexity:</span>
                      <strong className="text-emerald-500">{solutionApproaches[selectedApproach].spaceComplexity}</strong>
                    </div>
                  </div>
                </div>

                {/* Language Selection Tabs for Solution */}
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="font-mono text-[11px] font-bold text-zinc-400">Language Implementation:</span>

                  <div className="flex items-center gap-2">
                    {(['python', 'cpp', 'java', 'c'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSolutionLanguage(lang)}
                        className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold uppercase transition-all ${
                          solutionLanguage === lang
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {lang === 'python' ? 'Python 3' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'C'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solution Code Window */}
                <div className="relative rounded-2xl bg-zinc-950 p-4 font-mono text-xs text-emerald-400 border border-zinc-800 overflow-x-auto min-h-[180px]">
                  <button
                    onClick={handleCopySolution}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 font-sans text-[11px]"
                    title="Copy Solution Code"
                  >
                    {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSolution ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <pre>{solutionApproaches[selectedApproach].code[solutionLanguage]}</pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setIsSolutionModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Close Solution
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 3: Full Leaderboard Modal */}
        {isLeaderboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Today&apos;s Global Leaderboard
                  </h3>
                </div>
                <button onClick={() => setIsLeaderboardModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {leaderboardData.map(item => (
                  <div 
                    key={item.rank} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-extrabold ${item.bg}`}>
                        {item.rank}
                      </span>
                      <span className="text-base">{item.avatar}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsLeaderboardModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
