'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';
import TareasPanel from '@/components/tareas/TareasPanel';

export default function MisTareasPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('mistareas');

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role === 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={false}
        username={user.username}
        seccionActiva={seccionActiva}
        onCambiarSeccion={(seccion) => {
          setSeccionActiva(seccion);
          router.push(`/dashboard/${seccion}`);
        }}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mis Tareas</h1>
          <p className="text-gray-600 mb-8">Gestiona tus tareas asignadas</p>
          <TareasPanel empleadoId={user.id} />
        </div>
      </main>
    </div>
  );
} 