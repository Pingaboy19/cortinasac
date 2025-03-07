'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import ComisionesPanel from '@/components/comisiones/ComisionesPanel';
import Sidebar from '@/components/ui/Sidebar';

export default function ComisionesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('comisiones');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={user?.role === 'admin'}
        username={user?.username || ''}
        seccionActiva={seccionActiva}
        onCambiarSeccion={(seccion) => {
          setSeccionActiva(seccion);
          router.push(`/dashboard/${seccion}`);
        }}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <ComisionesPanel />
      </main>
    </div>
  );
} 