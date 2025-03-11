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

interface Member {
  id: string;
  username: string;
  role: 'admin' | 'empleado';
}

export default function MiEquipoPage() {
  const { isAuthenticated, user, empleadosRegistrados } = useAuth();
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
  const miEquipo = equipos.find((equipo: Equipo) => 
    equipo.members.includes(user.id)
  );

  // Obtener información de los miembros del equipo
  const miembrosEquipo = miEquipo?.members.map(memberId => {
    const miembro = empleadosRegistrados.find(emp => emp.id === memberId);
    return {
      id: memberId,
      username: miembro?.username || 'Usuario no encontrado',
      role: miembro?.role || 'empleado'
    };
  }) || [];

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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {miEquipo?.nombre || 'Mi Equipo'}
          </h1>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Miembros del Equipo</h2>
            <div className="space-y-4">
              {miembrosEquipo.map((miembro) => (
                <div 
                  key={miembro.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {miembro.username[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      {miembro.username}
                      {miembro.id === user.id && ' (Tú)'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {miembro.id === user.id ? 'Miembro del equipo (Tú)' : 'Compañero de equipo'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 