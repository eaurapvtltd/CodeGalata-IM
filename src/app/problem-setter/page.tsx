'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { getCollegeProblems, createProblem, updateProblem, deleteProblem } from '@/lib/db';
import { Problem } from '@/lib/types';
import { 
  Code2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Check, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Code, 
  Quote, 
  Table as TableIcon,
  Sparkles,
  Layers,
  Building2,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'list' | 'initial_create' | 'wizard';

export default function ProblemSetterPage() {
  const { college } = useAuth();

  // Data State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Active View & Editing State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
  const [viewingProblem, setViewingProblem] = useState<Problem | null>(null);

  // Form Fields (Comprehensive 8-Step State)
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['C (GCC 9.2.0)']);
  const [problemStatementText, setProblemStatementText] = useState('');
  
  // Step 2: Default Code
  const [activeLangTab, setActiveLangTab] = useState<string>('C (GCC 9.2.0)');
  const [defaultCodeMap, setDefaultCodeMap] = useState<Record<string, string>>({
    'C (GCC 9.2.0)': '#include <stdio.h>\n\nint main() {\n    // Type your Solution\n    return 0;\n}'
  });

  // Step 3: Test Cases
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [hiddenTestCases, setHiddenTestCases] = useState('');

  // Step 4: Hints
  const [hintsList, setHintsList] = useState<string[]>(['Consider using hash maps or array pointers for O(N) lookup.']);
  const [newHintInput, setNewHintInput] = useState('');

  // Step 5: Solutions
  const [solutionTitle, setSolutionTitle] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('O(1)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(1)');
  const [isSolutionPublic, setIsSolutionPublic] = useState<boolean>(true);
  const [solutionCode, setSolutionCode] = useState('');

  // Step 6: Advanced Options
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [constraints, setConstraints] = useState('1 <= N <= 10^5');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['Google', 'Amazon']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays & Hashing']);

  // Step 7: Real World and Outcome
  const [realWorldOutcome, setRealWorldOutcome] = useState('Used extensively in high-frequency trading database indexing and memory cache lookups.');

  const loadProblems = () => {
    if (college) {
      const list = getCollegeProblems(college.id);
      setProblems(list);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [college]);

  // Mark unsaved changes on input change
  const markDirty = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  const resetForm = () => {
    setEditingProblemId(null);
    setTitle('');
    setShortDescription('');
    setSelectedLanguages(['C (GCC 9.2.0)']);
    setProblemStatementText('');
    setDefaultCodeMap({
      'C (GCC 9.2.0)': '#include <stdio.h>\n\nint main() {\n    // Type your Solution\n    return 0;\n}'
    });
    setSampleInput('');
    setSampleOutput('');
    setExplanation('');
    setHiddenTestCases('');
    setHintsList(['Consider using hash maps or array pointers for O(N) lookup.']);
    setSolutionTitle('');
    setTimeComplexity('O(1)');
    setSpaceComplexity('O(1)');
    setIsSolutionPublic(true);
    setSolutionCode('');
    setDifficulty('Easy');
    setConstraints('1 <= N <= 10^5');
    setSelectedCompanies(['Google', 'Amazon']);
    setSelectedTopics(['Arrays & Hashing']);
    setRealWorldOutcome('Used extensively in high-frequency trading database indexing.');
    setCurrentStep(1);
    setHasUnsavedChanges(false);
  };

  // Start Create Problem (Image 1 screen)
  const openInitialCreateScreen = () => {
    resetForm();
    setViewMode('initial_create');
  };

  // Transition from Initial Create to 8-Step Wizard
  const handleProceedToWizard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Problem Title is required.');
      return;
    }
    if (!solutionTitle) {
      setSolutionTitle(`// Default solution for problem "${title.trim()}" in ${selectedLanguages[0] || 'C (GCC 9.2.0)'}`);
    }
    if (!solutionCode) {
      setSolutionCode(`// Default solution for problem "${title.trim()}" in ${selectedLanguages[0] || 'C (GCC 9.2.0)'}`);
    }
    setViewMode('wizard');
    setCurrentStep(1);
  };

  // Open existing problem in wizard
  const openEditWizard = (prob: Problem) => {
    setEditingProblemId(prob.id);
    setTitle(prob.title);
    setShortDescription(prob.shortDescription || prob.description.substring(0, 100));
    setProblemStatementText(prob.description);
    setSelectedLanguages(prob.languages || ['C (GCC 9.2.0)']);
    setDefaultCodeMap(prob.defaultCode || {
      'C (GCC 9.2.0)': '#include <stdio.h>\n\nint main() {\n    // Type your Solution\n    return 0;\n}'
    });
    setDifficulty(prob.difficulty);
    setConstraints(prob.constraints || '1 <= N <= 10^5');
    setSampleInput(prob.sampleInput || '');
    setSampleOutput(prob.sampleOutput || '');
    setExplanation(prob.explanation || '');
    setHiddenTestCases(prob.hiddenTestCases || '');
    setHintsList(prob.hints || ['Consider using hash maps or array pointers.']);
    setSolutionTitle(prob.solutionTitle || `// Default solution for problem "${prob.title}" in C (GCC 9.2.0)`);
    setSolutionCode(prob.solutionCode || `// Default solution for problem "${prob.title}" in C (GCC 9.2.0)`);
    setTimeComplexity(prob.timeComplexity || 'O(1)');
    setSpaceComplexity(prob.spaceComplexity || 'O(1)');
    setIsSolutionPublic(prob.isSolutionPublic ?? true);
    setSelectedCompanies(prob.companies || ['Google']);
    setSelectedTopics(prob.topics || ['Arrays']);
    setRealWorldOutcome(prob.realWorldOutcome || 'Real world data lookup acceleration.');
    
    setViewMode('wizard');
    setCurrentStep(1);
    setHasUnsavedChanges(false);
  };

  // Save changes handler
  const handleSaveProblem = () => {
    if (!college) return;
    if (!title.trim()) {
      toast.error('Problem Title is required.');
      return;
    }

    try {
      const problemData: Omit<Problem, 'id' | 'collegeId' | 'createdAt'> = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: problemStatementText.trim() || shortDescription.trim(),
        languages: selectedLanguages,
        defaultCode: defaultCodeMap,
        difficulty,
        inputFormat: 'Standard Input',
        outputFormat: 'Standard Output',
        constraints: constraints.trim(),
        sampleInput: sampleInput.trim(),
        sampleOutput: sampleOutput.trim(),
        explanation: explanation.trim(),
        hiddenTestCases: hiddenTestCases.trim(),
        hints: hintsList,
        solutionTitle: solutionTitle.trim(),
        solutionCode: solutionCode.trim(),
        timeComplexity,
        spaceComplexity,
        isSolutionPublic,
        companies: selectedCompanies,
        topics: selectedTopics,
        realWorldOutcome: realWorldOutcome.trim(),
      };

      if (editingProblemId) {
        updateProblem(college.id, editingProblemId, problemData);
        toast.success(`Problem "${title}" updated successfully!`);
      } else {
        const created = createProblem(college.id, problemData);
        setEditingProblemId(created.id);
        toast.success(`Problem "${title}" created and saved!`);
      }

      setHasUnsavedChanges(false);
      loadProblems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save problem');
    }
  };

  const handleDeleteConfirm = () => {
    if (!college || !deletingProblem) return;
    try {
      deleteProblem(college.id, deletingProblem.id);
      toast.success(`Problem "${deletingProblem.title}" deleted.`);
      setDeletingProblem(null);
      loadProblems();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting problem');
    }
  };

  // Dynamic Completion Percentage Calculation
  const calculateCompletionPct = () => {
    let completedSteps = 0;
    if (title.trim() && shortDescription.trim()) completedSteps++;
    if (defaultCodeMap[activeLangTab]?.trim()) completedSteps++;
    if (sampleInput.trim() && sampleOutput.trim()) completedSteps++;
    if (hintsList.length > 0) completedSteps++;
    if (solutionCode.trim()) completedSteps++;
    if (constraints.trim()) completedSteps++;
    if (realWorldOutcome.trim()) completedSteps++;
    if (title.trim()) completedSteps++;
    return Math.round((completedSteps / 8) * 100);
  };

  // Filtered list
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const availableLanguagesList = [
    'C (GCC 9.2.0)',
    'C++ (GCC 9.2.0)',
    'Java (OpenJDK 13.0.1)',
    'Python 3 (3.8.1)'
  ];

  const wizardSteps = [
    { num: 1, label: 'Problem Statement' },
    { num: 2, label: 'Default Code' },
    { num: 3, label: 'Test Cases' },
    { num: 4, label: 'Hints' },
    { num: 5, label: 'Solutions' },
    { num: 6, label: 'Advanced Options' },
    { num: 7, label: 'Real World and Outcome' },
    { num: 8, label: 'Review' },
  ];

  // -------------------------------------------------------------
  // RENDER VIEW 1: INITIAL CREATE PROBLEM SCREEN (Image 1 Layout)
  // -------------------------------------------------------------
  if (viewMode === 'initial_create') {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <button 
              onClick={() => setViewMode('list')} 
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold"
              title="Back to Problems"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Problems</h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span className="text-zinc-500">Problems</span>
              <span>&gt;</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">Create</span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Create Problem
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Start creating problems for your students
              </p>
            </div>

            <form onSubmit={handleProceedToWizard} className="space-y-6">
              {/* Title Field with embedded right counter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Title<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={60}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title"
                    required
                    className="w-full pl-4 pr-14 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                    {title.length}/60
                  </span>
                </div>
              </div>

              {/* Short Description Field with embedded bottom-right counter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Short Description<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={5}
                    maxLength={500}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Enter short description"
                    required
                    className="w-full p-4 pb-8 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                  <span className="absolute right-4 bottom-3 text-zinc-400 font-mono text-xs">
                    {shortDescription.length}/500
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Write a short description</p>
              </div>

              {/* Languages Selection Custom Dropdown Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Languages<span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                      {selectedLanguages.length > 0 
                        ? `Selected (${selectedLanguages.length}): ${selectedLanguages.join(', ')}`
                        : 'Select programming languages'}
                    </span>
                    <span className="text-zinc-400 text-xs font-bold">&uarr;&darr;</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Select one or more programming languages</p>
                  
                  {/* Language Option Checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {availableLanguagesList.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedLanguages.length > 1) {
                                setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                              }
                            } else {
                              setSelectedLanguages([...selectedLanguages, lang]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <span className="truncate">{lang}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit / Create Problem Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all mt-4"
              >
                Create Problem
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ---------------------------------------------------------------------
  // RENDER VIEW 2: 8-STEP WIZARD EDITOR (Images 2, 3, 4, 5 Exact Design)
  // ---------------------------------------------------------------------
  if (viewMode === 'wizard') {
    return (
      <AdminLayout hideSidebar={true}>
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white dark:bg-zinc-950">
          
          {/* MOBILE STEP NAVIGATION BAR (Visible only on mobile < md) */}
          <div className="md:hidden bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('list')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-xl shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Step {currentStep} of 8</span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{calculateCompletionPct()}% Complete</span>
              </div>
            </div>

            {/* Scrollable Step Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {wizardSteps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = step.num < currentStep;
                return (
                  <button
                    key={step.num}
                    onClick={() => setCurrentStep(step.num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <span>{step.num}. {step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WIZARD FULL-HEIGHT LEFT SIDEBAR (Desktop >= md) */}
          <aside className="hidden md:flex w-64 md:w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800/80 p-6 flex-col justify-between bg-zinc-50/60 dark:bg-zinc-900/60 h-full overflow-y-auto">
            <div className="space-y-6">
              {/* Back to problems link */}
              <button
                onClick={() => setViewMode('list')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 rounded-xl shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Problems</span>
              </button>

              {/* Problem Title Label */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Editing Problem</span>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-white truncate" title={title}>
                  {title || 'Sample Problem'}
                </h2>
              </div>

              {/* 8-Step Navigation List */}
              <nav className="space-y-1.5">
                {wizardSteps.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = step.num < currentStep;
                  return (
                    <button
                      key={step.num}
                      onClick={() => setCurrentStep(step.num)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : isCompleted
                          ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                          : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                        isActive
                          ? 'bg-white text-emerald-600'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Dynamic Completion Progress Footer */}
            <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Completion</span>
                <span className="font-mono text-zinc-900 dark:text-white font-extrabold">{calculateCompletionPct()}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${calculateCompletionPct()}%` }} 
                />
              </div>
            </div>
          </aside>

          {/* WIZARD RIGHT CONTENT PANEL (Full height scrollable) */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-4 sm:p-6 md:p-10 bg-white dark:bg-zinc-950">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                {/* Top Header Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                      {wizardSteps.find(s => s.num === currentStep)?.label}
                    </h2>
                    <p className="text-xs text-zinc-400">Step {currentStep} of 8</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Unsaved changes
                      </span>
                    )}

                    <button
                      onClick={handleSaveProblem}
                      className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>

                    <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                      <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        &lt; Previous
                      </button>
                      <button
                        onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                        disabled={currentStep === 8}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Next &gt;
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 1: PROBLEM STATEMENT (Image 2) */}
                {currentStep === 1 && (
                  <div className="space-y-5 text-xs">
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                      />
                    </div>

                    {/* Rich Text Toolbar Mockup */}
                    <div className="space-y-1">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description *</label>
                      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/80">
                        {/* Editor Toolbar */}
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-1.5 flex-wrap text-zinc-500">
                          <span className="px-2 py-1 rounded bg-emerald-500 text-white font-bold text-[10px]">P</span>
                          {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map(h => (
                            <button key={h} type="button" className="px-1.5 py-0.5 text-[10px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">{h}</button>
                          ))}
                          <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Bold className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Italic className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Underline className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Strikethrough className="w-3.5 h-3.5" /></button>
                          <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><List className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><ListOrdered className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><LinkIcon className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Code className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Quote className="w-3.5 h-3.5" /></button>
                        </div>
                        <textarea
                          rows={4}
                          value={shortDescription}
                          onChange={(e) => { setShortDescription(e.target.value); markDirty(); }}
                          placeholder="Write short description..."
                          className="w-full p-3 bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Languages Tag Selector */}
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Languages *</label>
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                        <span className="text-zinc-500 font-semibold">{selectedLanguages.length} language(s) selected</span>
                        <p className="text-[11px] text-emerald-500 font-mono mt-1">Selected: {selectedLanguages.join(', ')}</p>
                      </div>
                    </div>

                    {/* Full Problem Statement Rich Editor */}
                    <div className="space-y-1">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Problem Statement *</label>
                      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/80">
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-1.5 text-zinc-500">
                          <span className="px-2 py-1 rounded bg-emerald-500 text-white font-bold text-[10px]">P</span>
                          {['H1', 'H2', 'H3', 'H4'].map(h => (
                            <button key={h} type="button" className="px-1.5 py-0.5 text-[10px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">{h}</button>
                          ))}
                          <button type="button" className="p-1 hover:bg-zinc-200 rounded"><Bold className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 rounded"><Italic className="w-3.5 h-3.5" /></button>
                        </div>
                        <textarea
                          rows={6}
                          value={problemStatementText}
                          onChange={(e) => { setProblemStatementText(e.target.value); markDirty(); }}
                          placeholder="Write the detailed problem statement here..."
                          className="w-full p-3 bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none resize-y"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DEFAULT CODE (Image 3) */}
                {currentStep === 2 && (
                  <div className="space-y-4 text-xs">
                    {/* Language Tabs */}
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      {selectedLanguages.map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveLangTab(lang)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                            activeLangTab === lang
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>

                    {/* Code Editor Windows */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 font-mono text-emerald-400 p-4">
                      <div className="text-zinc-500 text-[11px] mb-2 border-b border-zinc-800 pb-2">
                        // Starter template provided to student for {activeLangTab}
                      </div>
                      <textarea
                        rows={14}
                        value={defaultCodeMap[activeLangTab] || ''}
                        onChange={(e) => {
                          setDefaultCodeMap({ ...defaultCodeMap, [activeLangTab]: e.target.value });
                          markDirty();
                        }}
                        className="w-full bg-transparent text-emerald-400 focus:outline-none resize-y font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: TEST CASES */}
                {currentStep === 3 && (
                  <div className="space-y-6 text-xs">
                    {/* Public Sample Test Case */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl space-y-4">
                      <h4 className="font-bold text-zinc-900 dark:text-white">Sample Test Case 1 (Public)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-zinc-500 mb-1">Sample Input</label>
                          <textarea
                            rows={3}
                            value={sampleInput}
                            onChange={(e) => { setSampleInput(e.target.value); markDirty(); }}
                            placeholder="e.g. 2 7 11 15\n9"
                            className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-500 mb-1">Sample Output</label>
                          <textarea
                            rows={3}
                            value={sampleOutput}
                            onChange={(e) => { setSampleOutput(e.target.value); markDirty(); }}
                            placeholder="e.g. 0 1"
                            className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-500 mb-1">Explanation</label>
                        <input
                          type="text"
                          value={explanation}
                          onChange={(e) => { setExplanation(e.target.value); markDirty(); }}
                          placeholder="e.g. nums[0] + nums[1] == 9, so return indices [0, 1]"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    {/* Hidden Test Cases */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl space-y-2">
                      <h4 className="font-bold text-zinc-900 dark:text-white">Hidden Evaluation Test Cases</h4>
                      <p className="text-[11px] text-zinc-400">Used by automated grading compiler to evaluate submissions.</p>
                      <textarea
                        rows={4}
                        value={hiddenTestCases}
                        onChange={(e) => { setHiddenTestCases(e.target.value); markDirty(); }}
                        placeholder="Format: Input -> Output per line&#10;e.g. 3 2 4 -> 1 2"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: HINTS */}
                {currentStep === 4 && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-zinc-900 dark:text-white">Problem Solving Hints</h4>
                    
                    <div className="space-y-2">
                      {hintsList.map((hint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">Hint {index + 1}: {hint}</span>
                          <button 
                            type="button"
                            onClick={() => setHintsList(hintsList.filter((_, idx) => idx !== index))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newHintInput}
                        onChange={(e) => setNewHintInput(e.target.value)}
                        placeholder="Type new hint..."
                        className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newHintInput.trim()) {
                            setHintsList([...hintsList, newHintInput.trim()]);
                            setNewHintInput('');
                            markDirty();
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                      >
                        Add Hint
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: SOLUTIONS (Image 4) */}
                {currentStep === 5 && (
                  <div className="space-y-5 text-xs">
                    {/* Language Pills Bar */}
                    <div className="flex items-center gap-2 flex-wrap border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold font-mono text-[11px]">
                        {activeLangTab}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-[10px]">
                        (1 solution)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        {isSolutionPublic ? '1 public' : '0 public'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-semibold text-[10px]">
                        {!isSolutionPublic ? '1 private' : '0 private'}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Solution Title</label>
                      <input
                        type="text"
                        value={solutionTitle}
                        onChange={(e) => { setSolutionTitle(e.target.value); markDirty(); }}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Time Complexity</label>
                        <input
                          type="text"
                          value={timeComplexity}
                          onChange={(e) => { setTimeComplexity(e.target.value); markDirty(); }}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Space Complexity</label>
                        <input
                          type="text"
                          value={spaceComplexity}
                          onChange={(e) => { setSpaceComplexity(e.target.value); markDirty(); }}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-xl">
                      <input
                        type="checkbox"
                        checked={isSolutionPublic}
                        onChange={(e) => { setIsSolutionPublic(e.target.checked); markDirty(); }}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Make this solution variant public</span>
                    </div>

                    {/* Solution Code Editor */}
                    <div className="space-y-1">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Code</label>
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 font-mono text-emerald-400 p-4">
                        <textarea
                          rows={10}
                          value={solutionCode}
                          onChange={(e) => { setSolutionCode(e.target.value); markDirty(); }}
                          className="w-full bg-transparent text-emerald-400 focus:outline-none resize-y font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: ADVANCED OPTIONS (Image 5) */}
                {currentStep === 6 && (
                  <div className="space-y-5 text-xs">
                    {/* Difficulty */}
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Difficulty *</label>
                      <select
                        value={difficulty}
                        onChange={(e) => { setDifficulty(e.target.value as any); markDirty(); }}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                      >
                        <option value="Easy">EASY</option>
                        <option value="Medium">MEDIUM</option>
                        <option value="Hard">HARD</option>
                      </select>
                    </div>

                    {/* Constraints Editor Toolbar */}
                    <div className="space-y-1">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Constraints *</label>
                      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/80">
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-2 text-zinc-500">
                          <button type="button" className="p-1 hover:bg-zinc-200 rounded"><Bold className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1 hover:bg-zinc-200 rounded"><Italic className="w-3.5 h-3.5" /></button>
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded">x²</span>
                        </div>
                        <textarea
                          rows={3}
                          value={constraints}
                          onChange={(e) => { setConstraints(e.target.value); markDirty(); }}
                          className="w-full p-3 bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.success('Constraint formatted')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs mt-2 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Constraint</span>
                      </button>
                    </div>

                    {/* Companies */}
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Companies (Optional)</label>
                      <select
                        multiple
                        value={selectedCompanies}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, o => o.value);
                          setSelectedCompanies(opts);
                          markDirty();
                        }}
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white h-24"
                      >
                        <option value="Google">Google</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Meta">Meta</option>
                        <option value="Apple">Apple</option>
                      </select>
                    </div>

                    {/* Topics */}
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Topics (Optional)</label>
                      <select
                        multiple
                        value={selectedTopics}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, o => o.value);
                          setSelectedTopics(opts);
                          markDirty();
                        }}
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white h-24"
                      >
                        <option value="Arrays & Hashing">Arrays & Hashing</option>
                        <option value="Strings">Strings</option>
                        <option value="Dynamic Programming">Dynamic Programming</option>
                        <option value="Graph Theory">Graph Theory</option>
                        <option value="Trees">Trees</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 7: REAL WORLD AND OUTCOME */}
                {currentStep === 7 && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Real World Application & Learning Outcome</label>
                      <textarea
                        rows={6}
                        value={realWorldOutcome}
                        onChange={(e) => { setRealWorldOutcome(e.target.value); markDirty(); }}
                        placeholder="Explain how this problem connects to industry scenarios..."
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 8: REVIEW */}
                {currentStep === 8 && (
                  <div className="space-y-6 text-xs">
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">{title || 'Untitled Problem'}</h3>
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                          difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                          difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {difficulty}
                        </span>
                      </div>

                      <p className="text-zinc-600 dark:text-zinc-400">{shortDescription}</p>

                      <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Languages</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedLanguages.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Constraints</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{constraints}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleSaveProblem();
                        setViewMode('list');
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Publish Problem to Question Bank</span>
                    </button>
                  </div>
                )}
            </div>
          </main>
        </div>
      </AdminLayout>
    );
  }

  // -------------------------------------------------------------
  // RENDER VIEW 3: QUESTION BANK DIRECTORY (Default Overview)
  // -------------------------------------------------------------
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-7 h-7 text-emerald-500" />
              Problems - Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create, edit, and manage algorithmic coding challenges for your college students.
            </p>
          </div>

          <button
            onClick={openInitialCreateScreen}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Problem</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problem title..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-500 shrink-0">Difficulty:</span>
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  difficultyFilter === diff
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problem List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Code2 className="w-12 h-12 text-zinc-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No problems found</p>
              <p className="text-xs text-zinc-400 mt-1">Click &quot;Create New Problem&quot; to build your question bank.</p>
            </div>
          ) : (
            filteredProblems.map((prob) => (
              <div
                key={prob.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      prob.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' :
                      prob.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600' : 'bg-red-50 dark:bg-red-950/60 text-red-600'
                    }`}>
                      {prob.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{new Date(prob.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white line-clamp-1">{prob.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{prob.shortDescription || prob.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {prob.languages?.[0] || 'C (GCC 9.2.0)'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditWizard(prob)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit in 8-Step Wizard"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProblem(prob)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Delete Problem?</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{deletingProblem.title}&quot;</span>?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingProblem(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
