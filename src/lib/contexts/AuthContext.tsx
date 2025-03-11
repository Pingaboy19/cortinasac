"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import syncService from '@/lib/services/syncService';

// Claves para almacenamiento
const STORAGE_KEYS = {
  CURRENT_USER: 'crm_current_user',
  EMPLEADOS: 'crm_empleados',
  EMPLEADOS_BACKUP: 'crm_empleados_backup'
};

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
  eliminarEmpleado: (id: string) => Promise<void>;
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
  eliminarEmpleado: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncInitialized, setSyncInitialized] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    const loadData = () => {
      try {
        // Cargar usuario actual
        const currentUser = syncService.loadData(STORAGE_KEYS.CURRENT_USER);
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
        
        // Cargar empleados
        const empleadosData = syncService.loadData(STORAGE_KEYS.EMPLEADOS);
        if (empleadosData && Array.isArray(empleadosData)) {
          // Asegurar que todos los empleados tengan los campos requeridos
          const empleadosValidados = empleadosData.map((emp: any) => ({
            id: emp.id || `empleado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: emp.username || 'Usuario sin nombre',
            role: emp.role || 'empleado',
            isConnected: emp.isConnected || false,
            createdAt: emp.createdAt || new Date().toISOString(),
            ...(emp.password && { password: emp.password }),
            ...(emp.equipoId && { equipoId: emp.equipoId }),
            ...(emp.lastLogin && { lastLogin: emp.lastLogin })
          }));
          
          setEmpleadosRegistrados(empleadosValidados);
          
          // Guardar empleados validados
          syncService.saveData(STORAGE_KEYS.EMPLEADOS, empleadosValidados);
          
          const conectados = empleadosValidados.filter((emp: User) => emp.isConnected);
          setEmpleadosConectados(conectados);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setDataLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Configurar sincronización cuando los datos estén cargados
  useEffect(() => {
    if (!dataLoaded || syncInitialized) return;
    
    // Configurar listener para cambios en localStorage (otras pestañas/ventanas)
    const removeStorageListener = syncService.setupStorageListener((key, newData) => {
      if (key === STORAGE_KEYS.EMPLEADOS && Array.isArray(newData)) {
        setEmpleadosRegistrados(newData);
        const conectados = newData.filter((emp: User) => emp.isConnected);
        setEmpleadosConectados(conectados);
      }
    });
    
    // Configurar sincronización periódica
    const stopPeriodicSync = syncService.startPeriodicSync(
      [STORAGE_KEYS.EMPLEADOS],
      (key, newData) => {
        if (key === STORAGE_KEYS.EMPLEADOS && Array.isArray(newData)) {
          setEmpleadosRegistrados(newData);
          const conectados = newData.filter((emp: User) => emp.isConnected);
          setEmpleadosConectados(conectados);
        }
      }
    );
    
    setSyncInitialized(true);
    
    // Limpiar listeners al desmontar
    return () => {
      removeStorageListener();
      stopPeriodicSync();
    };
  }, [dataLoaded, syncInitialized]);

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
        
        // Guardar en localStorage
        syncService.saveData(STORAGE_KEYS.CURRENT_USER, adminUser);
        
        return true;
      }

      // Verificar empleados
      const foundUser = empleadosRegistrados.find(u => 
        u.username === username && (u as any).password === password
      );

      if (foundUser) {
        const timestamp = new Date().toISOString();
        const empleadoUser: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: 'empleado',
          equipoId: foundUser.equipoId,
          isConnected: true,
          lastLogin: timestamp,
          createdAt: foundUser.createdAt
        };

        // Actualizar usuario en la lista de empleados
        const updatedUsers = empleadosRegistrados.map(u => 
          u.id === foundUser.id 
            ? { ...u, isConnected: true, lastLogin: timestamp }
            : u
        );
        
        // Guardar con sincronización
        syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedUsers);
        syncService.saveData(STORAGE_KEYS.CURRENT_USER, empleadoUser);
        
        // Actualizar estados locales
        setEmpleadosRegistrados(updatedUsers);
        setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);
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
          
          // Guardar con sincronización
          syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
          
          // Actualizar estados locales
          setEmpleadosRegistrados(updatedEmpleados);
          setEmpleadosConectados(prev => prev.filter(u => u.id !== user.id));
        }
        
        // Limpiar sesión
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout en caso de error
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
      const id = `empleado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const nuevoEmpleado: User & { password: string } = {
        id,
        username,
        password, // Guardar contraseña para autenticación
        role: 'empleado',
        isConnected: false,
        createdAt: timestamp
      };

      // Actualizar la lista de empleados
      const updatedEmpleados = [...empleadosRegistrados, nuevoEmpleado];
      
      // Guardar con sincronización
      syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
      
      // Crear respaldo
      syncService.saveData(STORAGE_KEYS.EMPLEADOS_BACKUP, updatedEmpleados);
      
      // Actualizar estado local
      setEmpleadosRegistrados(updatedEmpleados as User[]);

      return true;
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      return false;
    }
  };

  const eliminarEmpleado = async (id: string) => {
    try {
      // Solo el admin puede eliminar empleados
      if (user?.role !== 'admin') {
        console.error('Solo el administrador puede eliminar empleados');
        return;
      }
      
      // Crear respaldo antes de eliminar
      syncService.saveData(STORAGE_KEYS.EMPLEADOS_BACKUP, empleadosRegistrados);
      
      // Actualizar la lista de empleados
      const updatedEmpleados = empleadosRegistrados.filter(emp => emp.id !== id);
      
      // Guardar con sincronización
      syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
      
      // Actualizar estados locales
      setEmpleadosRegistrados(updatedEmpleados);
      setEmpleadosConectados(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      
      // Intentar restaurar desde el respaldo
      const backup = syncService.loadData(STORAGE_KEYS.EMPLEADOS_BACKUP);
      if (backup && Array.isArray(backup)) {
        setEmpleadosRegistrados(backup as User[]);
        syncService.saveData(STORAGE_KEYS.EMPLEADOS, backup);
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
