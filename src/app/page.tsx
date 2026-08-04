'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { college, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.push('/dashboard');
    }
  }, [isLoading, router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-zinc-600">Redirecting to Code Galatta Portal...</p>
    </div>
  );
}
