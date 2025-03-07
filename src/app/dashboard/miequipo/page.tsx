'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';

interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

export default function MiEquipoPage() {
  const { isAuthenticated, user } = useAuth();
  const { equipos } = useCRM();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('miequipo');

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role === 'admin') {
    return null;
  }

  // Encontrar el equipo del empleado
  const miEquipo = (equipos as Equipo[]).find(equipo => 
    equipo.members.includes(user.id)
  );

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mi Equipo</h1>
          
          {miEquipo ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{miEquipo.nombre}</h2>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Miembros del Equipo</h3>
                <div className="space-y-4">
                  {miEquipo.members.map((miembroId: string) => {
                    const empleado = (equipos as Equipo[]).find(e => e.id === miembroId);
                    return (
                      <div key={miembroId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {empleado?.nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{empleado?.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {miembroId === user.id ? '(Tú)' : 'Compañero de equipo'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-yellow-700">
                No estás asignado a ningún equipo actualmente.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 