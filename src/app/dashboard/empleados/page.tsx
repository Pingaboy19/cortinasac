'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Sidebar from '@/components/ui/Sidebar';
import EmpleadosPanel from '@/components/empleados/EmpleadosPanel';

export default function EmpleadosPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('empleados');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={true}
        username={user.username}
        seccionActiva={seccionActiva}
        onCambiarSeccion={(seccion) => {
          setSeccionActiva(seccion);
          router.push(`/dashboard/${seccion}`);
        }}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Gestión de Empleados</h1>
          <p className="text-gray-600 mb-8">Administra los empleados de CortinasAC</p>
          <EmpleadosPanel />
        </div>
      </main>
    </div>
  );
} 