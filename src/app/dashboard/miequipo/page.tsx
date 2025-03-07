'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';

interface Member {
  id: string;
  username: string;
}

interface Team {
  id: string;
  nombre: string;
  members: Member[];
}

interface Task {
  id: string;
  equipoId: string;
  estado: 'pendiente' | 'completada';
}

export default function MiEquipoPage() {
  const { isAuthenticated, user } = useAuth();
  const { equipos, tareas } = useCRM();
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
  const miEquipo = (equipos as unknown as Team[]).find(equipo => 
    equipo.members.some(miembro => miembro.id === user.id)
  );

  // Filtrar tareas del equipo
  const tareasEquipo = (tareas as Task[]).filter(tarea => 
    tarea.equipoId === miEquipo?.id
  );

  // Calcular estadísticas
  const tareasCompletadas = tareasEquipo.filter(tarea => tarea.estado === 'completada').length;
  const tareasPendientes = tareasEquipo.filter(tarea => tarea.estado === 'pendiente').length;
  const porcentajeCompletado = tareasEquipo.length > 0 
    ? Math.round((tareasCompletadas / tareasEquipo.length) * 100) 
    : 0;

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
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{miEquipo.nombre}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Miembros del Equipo</p>
                    <p className="text-2xl font-bold">{miEquipo.members.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Tareas Completadas</p>
                    <p className="text-2xl font-bold">{tareasCompletadas}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Tareas Pendientes</p>
                    <p className="text-2xl font-bold">{tareasPendientes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Miembros del Equipo</h3>
                <div className="space-y-4">
                  {miEquipo.members.map((miembro) => (
                    <div key={miembro.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {miembro.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{miembro.username}</p>
                        <p className="text-sm text-gray-500">
                          {miembro.id === user.id ? '(Tú)' : 'Compañero de equipo'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Progreso del Equipo</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${porcentajeCompletado}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  {porcentajeCompletado}% de tareas completadas
                </p>
              </div>
            </>
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