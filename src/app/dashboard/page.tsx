'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <EmpleadosDashboard />
      )}
    </div>
  );
} 