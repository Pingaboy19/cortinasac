"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'empleado';
  equipoId?: string;
  isConnected?: boolean;
}

interface UserWithPassword extends User {
  password: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);

  // Cargar el estado inicial
  useEffect(() => {
    try {
      // Intentar recuperar la sesión del usuario
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }

      // Cargar empleados registrados
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

        const connected = users.filter((u: any) => u.isConnected);
        setEmpleadosConectados(connected);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Verificar credenciales de admin
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          isConnected: true
        };
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        router.push('/dashboard');
        return true;
      }

      // Verificar empleados
      const storedUsers = localStorage.getItem('empleados') || '[]';
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

        // Actualizar usuario en localStorage
        const updatedUsers = users.map((u: any) => 
          u.id === foundUser.id ? { ...u, isConnected: true } : u
        );
        localStorage.setItem('empleados', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(empleadoUser));

        setUser(empleadoUser);
        setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);
        setEmpleadosRegistrados(prev => 
          prev.map(u => u.id === empleadoUser.id ? { ...u, isConnected: true } : u)
        );

        router.push('/dashboard');
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
        localStorage.removeItem('currentUser');
        setUser(null);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const registrarEmpleado = async (username: string, password: string): Promise<boolean> => {
    try {
      const storedUsers = localStorage.getItem('empleados') || '[]';
      const users = JSON.parse(storedUsers);

      if (users.some((u: any) => u.username === username)) {
        return false;
      }

      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        username,
        password,
        role: 'empleado',
        isConnected: false
      };

      users.push(newUser);
      localStorage.setItem('empleados', JSON.stringify(users));
      
      // Crear una versión del usuario sin contraseña para el estado
      const userForState: User = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        isConnected: newUser.isConnected
      };
      
      setEmpleadosRegistrados(prev => [...prev, userForState]);
      
      return true;
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      return false;
    }
  };

  const eliminarEmpleado = (empleadoId: string) => {
    try {
      const storedUsers = localStorage.getItem('empleados');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.filter((u: any) => u.id !== empleadoId);
        localStorage.setItem('empleados', JSON.stringify(updatedUsers));
        setEmpleadosRegistrados(prev => prev.filter(u => u.id !== empleadoId));
        setEmpleadosConectados(prev => prev.filter(u => u.id !== empleadoId));
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
