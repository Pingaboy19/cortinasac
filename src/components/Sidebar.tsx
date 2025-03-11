import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaSync } from 'react-icons/fa';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout, sincronizarAutenticacion } = useAuth();
  const { sincronizarAhora } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Cerrar el sidebar en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Función para forzar sincronización
  const handleSync = () => {
    if (!isBrowser) return;
    
    setIsSyncing(true);
    setSyncMessage('Sincronizando...');
    
    try {
      // Sincronizar datos de autenticación y CRM
      sincronizarAutenticacion();
      sincronizarAhora();
      
      setSyncMessage('¡Sincronizado!');
      
      // Restablecer mensaje después de 3 segundos
      setTimeout(() => {
        setSyncMessage('');
        setIsSyncing(false);
      }, 3000);
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setSyncMessage('Error al sincronizar');
      
      // Restablecer mensaje después de 3 segundos
      setTimeout(() => {
        setSyncMessage('');
        setIsSyncing(false);
      }, 3000);
    }
  };

  if (!user) return null;

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', adminOnly: false },
    { href: '/dashboard/tareas', label: 'Gestión de Tareas', icon: '📝', adminOnly: false },
    { href: '/dashboard/clientes', label: 'Gestión de Clientes', icon: '👥', adminOnly: false },
    { href: '/dashboard/equipos', label: 'Gestión de Equipos', icon: '👥', adminOnly: false },
    { href: '/dashboard/empleados', label: 'Gestión de Empleados', icon: '👤', adminOnly: true },
    { href: '/dashboard/comisiones', label: 'Comisiones', icon: '💰', adminOnly: false },
    { href: '/dashboard/miequipo', label: 'Mi Equipo', icon: '👥', adminOnly: false },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-md"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay para cerrar el menú en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="text-lg font-semibold">
            Bienvenido,
            <div className="text-blue-600">{user.username}</div>
          </div>
        </div>

        <nav className="mt-4">
          <ul>
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="mb-1">
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                      isActive ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {/* Botón de sincronización */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <FaSync className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {syncMessage || 'Sincronizar'}
          </button>
          
          {/* Botón de cerrar sesión */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
} 