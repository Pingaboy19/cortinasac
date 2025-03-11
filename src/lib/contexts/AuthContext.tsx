"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'empleado';
  equipoId?: string;
  isConnected: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registrarEmpleado: (username: string, password: string) => Promise<boolean>;
  empleadosRegistrados: User[];
  empleadosConectados: User[];
  eliminarEmpleado: (id: string) => void;
}

const ADMIN_CREDENTIALS = {
  username: 'Ariel',
  password: 'ariel123'
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  registrarEmpleado: async () => false,
  empleadosRegistrados: [],
  empleadosConectados: [],
  eliminarEmpleado: () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Constante para el ID de la aplicación
  const APP_ID = 'cortinas-crm-app';

  // Función para guardar datos en localStorage con un ID único para la aplicación
  const saveToStorage = (key: string, data: any) => {
    try {
      const fullKey = `${APP_ID}_${key}`;
      localStorage.setItem(fullKey, JSON.stringify(data));
      
      // Guardar timestamp de actualización
      const timestamp = new Date().toISOString();
      localStorage.setItem(`${APP_ID}_LAST_UPDATE`, timestamp);
      
      return true;
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
      return false;
    }
  };

  // Función para cargar datos de localStorage con ID único
  const loadFromStorage = (key: string) => {
    try {
      const fullKey = `${APP_ID}_${key}`;
      const data = localStorage.getItem(fullKey);
      
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error al cargar ${key}:`, error);
      return null;
    }
  };

  // Cargar datos al iniciar
  const loadData = useCallback(() => {
    try {
      // Intentar cargar desde localStorage
      const empleadosData = loadFromStorage('empleados') || [];
      
      // Actualizar estado
      setEmpleadosRegistrados(empleadosData);
      const conectados = empleadosData.filter((emp: User) => emp.isConnected);
      setEmpleadosConectados(conectados);
      
      // Cargar usuario actual si existe
      const currentUserData = loadFromStorage('currentUser');
      if (currentUserData) {
        setUser(currentUserData);
        setIsAuthenticated(true);
      }
      
      setDataLoaded(true);
      console.log('Datos de autenticación cargados correctamente');
    } catch (error) {
      console.error('Error al cargar datos de autenticación:', error);
      setDataLoaded(true); // Marcar como cargado incluso en caso de error
    }
  }, []);

  // Función para verificar y cargar actualizaciones
  const checkForUpdates = useCallback(() => {
    try {
      loadData();
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
    }
  }, [loadData]);

  // Efecto para sincronización periódica
  useEffect(() => {
    // Cargar datos iniciales
    loadData();
    
    // Configurar intervalo de sincronización
    const syncInterval = setInterval(checkForUpdates, 5000); // Verificar cada 5 segundos
    
    // Evento para sincronización entre pestañas/dispositivos
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(APP_ID)) {
        checkForUpdates();
      }
    };
    
    // Evento para cuando la ventana obtiene el foco
    const handleFocus = () => {
      checkForUpdates();
    };
    
    // Configurar listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    });
    
    // Limpiar listeners
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', () => {});
    };
  }, [loadData, checkForUpdates]);

  // Modificar registrarEmpleado para asegurar sincronización
  const registrarEmpleado = async (username: string, password: string): Promise<boolean> => {
    try {
      // Verificar si el usuario ya existe
      const empleadoExistente = empleadosRegistrados.find(emp => emp.username === username);
      if (empleadoExistente) {
        return false;
      }

      const timestamp = new Date().toISOString();
      const nuevoEmpleado: User & { password: string } = {
        id: `empleado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        password,
        role: 'empleado',
        isConnected: false,
        createdAt: timestamp
      };

      const updatedEmpleados = [...empleadosRegistrados, nuevoEmpleado];
      
      // Guardar con nuevo timestamp
      const success = saveToStorage('empleados', updatedEmpleados);
      if (success) {
        setEmpleadosRegistrados(updatedEmpleados);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      return false;
    }
  };

  // Modificar login para asegurar sincronización
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Verificar credenciales de admin
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          isConnected: true,
          createdAt: new Date().toISOString()
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        saveToStorage('currentUser', adminUser);
        return true;
      }

      // Verificar empleados con datos actualizados
      const foundUser = empleadosRegistrados.find(u => 
        u.username === username && (u as any).password === password
      );

      if (foundUser) {
        const empleadoUser: User = {
          ...foundUser,
          isConnected: true,
          lastLogin: new Date().toISOString()
        };

        // Actualizar estado de conexión
        const updatedUsers = empleadosRegistrados.map(u => 
          u.id === foundUser.id ? { ...u, isConnected: true, lastLogin: empleadoUser.lastLogin } : u
        );
        
        const success = saveToStorage('empleados', updatedUsers);
        if (success) {
          setEmpleadosRegistrados(updatedUsers);
          setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);
          setUser(empleadoUser);
          setIsAuthenticated(true);
          saveToStorage('currentUser', empleadoUser);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  // Modificar logout para asegurar sincronización
  const logout = () => {
    try {
      if (user) {
        if (user.role === 'empleado') {
          // Actualizar estado de conexión del empleado
          const updatedEmpleados = empleadosRegistrados.map(emp =>
            emp.id === user.id ? { ...emp, isConnected: false } : emp
          );
          
          saveToStorage('empleados', updatedEmpleados);
          setEmpleadosRegistrados(updatedEmpleados);
          setEmpleadosConectados(prev => prev.filter(u => u.id !== user.id));
        }
        
        localStorage.removeItem(`${APP_ID}_currentUser`);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem(`${APP_ID}_currentUser`);
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  };

  // Modificar eliminarEmpleado para asegurar sincronización
  const eliminarEmpleado = (id: string) => {
    try {
      const nuevosEmpleados = empleadosRegistrados.filter(emp => emp.id !== id);
      const success = saveToStorage('empleados', nuevosEmpleados);
      
      if (success) {
        setEmpleadosRegistrados(nuevosEmpleados);
        setEmpleadosConectados(prev => prev.filter(u => u.id !== id));
        
        // Si el usuario actual es el que se está eliminando, hacer logout
        if (user && user.id === id) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      registrarEmpleado,
      empleadosRegistrados,
      empleadosConectados,
      eliminarEmpleado
    }}>
      {children}
    </AuthContext.Provider>
  );
}
