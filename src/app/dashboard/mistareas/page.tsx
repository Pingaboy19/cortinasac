'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';
import Calendar from '@/components/Calendar';

interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fechaVencimiento: string;
  empleadoId: string;
  clienteId: string;
  cliente: {
    nombre: string;
  };
}

export default function MisTareasPage() {
  const { isAuthenticated, user } = useAuth();
  const { tareas } = useCRM();
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState('mistareas');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role === 'admin') {
    return null;
  }

  // Filtrar tareas del empleado
  const misTareas = (tareas as unknown as Task[]).filter(tarea => 
    tarea.empleadoId === user.id
  );

  // Agrupar tareas por fecha
  const tareasPorFecha = misTareas.reduce((acc, tarea) => {
    const fecha = new Date(tarea.fechaVencimiento).toISOString().split('T')[0];
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(tarea);
    return acc;
  }, {} as Record<string, Task[]>);

  // Eventos para el calendario
  const eventos = misTareas.map(tarea => ({
    id: tarea.id,
    title: tarea.titulo,
    date: new Date(tarea.fechaVencimiento).toISOString().split('T')[0],
    className: `
      ${tarea.estado === 'completada' ? 'bg-green-100 border-green-200 text-green-800' : 
        tarea.estado === 'vencida' ? 'bg-red-100 border-red-200 text-red-800' : 
        'bg-yellow-100 border-yellow-200 text-yellow-800'}
    `
  }));

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Mis Tareas</h1>
              <p className="text-gray-600">Calendario de tareas asignadas</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Calendar 
              events={eventos}
              onDateSelect={(date) => setSelectedDate(date)}
            />
          </div>

          {selectedDate && tareasPorFecha[selectedDate.toISOString().split('T')[0]] && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">
                Tareas para {selectedDate.toLocaleDateString()}
              </h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {tareasPorFecha[selectedDate.toISOString().split('T')[0]].map((tarea) => (
                    <div key={tarea.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{tarea.titulo}</h3>
                          <p className="text-sm text-gray-500">Cliente: {tarea.cliente.nombre}</p>
                          <p className="text-sm text-gray-500">{tarea.descripcion}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          tarea.estado === 'completada' ? 'bg-green-100 text-green-800' :
                          tarea.estado === 'vencida' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 