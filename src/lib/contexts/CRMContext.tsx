'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  necesidades?: string;
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Empleado {
  id: string;
  nombre: string;
  equipo: string;
  equipoTemporal?: string;
  comision: number;
  ultimaComision: string; // Fecha del último reset de comisión
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Equipo {
  id: string;
  nombre: string;
  color: string;
  members: string[]; // IDs de los empleados en el equipo
  fechaCreacion: string;
  ultimaModificacion: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  equipoId: string;
  comision: number;
  fecha: string;
  observaciones: string;
  montoCobrado?: number;
  metodoPago?: 'efectivo' | 'tarjeta';
  fechaCreacion: string;
  ultimaModificacion: string;
}

export interface CRMContextType {
  clientes: Cliente[];
  empleados: Empleado[];
  equipos: Equipo[];
  tareas: Tarea[];
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => void;
  agregarEmpleado: (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => void;
  agregarEquipo: (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => void;
  agregarTarea: (tarea: Omit<Tarea, 'id' | 'estado' | 'observaciones' | 'fechaCreacion' | 'ultimaModificacion'>) => void;
  actualizarEmpleado: (id: string, datos: Partial<Empleado>) => void;
  actualizarTarea: (id: string, datos: Partial<Tarea>) => void;
  eliminarEquipo: (id: string) => void;
  eliminarTarea: (id: string) => void;
  buscarClientePorNombre: (nombre: string) => Cliente[];
  agregarMiembroEquipo: (equipoId: string, empleadoId: string) => void;
  removerMiembroEquipo: (equipoId: string, empleadoId: string) => void;
  obtenerMiembrosEquipo: (equipoId: string) => string[];
  respaldarDatos: () => void;
  restaurarDatos: () => void;
}

export const CRMContext = createContext<CRMContextType>({
  clientes: [],
  empleados: [],
  equipos: [],
  tareas: [],
  agregarCliente: () => {},
  agregarEmpleado: () => {},
  agregarEquipo: () => {},
  agregarTarea: () => {},
  actualizarEmpleado: () => {},
  actualizarTarea: () => {},
  eliminarEquipo: () => {},
  eliminarTarea: () => {},
  buscarClientePorNombre: () => [],
  agregarMiembroEquipo: () => {},
  removerMiembroEquipo: () => {},
  obtenerMiembrosEquipo: () => [],
  respaldarDatos: () => {},
  restaurarDatos: () => {}
});

const STORAGE_KEYS = {
  CLIENTES: 'crm_clientes',
  EMPLEADOS: 'crm_empleados',
  EQUIPOS: 'crm_equipos',
  TAREAS: 'crm_tareas',
  BACKUP: 'crm_backup',
  LAST_UPDATE: 'crm_last_update'  // Nuevo key para tracking de actualizaciones
};

// Función para obtener timestamp actual
const getTimestamp = () => new Date().toISOString();

// Función para guardar datos en localStorage con un ID único para la aplicación
const saveToStorage = (key: string, data: any) => {
  try {
    // Usar un ID de aplicación consistente para todos los dispositivos
    const appId = 'cortinas-crm-app';
    const fullKey = `${appId}_${key}`;
    
    localStorage.setItem(fullKey, JSON.stringify(data));
    const timestamp = getTimestamp();
    localStorage.setItem(`${appId}_LAST_UPDATE`, timestamp);
    setLastUpdate(timestamp);
    
    // Intentar sincronizar con sessionStorage para persistencia entre pestañas
    try {
      sessionStorage.setItem(fullKey, JSON.stringify(data));
      sessionStorage.setItem(`${appId}_LAST_UPDATE`, timestamp);
    } catch (e) {
      console.warn('No se pudo sincronizar con sessionStorage', e);
    }
    
    return true;
  } catch (error) {
    console.error(`Error al guardar ${key}:`, error);
    return false;
  }
};

// Función para cargar datos de localStorage con ID único
const loadFromStorage = (key: string) => {
  try {
    const appId = 'cortinas-crm-app';
    const fullKey = `${appId}_${key}`;
    
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

export function CRMProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(getTimestamp());

  // Función para verificar y cargar actualizaciones
  const checkForUpdates = () => {
    try {
      const appId = 'cortinas-crm-app';
      const storedLastUpdate = localStorage.getItem(`${appId}_LAST_UPDATE`);
      
      if (storedLastUpdate && storedLastUpdate > lastUpdate) {
        console.log('Actualizando datos desde localStorage...');
        loadData();
        setLastUpdate(storedLastUpdate);
      }
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
    }
  };

  // Cargar datos al iniciar
  const loadData = () => {
    try {
      const appId = 'cortinas-crm-app';
      
      // Intentar cargar desde localStorage
      const clientesData = loadFromStorage(STORAGE_KEYS.CLIENTES) || [];
      const empleadosData = loadFromStorage(STORAGE_KEYS.EMPLEADOS) || [];
      const equiposData = loadFromStorage(STORAGE_KEYS.EQUIPOS) || [];
      const tareasData = loadFromStorage(STORAGE_KEYS.TAREAS) || [];
      
      // Actualizar estado
      setClientes(clientesData);
      setEmpleados(empleadosData);
      setEquipos(equiposData);
      
      // Actualizar estado de tareas y verificar vencidas
      const tareasActualizadas = tareasData.map((tarea: Tarea) => {
        // Verificar si la tarea está vencida
        const fechaTarea = new Date(tarea.fecha);
        const hoy = new Date();
        
        if (tarea.estado === 'pendiente' && fechaTarea < hoy) {
          return { ...tarea, estado: 'vencida' };
        }
        return tarea;
      });
      
      setTareas(tareasActualizadas);
      
      // Guardar el timestamp actual
      const timestamp = getTimestamp();
      localStorage.setItem(`${appId}_LAST_UPDATE`, timestamp);
      setLastUpdate(timestamp);
      
      setDataLoaded(true);
      console.log('Datos cargados correctamente');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setDataLoaded(true); // Marcar como cargado incluso en caso de error
    }
  };

  // Efecto para sincronización periódica
  useEffect(() => {
    // Cargar datos iniciales
    loadData();
    
    // Configurar intervalo de sincronización
    const syncInterval = setInterval(checkForUpdates, 1000); // Verificar cada segundo
    
    // Evento para sincronización entre pestañas/dispositivos
    const handleStorageChange = (e: StorageEvent) => {
      const appId = 'cortinas-crm-app';
      if (e.key === `${appId}_LAST_UPDATE` || e.key?.startsWith(appId)) {
        checkForUpdates();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Evento para cuando la ventana obtiene el foco
    const handleFocus = () => {
      checkForUpdates();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Evento para cuando la aplicación se vuelve visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    });
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', () => {});
    };
  }, [lastUpdate]);

  // Funciones para manipular datos
  const agregarCliente = (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoCliente: Cliente = {
      id: `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...cliente,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosClientes = [...clientes, nuevoCliente];
    setClientes(nuevosClientes);
    saveToStorage(STORAGE_KEYS.CLIENTES, nuevosClientes);
  };

  const agregarEmpleado = (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => {
    const timestamp = getTimestamp();
    const nuevoEmpleado: Empleado = {
      id: `empleado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...empleado,
      ultimaComision: timestamp,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosEmpleados = [...empleados, nuevoEmpleado];
    setEmpleados(nuevosEmpleados);
    saveToStorage(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
  };

  const agregarEquipo = (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoEquipo: Equipo = {
      id: `equipo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...equipo,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosEquipos = [...equipos, nuevoEquipo];
    setEquipos(nuevosEquipos);
    saveToStorage(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
  };

  const agregarTarea = (tarea: Omit<Tarea, 'id' | 'estado' | 'observaciones' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevaTarea: Tarea = {
      id: `tarea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tarea,
      estado: 'pendiente',
      observaciones: '',
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevasTareas = [...tareas, nuevaTarea];
    setTareas(nuevasTareas);
    saveToStorage(STORAGE_KEYS.TAREAS, nuevasTareas);
  };

  const actualizarEmpleado = (id: string, datos: Partial<Empleado>) => {
    const timestamp = getTimestamp();
    const nuevosEmpleados = empleados.map(emp => 
      emp.id === id ? { ...emp, ...datos, ultimaModificacion: timestamp } : emp
    );
    
    setEmpleados(nuevosEmpleados);
    saveToStorage(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
  };

  const actualizarTarea = (id: string, datos: Partial<Tarea>) => {
    const timestamp = getTimestamp();
    const nuevasTareas = tareas.map(tarea => 
      tarea.id === id ? { ...tarea, ...datos, ultimaModificacion: timestamp } : tarea
    );
    
    setTareas(nuevasTareas);
    saveToStorage(STORAGE_KEYS.TAREAS, nuevasTareas);
  };

  const eliminarEquipo = (id: string) => {
    // Verificar si hay empleados en el equipo
    const equipoAEliminar = equipos.find(eq => eq.id === id);
    if (equipoAEliminar && equipoAEliminar.members.length > 0) {
      // Actualizar empleados para quitar la referencia al equipo
      const nuevosEmpleados = empleados.map(emp => {
        if (equipoAEliminar.members.includes(emp.id)) {
          return { ...emp, equipo: '', ultimaModificacion: getTimestamp() };
        }
        return emp;
      });
      
      setEmpleados(nuevosEmpleados);
      saveToStorage(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
    }
    
    // Eliminar el equipo
    const nuevosEquipos = equipos.filter(eq => eq.id !== id);
    setEquipos(nuevosEquipos);
    saveToStorage(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
  };

  const eliminarTarea = (id: string) => {
    const nuevasTareas = tareas.filter(tarea => tarea.id !== id);
    setTareas(nuevasTareas);
    saveToStorage(STORAGE_KEYS.TAREAS, nuevasTareas);
  };

  const buscarClientePorNombre = (nombre: string) => {
    if (!nombre.trim()) return clientes;
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  };

  const agregarMiembroEquipo = (equipoId: string, empleadoId: string) => {
    // Verificar si el empleado ya está en otro equipo
    const equipoActual = equipos.find(eq => 
      eq.id !== equipoId && eq.members.includes(empleadoId)
    );
    
    if (equipoActual) {
      // Remover del equipo actual
      setEquipos(prev => prev.map(eq => 
        eq.id === equipoActual.id
          ? { 
              ...eq, 
              members: eq.members.filter(id => id !== empleadoId),
              ultimaModificacion: getTimestamp()
            }
          : eq
      ));
    }
    
    // Agregar al nuevo equipo
    setEquipos(prev => prev.map(eq => 
      eq.id === equipoId
        ? { 
            ...eq, 
            members: [...eq.members, empleadoId],
            ultimaModificacion: getTimestamp()
          }
        : eq
    ));
    
    // Actualizar el empleado
    actualizarEmpleado(empleadoId, { equipo: equipoId });
  };

  const removerMiembroEquipo = (equipoId: string, empleadoId: string) => {
    setEquipos(prev => prev.map(eq => 
      eq.id === equipoId
        ? { 
            ...eq, 
            members: eq.members.filter(id => id !== empleadoId),
            ultimaModificacion: getTimestamp()
          }
        : eq
    ));
    
    // Actualizar el empleado
    actualizarEmpleado(empleadoId, { equipo: '' });
  };

  const obtenerMiembrosEquipo = (equipoId: string) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.members : [];
  };

  // Función para respaldar todos los datos
  const respaldarDatos = () => {
    try {
      const timestamp = getTimestamp();
      const backup = {
        clientes,
        empleados,
        equipos,
        tareas,
        timestamp
      };
      
      saveToStorage(STORAGE_KEYS.BACKUP, backup);
      console.log('Respaldo creado correctamente');
      return true;
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      return false;
    }
  };

  // Función para restaurar desde el respaldo
  const restaurarDatos = () => {
    try {
      const backup = loadFromStorage(STORAGE_KEYS.BACKUP);
      if (!backup) {
        console.error('No hay respaldo disponible');
        return false;
      }
      
      setClientes(backup.clientes || []);
      setEmpleados(backup.empleados || []);
      setEquipos(backup.equipos || []);
      setTareas(backup.tareas || []);
      
      // Guardar los datos restaurados
      saveToStorage(STORAGE_KEYS.CLIENTES, backup.clientes || []);
      saveToStorage(STORAGE_KEYS.EMPLEADOS, backup.empleados || []);
      saveToStorage(STORAGE_KEYS.EQUIPOS, backup.equipos || []);
      saveToStorage(STORAGE_KEYS.TAREAS, backup.tareas || []);
      
      console.log('Datos restaurados correctamente');
      return true;
    } catch (error) {
      console.error('Error al restaurar datos:', error);
      return false;
    }
  };

  return (
    <CRMContext.Provider value={{
      clientes,
      empleados,
      equipos,
      tareas,
      agregarCliente,
      agregarEmpleado,
      agregarEquipo,
      agregarTarea,
      actualizarEmpleado,
      actualizarTarea,
      eliminarEquipo,
      eliminarTarea,
      buscarClientePorNombre,
      agregarMiembroEquipo,
      removerMiembroEquipo,
      obtenerMiembrosEquipo,
      respaldarDatos,
      restaurarDatos
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  return useContext(CRMContext);
} 