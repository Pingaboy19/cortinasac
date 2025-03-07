'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isAdmin: boolean;
  username: string;
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
}

export default function Sidebar({ isAdmin, username, seccionActiva, onCambiarSeccion }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (seccion: string) => {
    onCambiarSeccion(seccion);
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#E31E24]">CortinasAC</h1>
        <p className="text-sm text-gray-600">Elegancia en tu hogar</p>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {username[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium">{username}</span>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`block px-4 py-2 rounded-lg ${
              seccionActiva === 'dashboard'
                ? 'bg-[#E31E24] text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation('dashboard')}
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/clientes"
            className={`block px-4 py-2 rounded-lg ${
              seccionActiva === 'clientes'
                ? 'bg-[#E31E24] text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation('clientes')}
          >
            Clientes
          </Link>

          <Link
            href="/dashboard/tareas"
            className={`block px-4 py-2 rounded-lg ${
              seccionActiva === 'tareas'
                ? 'bg-[#E31E24] text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation('tareas')}
          >
            Tareas
          </Link>

          {isAdmin && (
            <>
              <Link
                href="/dashboard/equipos"
                className={`block px-4 py-2 rounded-lg ${
                  seccionActiva === 'equipos'
                    ? 'bg-[#E31E24] text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleNavigation('equipos')}
              >
                Equipos
              </Link>

              <Link
                href="/dashboard/empleados"
                className={`block px-4 py-2 rounded-lg ${
                  seccionActiva === 'empleados'
                    ? 'bg-[#E31E24] text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleNavigation('empleados')}
              >
                Empleados
              </Link>
            </>
          )}

          <Link
            href="/dashboard/comisiones"
            className={`block px-4 py-2 rounded-lg ${
              seccionActiva === 'comisiones'
                ? 'bg-[#E31E24] text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => handleNavigation('comisiones')}
          >
            Comisiones
          </Link>
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-4 border-t">
        <button
          onClick={() => {
            logout();
            router.push('/auth/login');
          }}
          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
} 