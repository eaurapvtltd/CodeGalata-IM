'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { WeeklyStudentLeaderboard } from '@/components/dashboard/WeeklyStudentLeaderboard';

export default function StudentsLeaderboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <WeeklyStudentLeaderboard />
      </div>
    </AdminLayout>
  );
}
