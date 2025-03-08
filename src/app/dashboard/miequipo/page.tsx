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
  const miEquipo = equipos.find(equipo => equipo.members.includes(user.id));

  // Obtener los detalles de los miembros del equipo
  const miembrosEquipo = miEquipo?.members.map(memberId => {
    const empleado = empleadosRegistrados.find(emp => emp.id === memberId);
    return {
      id: memberId,
      username: empleado?.username || 'Usuario no encontrado',
      role: empleado?.role || 'empleado'
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
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {miEquipo?.nombre || 'Mi Equipo'}
          </h1>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Miembros del Equipo</h2>
            <div className="space-y-4">
              {miembrosEquipo.map((miembro) => (
                <div 
                  key={miembro.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-medium text-blue-600">
                      {miembro.username[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {miembro.username}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {miembro.id === user.id ? '(Tú)' : 'Compañero de equipo'}
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