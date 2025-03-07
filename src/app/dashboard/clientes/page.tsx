'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';
import ClientesPanel from '@/components/clientes/ClientesPanel';

export default function ClientesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('clientes');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={user.role === 'admin'}
        username={user.username || ''}
        seccionActiva="clientes"
        onCambiarSeccion={(seccion) => {
          router.push(`/dashboard/${seccion}`);
        }}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>
          <ClientesPanel />
        </div>
      </main>
    </div>
  );
} 