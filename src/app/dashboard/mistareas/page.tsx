'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';

interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fechaVencimiento: string;
  monto: number;
  empleadoId: string;
  clienteId: string;
  cliente: {
    nombre: string;
    direccion: string;
  };
}

export default function MisTareasPage() {
  const { isAuthenticated, user } = useAuth();
  const { tareas } = useCRM();
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

  // Filtrar tareas del empleado
  const misTareas = (tareas as unknown as Task[]).filter(tarea => 
    tarea.empleadoId === user.id
  );

  const tareasPendientes = misTareas.filter(tarea => tarea.estado === 'pendiente');
  const tareasCompletadas = misTareas.filter(tarea => tarea.estado === 'completada');
  const tareasVencidas = misTareas.filter(tarea => tarea.estado === 'vencida');

  // Calcular comisión total (1% sobre tareas completadas)
  const comisionTotal = tareasCompletadas.reduce((total, tarea) => total + (tarea.monto * 0.01), 0);

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
          <h1 className="text-2xl font-bold mb-6">Bienvenido, {user.username}</h1>
          <p className="text-gray-600 mb-8">Panel de control de empleado</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Tareas Pendientes</h3>
              <p className="text-3xl font-bold text-red-600">{tareasPendientes.length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Por completar</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Tareas Completadas</h3>
              <p className="text-3xl font-bold text-green-600">{tareasCompletadas.length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Finalizadas</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Tareas Vencidas</h3>
              <p className="text-3xl font-bold text-yellow-600">{tareasVencidas.length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Fuera de tiempo</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Mi Comisión</h3>
              <p className="text-3xl font-bold text-blue-600">1%</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  ${comisionTotal.toFixed(2)} UYU generados
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Mis Tareas Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarea
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comisión (1%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {misTareas.map(tarea => (
                    <tr key={tarea.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{tarea.titulo}</div>
                          <div className="text-sm text-gray-500">{tarea.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{tarea.cliente.nombre}</div>
                          <div className="text-sm text-gray-500">{tarea.cliente.direccion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tarea.estado === 'completada' ? 'bg-green-100 text-green-800' :
                          tarea.estado === 'vencida' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ${tarea.monto.toFixed(2)} UYU
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">
                        ${(tarea.monto * 0.01).toFixed(2)} UYU
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 