'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';

export default function EmpleadosDashboard() {
  const { user } = useAuth();
  const { tareas, equipos } = useCRM();

  const misTareas = tareas.filter(tarea => {
    const equipo = equipos.find(e => e.id === tarea.equipoId);
    return equipo?.members.includes(user?.id || '');
  });

  const tareasCompletadas = misTareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = misTareas.filter(t => t.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.username}
        </h1>
        <p className="text-gray-600">Panel de control de empleado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600 mb-1">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-[#E31E24]">{tareasPendientes}</p>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600 mb-1">Tareas Completadas</p>
              <p className="text-3xl font-bold text-[#E31E24]">{tareasCompletadas}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-600 mb-1">Mi Comisión</p>
              <p className="text-3xl font-bold text-[#E31E24]">1%</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Tareas Recientes</h2>
        <div className="space-y-4">
          {misTareas.slice(0, 5).map((tarea) => (
            <div key={tarea.id} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full ${
                  tarea.estado === 'completada' ? 'bg-green-400' :
                  tarea.estado === 'pendiente' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}></span>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {tarea.titulo}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(tarea.fecha).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 