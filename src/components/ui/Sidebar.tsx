'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SidebarProps {
  isAdmin: boolean;
  username: string;
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
}

export default function Sidebar({ isAdmin, username, seccionActiva, onCambiarSeccion }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">Bienvenido,</p>
        <p className="font-medium">{isAdmin ? `Jefe: ${username}` : username}</p>
      </div>
      
      <nav className="p-4">
        {isAdmin ? (
          <>
            <button
              onClick={() => onCambiarSeccion('tareas')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'tareas' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              📋 Gestión de Tareas
            </button>
            <button
              onClick={() => onCambiarSeccion('clientes')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'clientes' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              👥 Gestión de Clientes
            </button>
            <button
              onClick={() => onCambiarSeccion('equipos')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'equipos' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              👥 Gestión de Equipos
            </button>
            <button
              onClick={() => onCambiarSeccion('empleados')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'empleados' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              👥 Gestión de Empleados
            </button>
            <button
              onClick={() => onCambiarSeccion('comisiones')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'comisiones' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              💰 Comisiones de Empleados
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onCambiarSeccion('mistareas')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'mistareas' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              📋 Mis Tareas
            </button>
            <button
              onClick={() => onCambiarSeccion('miequipo')}
              className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                seccionActiva === 'miequipo' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              👥 Mi Equipo
            </button>
          </>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-200">
        <button
          onClick={() => onCambiarSeccion('logout')}
          className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded flex items-center"
        >
          📋 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
} 