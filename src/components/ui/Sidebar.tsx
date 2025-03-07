'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  isAdmin: boolean;
  username: string;
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
}

export default function Sidebar({ isAdmin, username, seccionActiva, onCambiarSeccion }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay para móvil */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        } md:translate-x-0 fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-50`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">Bienvenido,</p>
            <p className="font-medium">{username}</p>
          </div>
          
          <nav className="flex-1 p-4 overflow-y-auto">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    onCambiarSeccion('dashboard');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('tareas');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'tareas' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  📋 Gestión de Tareas
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('clientes');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'clientes' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Gestión de Clientes
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('equipos');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'equipos' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Gestión de Equipos
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('empleados');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'empleados' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👨‍💼 Gestión de Empleados
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('comisiones');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'comisiones' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  💰 Comisiones
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onCambiarSeccion('dashboard');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('mistareas');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'mistareas' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  📋 Mis Tareas
                </button>
                <button
                  onClick={() => {
                    onCambiarSeccion('miequipo');
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left mb-2 p-2 rounded flex items-center ${
                    seccionActiva === 'miequipo' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  👥 Mi Equipo
                </button>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                handleLogout();
                setIsCollapsed(true);
              }}
              className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded flex items-center"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 