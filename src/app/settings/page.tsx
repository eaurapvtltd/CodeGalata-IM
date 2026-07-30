'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  getCollegeSettings, 
  updateCollegeSettings, 
  getCollegeBranches, 
  getBranchBatches,
  hashPassword,
  getColleges,
  logAdminActivity
} from '@/lib/db';
import { Branch, Batch, CollegeSettings } from '@/lib/types';
import { Settings, Building, Lock, Eye, Bell, Shield, Laptop, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { college } = useAuth();
  
  // Data State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Profile preferences
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themePreference, setThemePreference] = useState<'Light' | 'Dark' | 'System'>('Dark');
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Password reset state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (!college) return;
    
    // Fetch Settings
    const config = getCollegeSettings(college.id);
    setAcademicYear(config.academicYear);
    setNotificationsEnabled(config.notificationsEnabled);
    setThemePreference(config.theme);
    setSelectedBranchId(config.defaultBranchId || '');
    setSelectedBatchId(config.defaultBatchId || '');

    // Fetch branches
    const brList = getCollegeBranches(college.id);
    setBranches(brList);
  }, [college]);

  useEffect(() => {
    if (selectedBranchId) {
      setBatches(getBranchBatches(selectedBranchId));
    } else {
      setBatches([]);
    }
  }, [selectedBranchId]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    try {
      updateCollegeSettings(college.id, {
        academicYear,
        defaultBranchId: selectedBranchId,
        defaultBatchId: selectedBatchId,
        notificationsEnabled,
        theme: themePreference,
      });
      toast.success('Academic preferences updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save settings.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New Password and Confirm New Password must match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New Password must be at least 6 characters long.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      // Validate old password by matching against stored college password
      // Note: we need to retrieve the actual college hash since the session omits password
      const colleges = await getColleges();
      const dbCollege = colleges.find(c => c.id === college.id);
      
      if (!dbCollege) throw new Error('College record not found.');
      
      const oldHashed = await hashPassword(oldPassword);
      if (dbCollege.password !== oldHashed) {
        toast.error('Incorrect Old Password.');
        setIsSubmittingPassword(false);
        return;
      }

      // Update password
      const newHashed = await hashPassword(newPassword);
      dbCollege.password = newHashed;
      localStorage.setItem('cg_colleges', JSON.stringify(colleges));
      
      logAdminActivity(college.id, 'settings', 'Password Reset', 'Admin changed portal security credentials');
      toast.success('Security password changed successfully!');
      
      // Clear fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Password update failed.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogoUploadPlaceholder = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
          toast.success('College Logo upload preview updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-emerald-500" />
            System Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure default variables, system notification routing, and account credential security.
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left panel: Preferences & Logo */}
          <div className="md:col-span-2 space-y-6">
            {/* Preferences Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Building className="w-4 h-4 text-emerald-500" /> Academic & Portal Preferences
              </h3>

              <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>

                {/* Default Branch & Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Default Branch Filter
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="">None Selected</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                      Default Batch Filter
                    </label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      disabled={!selectedBranchId}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none disabled:opacity-50"
                    >
                      <option value="">None Selected</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.batchName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notification Toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">System Email Routing</span>
                    <span className="text-[10px] text-zinc-400">Receive weekly compilation audits</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-9 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md rounded-xl transition-all"
                >
                  Save Academic Preferences
                </button>
              </form>
            </div>

            {/* Logo Upload Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Laptop className="w-4 h-4 text-blue-500" /> College Branding
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 text-zinc-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">College Roster Logo</p>
                  <p className="text-[10px] text-zinc-400">PNG, JPG formats supported. Max size 2MB.</p>
                  <label className="inline-block px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[10px] font-bold cursor-pointer transition-colors mt-1">
                    Select Logo File
                    <input type="file" accept="image/*" onChange={handleLogoUploadPlaceholder} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Security & Passwords */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Lock className="w-4 h-4 text-amber-500" /> Security Credentials
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                {/* Old Pass */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* New Pass */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Confirm New Pass */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold text-xs shadow-md rounded-xl transition-all mt-1"
                >
                  {isSubmittingPassword ? 'Resetting Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
