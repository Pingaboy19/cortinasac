'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isAdmin: boolean;
  username: string;
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
}

export default function Sidebar({ isAdmin, username, seccionActiva, onCambiarSeccion }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const menuItemsAdmin = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tareas', label: 'Gestión de Tareas', icon: '📋' },
    { id: 'clientes', label: 'Gestión de Clientes', icon: '👥' },
    { id: 'equipos', label: 'Gestión de Equipos', icon: '👥' },
    { id: 'empleados', label: 'Gestión de Empleados', icon: '👨‍💼' },
    { id: 'comisiones', label: 'Comisiones', icon: '💰' }
  ];

  const menuItemsEmpleado = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mistareas', label: 'Mis Tareas', icon: '📋' },
    { id: 'miequipo', label: 'Mi Equipo', icon: '👥' }
  ];

  const menuItems = isAdmin ? menuItemsAdmin : menuItemsEmpleado;

  const handleMenuItemClick = (seccion: string) => {
    onCambiarSeccion(seccion);
    setIsMobileMenuOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Botón de menú móvil - Siempre visible en móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Adaptativo para móvil y desktop */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Bienvenido,</p>
            <p className="font-medium text-gray-900">{username}</p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto p-4 bg-white">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`
                  w-full text-left mb-2 p-3 rounded-lg
                  flex items-center transition-colors duration-200
                  ${seccionActiva === item.id 
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Pie de Sidebar */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="w-full p-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
            >
              <span className="text-xl mr-3">🚪</span>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 