"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import syncService from '@/lib/services/syncService';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Claves para almacenamiento
const STORAGE_KEYS = {
  CURRENT_USER: 'auth_current_user',
  EMPLEADOS: 'auth_empleados',
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
  sincronizarAutenticacion: () => void;
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
  eliminarEmpleado: async () => {},
  sincronizarAutenticacion: () => {}
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
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // Cargar estado inicial
  useEffect(() => {
    // Solo ejecutar en el navegador
    if (!isBrowser) return;
    
    const loadData = () => {
      try {
        console.log('Cargando datos de autenticación...');
        // Cargar usuario actual
        const currentUser = syncService.loadData(STORAGE_KEYS.CURRENT_USER);
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          console.log('Usuario autenticado cargado:', currentUser.username);
        }
        
        // Cargar empleados
        const empleadosData = syncService.loadData(STORAGE_KEYS.EMPLEADOS);
        if (empleadosData && Array.isArray(empleadosData)) {
          // Asegurar que todos los empleados tengan los campos requeridos
          const empleadosValidados = empleadosData.map((emp: any) => ({
            id: emp.id || `empleado_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
          console.log(`Empleados cargados: ${empleadosValidados.length}, Conectados: ${conectados.length}`);
        }
        
        setDataLoaded(true);
        setLastSyncTime(Date.now());
        console.log('Datos de autenticación cargados correctamente');
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        setDataLoaded(true);
      }
    };
    
    loadData();
    
    // Intentar cargar datos cada vez que la ventana obtiene el foco
    const handleFocus = () => {
      console.log('Ventana enfocada, recargando datos de autenticación...');
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Configurar sincronización cuando los datos estén cargados
  useEffect(() => {
    // Solo ejecutar en el navegador
    if (!isBrowser || !dataLoaded || syncInitialized) return;
    
    console.log('Inicializando sistema de sincronización de autenticación...');
    
    // Función para actualizar datos según la clave
    const updateAuthData = (key: string, newData: any) => {
      console.log(`Actualizando datos de autenticación para ${key}`);
      
      if (key === STORAGE_KEYS.EMPLEADOS && Array.isArray(newData)) {
        setEmpleadosRegistrados(newData);
        const conectados = newData.filter((emp: User) => emp.isConnected);
        setEmpleadosConectados(conectados);
        console.log(`Empleados actualizados: ${newData.length}, Conectados: ${conectados.length}`);
      } else if (key === STORAGE_KEYS.CURRENT_USER) {
        // Solo actualizar si no hay usuario o si el ID coincide
        if (!user || (newData && user.id === newData.id)) {
          setUser(newData);
          setIsAuthenticated(!!newData);
          console.log('Usuario actual actualizado:', newData ? newData.username : 'Ninguno');
        }
      }
      
      setLastSyncTime(Date.now());
    };
    
    // Configurar listener para cambios en localStorage (otras pestañas/ventanas)
    const removeStorageListener = syncService.setupStorageListener(updateAuthData);
    
    // Configurar sincronización periódica
    const stopPeriodicSync = syncService.startPeriodicSync(
      [STORAGE_KEYS.EMPLEADOS, STORAGE_KEYS.CURRENT_USER],
      updateAuthData
    );
    
    // Configurar listener para eventos personalizados
    const handleDataUpdated = (event: CustomEvent) => {
      const { key, timestamp, deviceId } = event.detail;
      
      if (key === STORAGE_KEYS.EMPLEADOS || key === STORAGE_KEYS.CURRENT_USER) {
        console.log(`Evento de actualización de autenticación recibido para ${key} con timestamp ${timestamp} desde dispositivo ${deviceId}`);
        
        // Si el evento no es de este dispositivo, forzar recarga de datos
        if (deviceId !== syncService.DEVICE_ID) {
          const newData = syncService.loadData(key);
          updateAuthData(key, newData);
        }
      }
    };
    
    // Configurar listener para eventos de sincronización forzada
    const handleForceSyncEvent = (event: MessageEvent) => {
      if (event.data && event.data.type === 'force-sync') {
        console.log('Recibida solicitud de sincronización forzada desde otro dispositivo');
        sincronizarAutenticacion();
      }
    };
    
    // Intentar configurar BroadcastChannel para eventos entre pestañas
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('sync_channel');
      broadcastChannel.addEventListener('message', handleForceSyncEvent);
    } catch (e) {
      console.warn('BroadcastChannel no disponible para sincronización de autenticación');
    }
    
    window.addEventListener('data-updated', handleDataUpdated as EventListener);
    
    setSyncInitialized(true);
    console.log('Sistema de sincronización de autenticación inicializado correctamente');
    
    // Limpiar listeners al desmontar
    return () => {
      removeStorageListener();
      stopPeriodicSync();
      window.removeEventListener('data-updated', handleDataUpdated as EventListener);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleForceSyncEvent);
        broadcastChannel.close();
      }
    };
  }, [dataLoaded, syncInitialized, user]);

  // Función para forzar sincronización inmediata
  const sincronizarAutenticacion = () => {
    if (!isBrowser) return;
    
    console.log('Forzando sincronización inmediata de datos de autenticación...');
    
    // Función para actualizar datos según la clave
    const updateAuthData = (key: string, newData: any) => {
      console.log(`Sincronización forzada: Actualizando datos de autenticación para ${key}`);
      
      if (key === STORAGE_KEYS.EMPLEADOS && Array.isArray(newData)) {
        setEmpleadosRegistrados(newData);
        const conectados = newData.filter((emp: User) => emp.isConnected);
        setEmpleadosConectados(conectados);
      } else if (key === STORAGE_KEYS.CURRENT_USER) {
        // Solo actualizar si no hay usuario o si el ID coincide
        if (!user || (newData && user.id === newData.id)) {
          setUser(newData);
          setIsAuthenticated(!!newData);
        }
      }
    };
    
    // Usar la nueva función forceSyncNow para forzar sincronización
    syncService.forceSyncNow(
      [STORAGE_KEYS.EMPLEADOS, STORAGE_KEYS.CURRENT_USER],
      updateAuthData
    );
    
    setLastSyncTime(Date.now());
    
    // Notificar a otros dispositivos que deben sincronizar
    if (isBrowser) {
      try {
        // Usar BroadcastChannel si está disponible
        const bc = new BroadcastChannel('sync_channel');
        bc.postMessage({ 
          type: 'force-sync-auth', 
          timestamp: Date.now(), 
          deviceId: syncService.DEVICE_ID 
        });
        bc.close();
      } catch (e) {
        // Fallback a localStorage
        const syncMessage = {
          type: 'force-sync-auth',
          timestamp: Date.now(),
          deviceId: syncService.DEVICE_ID
        };
        localStorage.setItem('__sync_force_auth', JSON.stringify(syncMessage));
        localStorage.removeItem('__sync_force_auth');
      }
    }
    
    console.log('Sincronización forzada de autenticación completada. Última sincronización:', new Date(lastSyncTime).toLocaleTimeString());
  };

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
        if (isBrowser) {
          syncService.saveData(STORAGE_KEYS.CURRENT_USER, adminUser);
        }
        
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
        if (isBrowser) {
          syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedUsers);
          syncService.saveData(STORAGE_KEYS.CURRENT_USER, empleadoUser);
        }
        
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
          if (isBrowser) {
            syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
          }
          
          // Actualizar estados locales
          setEmpleadosRegistrados(updatedEmpleados);
          setEmpleadosConectados(prev => prev.filter(u => u.id !== user.id));
        }
        
        // Limpiar sesión
        if (isBrowser) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout en caso de error
      if (isBrowser) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
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
      if (isBrowser) {
        syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
        
        // Crear respaldo
        syncService.saveData(STORAGE_KEYS.EMPLEADOS_BACKUP, updatedEmpleados);
      }
      
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
      if (isBrowser) {
        syncService.saveData(STORAGE_KEYS.EMPLEADOS_BACKUP, empleadosRegistrados);
      }
      
      // Actualizar la lista de empleados
      const updatedEmpleados = empleadosRegistrados.filter(emp => emp.id !== id);
      
      // Guardar con sincronización
      if (isBrowser) {
        syncService.saveData(STORAGE_KEYS.EMPLEADOS, updatedEmpleados);
      }
      
      // Actualizar estados locales
      setEmpleadosRegistrados(updatedEmpleados);
      setEmpleadosConectados(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      
      // Intentar restaurar desde el respaldo
      if (isBrowser) {
        const backup = syncService.loadData(STORAGE_KEYS.EMPLEADOS_BACKUP);
        if (backup && Array.isArray(backup)) {
          setEmpleadosRegistrados(backup as User[]);
          syncService.saveData(STORAGE_KEYS.EMPLEADOS, backup);
        }
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
      eliminarEmpleado,
      sincronizarAutenticacion
    }}>
      {children}
    </AuthContext.Provider>
  );
}
