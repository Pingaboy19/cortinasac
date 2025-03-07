'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import EmpleadosPanel from '@/components/empleados/EmpleadosPanel';
import Sidebar from '@/components/ui/Sidebar';

export default function EmpleadosPage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <EmpleadosPanel />
      </main>
    </div>
  );
} 