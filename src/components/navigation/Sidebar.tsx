'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/clientes', label: 'Clientes', icon: '👥' },
    { href: '/tareas', label: 'Tareas', icon: '📝' },
    { href: '/equipos', label: 'Equipos', icon: '👥' },
    ...(user?.role === 'admin' ? [
      { href: '/empleados', label: 'Empleados', icon: '👨‍💼' },
      { href: '/comisiones', label: 'Comisiones', icon: '💰' }
    ] : [])
  ];

  return (
    <div className="flex flex-col h-screen bg-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#E31E24] text-center">
          CortinasAC
        </h1>
        <p className="text-sm text-center text-gray-600 mt-1">
          Elegancia en tu hogar
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-[#E31E24] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xl">{user?.username[0]?.toUpperCase()}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#E31E24] hover:bg-[#C41A1F] rounded-md transition-colors duration-200"
        >
          <span className="mr-2">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
} 