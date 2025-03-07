"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'empleado';
  equipoId?: string;
  isConnected?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registrarEmpleado: (username: string, password: string) => Promise<boolean>;
  empleadosRegistrados: User[];
  empleadosConectados: User[];
  eliminarEmpleado: (empleadoId: string) => void;
}

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

const ADMIN_CREDENTIALS = {
  username: 'Ariel',
  password: 'ariel123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);

  // Cargar usuarios registrados del localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('empleados');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      setEmpleadosRegistrados(users.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: 'empleado',
        equipoId: u.equipoId,
        isConnected: u.isConnected
      })));
      // Actualizar empleados conectados
      const connected = users.filter((u: any) => u.isConnected);
      setEmpleadosConectados(connected.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: 'empleado',
        equipoId: u.equipoId,
        isConnected: true
      })));
    }
  }, []);

  // Actualizar localStorage cuando cambien los empleados registrados
  useEffect(() => {
    if (empleadosRegistrados.length > 0) {
      const storedUsers = localStorage.getItem('empleados');
      const currentUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Mantener las contraseñas existentes al actualizar
      const updatedUsers = empleadosRegistrados.map(emp => {
        const existingUser = currentUsers.find((u: any) => u.id === emp.id);
        return {
          ...emp,
          password: existingUser?.password || ''
        };
      });
      
      localStorage.setItem('empleados', JSON.stringify(updatedUsers));
    }
  }, [empleadosRegistrados]);

  // Verificar el estado de conexión cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const storedUsers = localStorage.getItem('empleados');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const connected = users.filter((u: any) => u.isConnected);
        setEmpleadosConectados(connected.map((u: any) => ({
          id: u.id,
          username: u.username,
          role: 'empleado',
          equipoId: u.equipoId,
          isConnected: true
        })));
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Verificar si es el admin
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: 'admin',
        username: ADMIN_CREDENTIALS.username,
        role: 'admin',
        isConnected: true
      };
      setUser(adminUser);
      return true;
    }

    // Verificar empleados registrados
    const storedUsers = localStorage.getItem('empleados');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const foundUser = users.find((u: any) => 
        u.username === username && u.password === password
      );

      if (foundUser) {
        const empleadoUser: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: 'empleado',
          equipoId: foundUser.equipoId,
          isConnected: true
        };
        
        // Actualizar estado de conexión
        const updatedUsers = users.map((u: any) => 
          u.id === foundUser.id ? { ...u, isConnected: true } : u
        );
        localStorage.setItem('empleados', JSON.stringify(updatedUsers));
        
        setUser(empleadoUser);
        setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);
        setEmpleadosRegistrados(prev => 
          prev.map(u => u.id === empleadoUser.id ? { ...u, isConnected: true } : u)
        );
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    if (user && user.role === 'empleado') {
      // Actualizar estado de conexión en localStorage
      const storedUsers = localStorage.getItem('empleados');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((u: any) => 
          u.id === user.id ? { ...u, isConnected: false } : u
        );
        localStorage.setItem('empleados', JSON.stringify(updatedUsers));
        setEmpleadosConectados(prev => prev.filter(u => u.id !== user.id));
        setEmpleadosRegistrados(prev => 
          prev.map(u => u.id === user.id ? { ...u, isConnected: false } : u)
        );
      }
    }
    setUser(null);
  };

  const registrarEmpleado = async (username: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem('empleados');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // Verificar si el usuario ya existe
    if (users.some((u: any) => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      role: 'empleado',
      isConnected: false
    };

    const newStoredUser = {
      ...newUser,
      password
    };

    users.push(newStoredUser);
    localStorage.setItem('empleados', JSON.stringify(users));
    setEmpleadosRegistrados(prev => [...prev, newUser]);
    return true;
  };

  const eliminarEmpleado = (empleadoId: string) => {
    // Obtener usuarios del localStorage
    const storedUsers = localStorage.getItem('empleados');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      // Filtrar el usuario a eliminar
      const updatedUsers = users.filter((u: any) => u.id !== empleadoId);
      // Actualizar localStorage
      localStorage.setItem('empleados', JSON.stringify(updatedUsers));
      // Actualizar estados
      setEmpleadosRegistrados(prev => prev.filter(u => u.id !== empleadoId));
      setEmpleadosConectados(prev => prev.filter(u => u.id !== empleadoId));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
