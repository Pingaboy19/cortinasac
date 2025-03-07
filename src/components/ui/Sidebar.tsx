'use client';

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
    <aside className="w-64 bg-white border-r h-screen">
      <div className="p-4 border-b">
        <p className="text-sm text-gray-600">Bienvenido,</p>
        <p className="font-semibold">{isAdmin ? `Jefe: ${username}` : username}</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCambiarSeccion('tareas')}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                seccionActiva === 'tareas' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              📋 {isAdmin ? 'Gestión de Tareas' : 'Mis Tareas'}
            </button>
          </li>
          {isAdmin ? (
            <>
              <li>
                <button
                  onClick={() => onCambiarSeccion('clientes')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    seccionActiva === 'clientes' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Gestión de Clientes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCambiarSeccion('equipos')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    seccionActiva === 'equipos' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Gestión de Equipos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCambiarSeccion('numerosclientes')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    seccionActiva === 'numerosclientes' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  📱 Números de Clientes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCambiarSeccion('comisiones')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    seccionActiva === 'comisiones' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  💰 Comisiones de Empleados
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={() => onCambiarSeccion('miequipo')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                  seccionActiva === 'miequipo' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                👥 Mi Equipo
              </button>
            </li>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪 Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
} 