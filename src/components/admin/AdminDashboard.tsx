'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Link from 'next/link';

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  necesidades?: string;
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  equipoId: string;
  comision: number;
  fecha: string;
  observaciones: string;
  montoCobrado?: number;
  metodoPago?: 'efectivo' | 'tarjeta';
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Equipo {
  id: string;
  nombre: string;
  color: string;
  members: string[];
  fechaCreacion: string;
  ultimaModificacion: string;
}

export default function AdminDashboard() {
  const { empleadosRegistrados, empleadosConectados } = useAuth();
  const crmContext = useCRM();

  if (!crmContext) {
    return <div>Cargando...</div>;
  }

  const { tareas, equipos } = crmContext;

  const stats = [
    {
      name: 'Empleados Totales',
      value: empleadosRegistrados.length,
      href: '/dashboard/empleados',
      icon: '👥'
    },
    {
      name: 'Empleados Conectados',
      value: empleadosConectados.length,
      href: '/dashboard/empleados',
      icon: '🟢'
    },
    {
      name: 'Tareas Pendientes',
      value: tareas.filter((t) => t.estado === 'pendiente').length,
      href: '/dashboard/tareas',
      icon: '📝'
    },
    {
      name: 'Equipos de Trabajo',
      value: equipos.length,
      href: '/dashboard/equipos',
      icon: '👥'
    },
    {
      name: 'Tareas Completadas',
      value: tareas.filter((t: Tarea) => t.estado === 'completada').length,
      href: '/dashboard/tareas',
      icon: '✅'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Bienvenido al panel de control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Empleados Conectados</h2>
          <div className="space-y-4">
            {empleadosConectados.map((empleado) => (
              <div key={empleado.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {empleado.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {empleado.username}
                  </span>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
              </div>
            ))}
            {empleadosConectados.length === 0 && (
              <p className="text-gray-500 text-sm">No hay empleados conectados</p>
            )}
          </div>
        </div>

        {/* Tareas Recientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tareas Recientes</h2>
          <div className="space-y-4">
            {tareas.slice(0, 5).map((tarea: Tarea) => (
              <div key={tarea.id} className="flex items-center justify-between">
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
            {tareas.length === 0 && (
              <p className="text-gray-500 text-sm">No hay tareas registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 