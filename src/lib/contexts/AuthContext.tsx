"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'empleado';
  equipoId?: string;
  isConnected: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [empleadosRegistrados, setEmpleadosRegistrados] = useState<User[]>([]);
  const [empleadosConectados, setEmpleadosConectados] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    try {
      // Cargar empleados registrados
      const storedEmpleados = localStorage.getItem('empleados');
      if (storedEmpleados) {
        setEmpleadosRegistrados(JSON.parse(storedEmpleados));
      }

      // Intentar restaurar la sesión
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Si es un empleado, actualizar su estado de conexión
        if (parsedUser.role === 'empleado') {
          const updatedEmpleados = JSON.parse(storedEmpleados || '[]').map((emp: User) =>
            emp.id === parsedUser.id ? { ...emp, isConnected: true } : emp
          );
          localStorage.setItem('empleados', JSON.stringify(updatedEmpleados));
          setEmpleadosRegistrados(updatedEmpleados);
          setEmpleadosConectados(prev => [...prev.filter(u => u.id !== parsedUser.id), parsedUser]);
        }
      }
    } catch (error) {
      console.error('Error al cargar el estado inicial:', error);
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
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
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
        setIsAuthenticated(true);
        setEmpleadosRegistrados(updatedUsers);
        setEmpleadosConectados(prev => [...prev.filter(u => u.id !== empleadoUser.id), empleadoUser]);

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
          localStorage.setItem('empleados', JSON.stringify(updatedEmpleados));
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
    }
  };

  const registrarEmpleado = async (username: string, password: string): Promise<boolean> => {
    try {
      const nuevoEmpleado: User = {
        id: `empleado_${Date.now()}`,
        username,
        role: 'empleado',
        isConnected: false
      };

      const empleadoConPassword = {
        ...nuevoEmpleado,
        password
      };

      const updatedEmpleados = [...empleadosRegistrados, empleadoConPassword];
      localStorage.setItem('empleados', JSON.stringify(updatedEmpleados));
      setEmpleadosRegistrados(updatedEmpleados);

      return true;
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      return false;
    }
  };

  const eliminarEmpleado = (id: string) => {
    try {
      const updatedEmpleados = empleadosRegistrados.filter(emp => emp.id !== id);
      localStorage.setItem('empleados', JSON.stringify(updatedEmpleados));
      setEmpleadosRegistrados(updatedEmpleados);
      setEmpleadosConectados(prev => prev.filter(u => u.id !== id));
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
