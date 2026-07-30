'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CampusLeaderboard } from '@/components/dashboard/CampusLeaderboard';

export default function CampusLeaderboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <CampusLeaderboard />
      </div>
    </AdminLayout>
  );
}
