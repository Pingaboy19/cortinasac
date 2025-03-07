'use client';

import { useCRM } from '@/lib/contexts/CRMContext';

interface Tarea {
  id: string;
  titulo: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fecha: string;
}

export default function AdminDashboard() {
  const { clientes, tareas, equipos } = useCRM();

  // Calcular estadísticas
  const empleadosConectados = 0; // Esto se implementará cuando tengamos sistema de presencia
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;

  return (
    <div>
      <p className="text-gray-600 mb-8">Bienvenido al panel de control de CortinasAC</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              👥
            </div>
            <div>
              <h3 className="text-lg font-semibold">Empleados Totales</h3>
              <p className="text-2xl font-bold text-red-600">{equipos.reduce((total, equipo) => total + equipo.members.length, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              🟢
            </div>
            <div>
              <h3 className="text-lg font-semibold">Empleados Conectados</h3>
              <p className="text-2xl font-bold text-green-600">{empleadosConectados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              👤
            </div>
            <div>
              <h3 className="text-lg font-semibold">Clientes Activos</h3>
              <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              📋
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tareas Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600">{tareasPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              👥
            </div>
            <div>
              <h3 className="text-lg font-semibold">Equipos de Trabajo</h3>
              <p className="text-2xl font-bold text-purple-600">{equipos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              ✅
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tareas Completadas</h3>
              <p className="text-2xl font-bold text-green-600">{tareasCompletadas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Empleados Conectados</h3>
          <p className="text-gray-600">No hay empleados conectados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tareas Recientes</h3>
          {tareas.length > 0 ? (
            <div className="space-y-4">
              {tareas.map((tarea: Tarea) => (
                <div key={tarea.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tarea.titulo}</p>
                    <p className="text-sm text-gray-500">{new Date(tarea.fecha).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    tarea.estado === 'completada' ? 'bg-green-100 text-green-700' :
                    tarea.estado === 'vencida' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay tareas recientes</p>
          )}
        </div>
      </div>
    </div>
  );
} 