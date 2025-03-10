"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Función para guardar datos con respaldo
  const saveToStorage = (key: string, data: any) => {
    try {
      // Crear una copia de seguridad antes de sobrescribir
      const existingData = localStorage.getItem(key);
      if (existingData) {
        localStorage.setItem(`${key}_backup`, existingData);
      }
      
      // Guardar los nuevos datos
      localStorage.setItem(key, JSON.stringify(data));
      
      // Guardar timestamp de la última actualización
      localStorage.setItem(`${key}_lastUpdate`, new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
      
      // Intentar guardar en formato más pequeño si es un error de cuota
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Eliminar backups antiguos para liberar espacio
          localStorage.removeItem(`${key}_backup`);
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (e) {
          console.error(`Error al guardar ${key} después de liberar espacio:`, e);
          return false;
        }
      }
      
      return false;
    }
  };

  // Función para cargar datos con manejo de errores
  const loadFromStorage = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      
      if (data) {
        return JSON.parse(data);
      }
      
      // Si no hay datos, intentar cargar desde la copia de seguridad
      const backup = localStorage.getItem(`${key}_backup`);
      if (backup) {
        console.warn(`Cargando ${key} desde copia de seguridad`);
        return JSON.parse(backup);
      }
      
      return null;
    } catch (error) {
      console.error(`Error al cargar ${key}:`, error);
      
      // Intentar cargar desde la copia de seguridad
      try {
        const backup = localStorage.getItem(`${key}_backup`);
        if (backup) {
          console.warn(`Cargando ${key} desde copia de seguridad después de error`);
          return JSON.parse(backup);
        }
      } catch (e) {
        console.error(`Error al cargar copia de seguridad de ${key}:`, e);
      }
      
      return null;
    }
  };

  // Cargar estado inicial
  useEffect(() => {
    try {
      const currentUser = loadFromStorage('currentUser');
      const empleados = loadFromStorage('empleados');
      
      if (currentUser) {
        const userData = JSON.parse(typeof currentUser === 'string' ? currentUser : JSON.stringify(currentUser));
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      if (empleados) {
        const empleadosData = Array.isArray(empleados) ? empleados : 
                             (typeof empleados === 'string' ? JSON.parse(empleados) : []);
        
        // Asegurar que todos los empleados tengan los campos requeridos
        const empleadosValidados = empleadosData.map((emp: any) => ({
          id: emp.id || `empleado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: emp.username || 'Usuario sin nombre',
          role: emp.role || 'empleado',
          isConnected: false, // Resetear conexión al iniciar
          createdAt: emp.createdAt || new Date().toISOString(),
          ...(emp.password && { password: emp.password }),
          ...(emp.equipoId && { equipoId: emp.equipoId }),
          ...(emp.lastLogin && { lastLogin: emp.lastLogin })
        }));
        
        setEmpleadosRegistrados(empleadosValidados);
        
        // Crear respaldo inmediato de los empleados validados
        saveToStorage('empleados_backup', empleadosValidados);
        
        const conectados = empleadosValidados.filter((emp: User) => emp.isConnected);
        setEmpleadosConectados(conectados);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      
      // Intentar cargar desde copias de seguridad
      try {
        const empleadosBackup = loadFromStorage('empleados_backup');
        if (empleadosBackup && Array.isArray(empleadosBackup)) {
          setEmpleadosRegistrados(empleadosBackup);
          const conectados = empleadosBackup.filter((emp: User) => emp.isConnected);
          setEmpleadosConectados(conectados);
        }
      } catch (e) {
        console.error('Error al cargar copias de seguridad:', e);
        // Inicializar con arrays vacíos en caso de error crítico
        setEmpleadosRegistrados([]);
        setEmpleadosConectados([]);
      }
      
      // Limpiar sesión en caso de error
      localStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
      
      setDataLoaded(true);
    }
  }, []);

  // Guardar empleados cuando cambien
  useEffect(() => {
    if (dataLoaded && empleadosRegistrados.length > 0) {
      saveToStorage('empleados', empleadosRegistrados);
      
      // Crear respaldo automático cada vez que cambian los empleados
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      localStorage.setItem(`empleados_backup_${timestamp}`, JSON.stringify(empleadosRegistrados));
      
      // Mantener solo los últimos 5 backups
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith('empleados_backup_'))
        .sort()
        .reverse();
      
      if (keys.length > 5) {
        keys.slice(5).forEach(key => localStorage.removeItem(key));
      }
    }
  }, [empleadosRegistrados, dataLoaded]);

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

      // Verificar empleados
      const foundUser = empleadosRegistrados.find(u => 
        u.username === username && (u as any).password === password
      );

      if (foundUser) {
        const empleadoUser: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: 'empleado',
          equipoId: foundUser.equipoId,
          isConnected: true,
          lastLogin: new Date().toISOString(),
          createdAt: foundUser.createdAt
        };

        // Actualizar usuario en localStorage
        const updatedUsers = empleadosRegistrados.map(u => 
          u.id === foundUser.id 
            ? { ...u, isConnected: true, lastLogin: empleadoUser.lastLogin }
            : u
        );
        
        setEmpleadosRegistrados(updatedUsers);
        setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);
        
        saveToStorage('empleados', updatedUsers);
        saveToStorage('currentUser', empleadoUser);

        setUser(empleadoUser);
        setIsAuthenticated(true);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

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
        
        // Limpiar sesión
        localStorage.removeItem('currentUser');
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout en caso de error
      localStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  };

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
        password, // Guardar contraseña para autenticación
        role: 'empleado',
        isConnected: false,
        createdAt: timestamp
      };

      const updatedEmpleados = [...empleadosRegistrados, nuevoEmpleado];
      
      // Guardar con respaldo
      saveToStorage('empleados', updatedEmpleados);
      saveToStorage('empleados_backup', updatedEmpleados);
      
      setEmpleadosRegistrados(updatedEmpleados as User[]);

      return true;
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      return false;
    }
  };

  const eliminarEmpleado = (id: string) => {
    try {
      // Solo el admin puede eliminar empleados
      if (user?.role !== 'admin') {
        console.error('Solo el administrador puede eliminar empleados');
        return;
      }
      
      // Crear respaldo antes de eliminar
      saveToStorage('empleados_before_delete', empleadosRegistrados);
      
      const updatedEmpleados = empleadosRegistrados.filter(emp => emp.id !== id);
      saveToStorage('empleados', updatedEmpleados);
      setEmpleadosRegistrados(updatedEmpleados);
      setEmpleadosConectados(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      
      // Intentar restaurar desde el respaldo
      const backup = loadFromStorage('empleados_before_delete');
      if (backup) {
        setEmpleadosRegistrados(backup);
        saveToStorage('empleados', backup);
      }
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
