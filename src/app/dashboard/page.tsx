'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/navigation/Sidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import EmpleadosDashboard from '@/components/empleados/EmpleadosDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {user.role === 'admin' ? <AdminDashboard /> : <EmpleadosDashboard />}
      </main>
    </div>
  );
} 