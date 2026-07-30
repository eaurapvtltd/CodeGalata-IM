'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getCollegeFaculty, 
  addFacultyMember, 
  getFacultyChatMessages, 
  sendFacultyChatMessage, 
  markFacultyMessagesAsRead,
  getContests,
  getCollegeProblems,
  getAssignments
} from '@/lib/db';
import { FacultyMember, FacultyChatMessage } from '@/lib/types';
import { 
  MessageSquare, 
  Search, 
  Send, 
  UserPlus, 
  X, 
  CheckCheck, 
  FileText, 
  Trophy, 
  Code2, 
  BookOpen, 
  Sparkles, 
  Mail, 
  Building, 
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Paperclip
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyChatPage() {
  const { college } = useAuth();

  // State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [messages, setMessages] = useState<FacultyChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>('list');

  const handleSelectFaculty = (fac: FacultyMember) => {
    setSelectedFaculty(fac);
    setMobileActiveView('chat');
  };

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('CSE');
  const [newFacultyDesignation, setNewFacultyDesignation] = useState('Assistant Professor');

  // Context attachment state
  const [selectedContext, setSelectedContext] = useState<FacultyChatMessage['referenceContext'] | undefined>(undefined);
  const [showContextPicker, setShowContextPicker] = useState(false);

  // Available context items
  const [availableContests, setAvailableContests] = useState<{ id: string; title: string }[]>([]);
  const [availableProblems, setAvailableProblems] = useState<{ id: string; title: string }[]>([]);
  const [availableAssignments, setAvailableAssignments] = useState<{ id: string; title: string }[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load faculty list
  const loadFaculty = () => {
    if (!college) return;
    const list = getCollegeFaculty(college.id);
    setFacultyList(list);

    if (list.length > 0 && !selectedFaculty) {
      setSelectedFaculty(list[0]);
    }
  };

  // Load context options
  useEffect(() => {
    if (college) {
      loadFaculty();
      const contests = getContests(college.id).map(c => ({ id: c.id, title: c.title }));
      const problems = getCollegeProblems(college.id).map(p => ({ id: p.id, title: p.title }));
      const assignments = getAssignments(college.id).map(a => ({ id: a.id, title: a.title }));
      setAvailableContests(contests);
      setAvailableProblems(problems);
      setAvailableAssignments(assignments);
    }
  }, [college]);

  // Load messages for selected faculty
  const loadMessages = () => {
    if (!college || !selectedFaculty) return;
    const msgs = getFacultyChatMessages(college.id, selectedFaculty.id);
    setMessages(msgs);
    markFacultyMessagesAsRead(college.id, selectedFaculty.id);
  };

  useEffect(() => {
    loadMessages();
  }, [selectedFaculty, college]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!college || !selectedFaculty || !inputText.trim()) return;

    try {
      sendFacultyChatMessage(college.id, selectedFaculty.id, {
        sender: 'admin',
        senderName: college.collegeName + ' Super Admin',
        text: inputText.trim(),
        referenceContext: selectedContext,
      });

      setInputText('');
      setSelectedContext(undefined);
      setShowContextPicker(false);
      loadMessages();
      loadFaculty();
    } catch (err: any) {
      toast.error('Failed to send message.');
    }
  };

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !newFacultyName.trim() || !newFacultyEmail.trim()) return;

    try {
      const created = addFacultyMember(college.id, {
        name: newFacultyName.trim(),
        email: newFacultyEmail.trim(),
        department: newFacultyDept.trim(),
        designation: newFacultyDesignation.trim(),
      });

      toast.success(`Registered ${created.name} (${created.department}) successfully!`);
      setNewFacultyName('');
      setNewFacultyEmail('');
      setIsAddModalOpen(false);
      loadFaculty();
      setSelectedFaculty(created);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add faculty member');
    }
  };

  // Quick Preset Chips
  const presetTemplates = [
    { label: '📝 Review Test Questions', text: 'Please review the test questions for the upcoming contest when you have a moment.' },
    { label: '🚀 Verify Test Cases', text: 'Could you please verify the hidden test cases and constraints for the problem setter items?' },
    { label: '⏰ Extended Deadline', text: 'The assignment submission deadline has been updated. Please inform your batch students.' },
    { label: '🏆 Conducted Exam Audit', text: 'Great job on conducting today\'s online coding evaluation session!' }
  ];

  const filteredFaculty = facultyList.filter(f => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = f.name.toLowerCase().includes(term) ||
                          f.email.toLowerCase().includes(term) ||
                          f.department.toLowerCase().includes(term);
    const matchesDept = departmentFilter === 'All' || f.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const departments = ['All', 'CSE', 'AI', 'ECE', 'EEE', 'Mechanical', 'Civil'];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-500" />
              Faculty Messaging Hub
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Direct official communication portal with registered college faculty members regarding tests, questions, and assignments.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Faculty</span>
          </button>
        </div>

        {/* Main Split Chat Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 h-[650px]">
          
          {/* Left Roster Panel (4 cols - Hidden on mobile if chat view active) */}
          <div className={`md:col-span-4 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50 ${
            mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Search & Dept Filters */}
            <div className="p-4 space-y-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search faculty by name, email..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      departmentFilter === dept
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Faculty List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredFaculty.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No faculty members found matching search filter.
                </div>
              ) : (
                filteredFaculty.map((fac) => {
                  const isSelected = selectedFaculty?.id === fac.id;
                  return (
                    <button
                      key={fac.id}
                      onClick={() => handleSelectFaculty(fac)}
                      className={`w-full p-4 text-left transition-colors flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500' 
                          : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {fac.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className={`w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5 ${
                            fac.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{fac.name}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{fac.designation}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">
                              {fac.department}
                            </span>
                          </div>
                        </div>
                      </div>

                      {fac.unreadCount && fac.unreadCount > 0 ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {fac.unreadCount}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Active Chat Window (8 cols - Hidden on mobile if list view active) */}
          <div className={`md:col-span-8 flex flex-col h-full bg-white dark:bg-zinc-900 ${
            mobileActiveView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            {selectedFaculty ? (
              <div className="flex flex-col h-full min-h-0">
                {/* Active Chat Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Back to Faculty list button on mobile */}
                    <button
                      onClick={() => setMobileActiveView('list')}
                      className="md:hidden p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {selectedFaculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{selectedFaculty.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          {selectedFaculty.department} Dept
                        </span>
                      </h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                        <span>{selectedFaculty.designation}</span>
                        <span>&bull;</span>
                        <span>{selectedFaculty.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      selectedFaculty.status === 'online'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${selectedFaculty.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                      {selectedFaculty.status === 'online' ? 'Active Now' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Message Feed */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/20 dark:bg-zinc-900/20">
                  {messages.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-zinc-400 mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No message history yet</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                        Send a message to {selectedFaculty.name} to discuss test papers, problem sets, or assignments.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <span className="text-[10px] text-zinc-400 font-medium px-1">
                            {msg.senderName} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-lg p-3.5 rounded-2xl text-xs space-y-2 shadow-xs ${
                              isAdmin
                                ? 'bg-emerald-600 text-white rounded-tr-xs'
                                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/80 rounded-tl-xs'
                            }`}
                          >
                            {/* Attached Reference Badge if present */}
                            {msg.referenceContext && (
                              <div className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 border ${
                                isAdmin 
                                  ? 'bg-white/10 border-white/20 text-white' 
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {msg.referenceContext.type === 'contest' && <Trophy className="w-3.5 h-3.5 shrink-0" />}
                                {msg.referenceContext.type === 'problem' && <Code2 className="w-3.5 h-3.5 shrink-0" />}
                                {msg.referenceContext.type === 'assignment' && <BookOpen className="w-3.5 h-3.5 shrink-0" />}
                                <span className="truncate">Ref: {msg.referenceContext.title}</span>
                              </div>
                            )}

                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Template Chips */}
                <div className="p-2 px-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[10px] font-bold text-zinc-400 shrink-0 uppercase tracking-wider">Quick Chips:</span>
                  {presetTemplates.map((tp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(tp.text)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium shrink-0 transition-colors"
                    >
                      {tp.label}
                    </button>
                  ))}
                </div>

                {/* Context Reference Bar if selected */}
                {selectedContext && (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-t border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs shrink-0">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Attached Context Reference: <strong>{selectedContext.title}</strong>
                    </span>
                    <button 
                      onClick={() => setSelectedContext(undefined)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900 shrink-0">
                  {/* Context Reference Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowContextPicker(!showContextPicker)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        selectedContext 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                      title="Attach Test / Question Reference"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Context Picker Dropdown */}
                    {showContextPicker && (
                      <div className="absolute bottom-12 left-0 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xl z-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                          <span>Attach Reference</span>
                          <button onClick={() => setShowContextPicker(false)} className="text-zinc-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Contests</span>
                            {availableContests.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedContext({ type: 'contest', title: c.title, id: c.id });
                                  setShowContextPicker(false);
                                }}
                                className="w-full text-left p-1.5 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 truncate font-medium block"
                              >
                                🏆 {c.title}
                              </button>
                            ))}
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Problems</span>
                            {availableProblems.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedContext({ type: 'problem', title: p.title, id: p.id });
                                  setShowContextPicker(false);
                                }}
                                className="w-full text-left p-1.5 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 truncate font-medium block"
                              >
                                💻 {p.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type a message to ${selectedFaculty.name}...`}
                    className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <MessageSquare className="w-12 h-12 text-zinc-400 mb-2 opacity-50" />
                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">Select a Faculty Member</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Choose a faculty member from the roster to start a direct message thread.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Register Faculty */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" /> Register Faculty Member
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFaculty} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    value={newFacultyName}
                    onChange={(e) => setNewFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    value={newFacultyEmail}
                    onChange={(e) => setNewFacultyEmail(e.target.value)}
                    placeholder="rajesh.kumar@college.edu"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Department / Branch *
                    </label>
                    <select
                      value={newFacultyDept}
                      onChange={(e) => setNewFacultyDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    >
                      <option value="CSE">CSE</option>
                      <option value="AI">AI & ML</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={newFacultyDesignation}
                      onChange={(e) => setNewFacultyDesignation(e.target.value)}
                      placeholder="e.g. Professor & HOD"
                      required
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                  >
                    Register Faculty
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
