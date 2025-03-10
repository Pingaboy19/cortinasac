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

  // Cargar estado inicial
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const empleados = localStorage.getItem('empleados');
      
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      if (empleados) {
        const empleadosData = JSON.parse(empleados);
        setEmpleadosRegistrados(empleadosData);
        const conectados = empleadosData.filter((emp: User) => emp.isConnected);
        setEmpleadosConectados(conectados);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Limpiar datos corruptos
      localStorage.removeItem('currentUser');
      localStorage.removeItem('empleados');
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
          isConnected: true,
          createdAt: new Date().toISOString()
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
          isConnected: true,
          lastLogin: new Date().toISOString(),
          createdAt: foundUser.createdAt
        };

        // Actualizar usuario en localStorage
        const updatedUsers = users.map((u: any) => 
          u.id === foundUser.id 
            ? { ...u, isConnected: true, lastLogin: empleadoUser.lastLogin }
            : u
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
      // Verificar si el usuario ya existe
      const empleadoExistente = empleadosRegistrados.find(emp => emp.username === username);
      if (empleadoExistente) {
        return false;
      }

      const nuevoEmpleado: User = {
        id: `empleado_${Date.now()}`,
        username,
        role: 'empleado',
        isConnected: false,
        createdAt: new Date().toISOString()
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
