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
  estado: 'pendiente' | 'completada';
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
  BACKUP: 'crm_backup'
};

// Función para obtener timestamp actual
const getTimestamp = () => new Date().toISOString();

// Función para guardar datos en localStorage con manejo de errores
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
    localStorage.setItem(`${key}_lastUpdate`, getTimestamp());
    
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

// Función para cargar datos de localStorage con manejo de errores
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

export function CRMProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = () => {
      try {
        // Cargar datos desde localStorage
        const clientesData = loadFromStorage(STORAGE_KEYS.CLIENTES) || [];
        const empleadosData = loadFromStorage(STORAGE_KEYS.EMPLEADOS) || [];
        const equiposData = loadFromStorage(STORAGE_KEYS.EQUIPOS) || [];
        const tareasData = loadFromStorage(STORAGE_KEYS.TAREAS) || [];
        
        // Actualizar estados
        setClientes(clientesData);
        setEmpleados(empleadosData);
        setEquipos(equiposData);
        
        // Actualizar estado de tareas (mover vencidas a pendientes)
        const hoy = new Date().toISOString().split('T')[0];
        const tareasActualizadas = tareasData.map((tarea: Tarea) => {
          if (tarea.estado === 'pendiente' && tarea.fecha < hoy) {
            return { ...tarea, fecha: hoy, ultimaModificacion: getTimestamp() };
          }
          return tarea;
        });
        
        setTareas(tareasActualizadas);
        
        // Si se actualizaron las tareas, guardar los cambios
        if (JSON.stringify(tareasData) !== JSON.stringify(tareasActualizadas)) {
          saveToStorage(STORAGE_KEYS.TAREAS, tareasActualizadas);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        
        // Intentar cargar desde copias de seguridad
        const clientesBackup = loadFromStorage(STORAGE_KEYS.CLIENTES) || [];
        const empleadosBackup = loadFromStorage(STORAGE_KEYS.EMPLEADOS) || [];
        const equiposBackup = loadFromStorage(STORAGE_KEYS.EQUIPOS) || [];
        const tareasBackup = loadFromStorage(STORAGE_KEYS.TAREAS) || [];
        
        setClientes(clientesBackup);
        setEmpleados(empleadosBackup);
        setEquipos(equiposBackup);
        setTareas(tareasBackup);
        
        setDataLoaded(true);
      }
    };
    
    loadData();
    
    // Configurar intervalo para verificar y actualizar tareas pendientes
    const interval = setInterval(() => {
      if (dataLoaded) {
        const hoy = new Date().toISOString().split('T')[0];
        setTareas(prevTareas => {
          const tareasActualizadas = prevTareas.map(tarea => {
            if (tarea.estado === 'pendiente' && tarea.fecha < hoy) {
              return { ...tarea, fecha: hoy, ultimaModificacion: getTimestamp() };
            }
            return tarea;
          });
          
          // Guardar solo si hay cambios
          if (JSON.stringify(prevTareas) !== JSON.stringify(tareasActualizadas)) {
            saveToStorage(STORAGE_KEYS.TAREAS, tareasActualizadas);
          }
          
          return tareasActualizadas;
        });
      }
    }, 3600000); // Verificar cada hora
    
    return () => clearInterval(interval);
  }, [dataLoaded]);

  // Guardar datos cuando cambien
  useEffect(() => {
    if (dataLoaded) {
      saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
    }
  }, [clientes, dataLoaded]);
  
  useEffect(() => {
    if (dataLoaded) {
      saveToStorage(STORAGE_KEYS.EMPLEADOS, empleados);
    }
  }, [empleados, dataLoaded]);
  
  useEffect(() => {
    if (dataLoaded) {
      saveToStorage(STORAGE_KEYS.EQUIPOS, equipos);
    }
  }, [equipos, dataLoaded]);
  
  useEffect(() => {
    if (dataLoaded) {
      saveToStorage(STORAGE_KEYS.TAREAS, tareas);
    }
  }, [tareas, dataLoaded]);

  // Funciones para manipular datos
  const agregarCliente = (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoCliente: Cliente = {
      ...cliente,
      id: `cliente_${Date.now()}`,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setClientes(prev => [...prev, nuevoCliente]);
  };

  const agregarEmpleado = (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => {
    const timestamp = getTimestamp();
    const nuevoEmpleado: Empleado = {
      ...empleado,
      id: `empleado_${Date.now()}`,
      ultimaComision: timestamp,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setEmpleados(prev => [...prev, nuevoEmpleado]);
  };

  const agregarEquipo = (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoEquipo: Equipo = {
      ...equipo,
      id: `equipo_${Date.now()}`,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setEquipos(prev => [...prev, nuevoEquipo]);
  };

  const agregarTarea = (tarea: Omit<Tarea, 'id' | 'estado' | 'observaciones' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevaTarea: Tarea = {
      ...tarea,
      id: `tarea_${Date.now()}`,
      estado: 'pendiente',
      observaciones: '',
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setTareas(prev => [...prev, nuevaTarea]);
  };

  const actualizarEmpleado = (id: string, datos: Partial<Empleado>) => {
    setEmpleados(prev => prev.map(empleado => 
      empleado.id === id 
        ? { ...empleado, ...datos, ultimaModificacion: getTimestamp() } 
        : empleado
    ));
  };

  const actualizarTarea = (id: string, datos: Partial<Tarea>) => {
    setTareas(prev => prev.map(tarea => 
      tarea.id === id 
        ? { ...tarea, ...datos, ultimaModificacion: getTimestamp() } 
        : tarea
    ));
  };

  const eliminarEquipo = (id: string) => {
    // Obtener miembros del equipo antes de eliminarlo
    const equipo = equipos.find(eq => eq.id === id);
    if (equipo) {
      // Actualizar empleados para quitar la referencia al equipo eliminado
      setEmpleados(prev => prev.map(empleado => 
        equipo.members.includes(empleado.id)
          ? { ...empleado, equipo: '', ultimaModificacion: getTimestamp() }
          : empleado
      ));
    }
    
    // Eliminar el equipo
    setEquipos(prev => prev.filter(equipo => equipo.id !== id));
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(tarea => tarea.id !== id));
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
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backup = {
        clientes,
        empleados,
        equipos,
        tareas,
        timestamp
      };
      
      // Guardar en localStorage con nombre único
      localStorage.setItem(`backup_${timestamp}`, JSON.stringify(backup));
      
      // Mantener solo los últimos 5 backups
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
      keys.sort().reverse();
      
      if (keys.length > 5) {
        keys.slice(5).forEach(key => localStorage.removeItem(key));
      }
      
      return true;
    } catch (error) {
      console.error('Error al respaldar datos:', error);
      return false;
    }
  };

  // Función para restaurar desde un respaldo
  const restaurarDatos = () => {
    try {
      // Obtener la lista de backups disponibles
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith('backup_'))
        .sort()
        .reverse();
      
      if (keys.length === 0) {
        console.warn('No hay respaldos disponibles');
        return false;
      }
      
      // Cargar el respaldo más reciente
      const latestBackup = localStorage.getItem(keys[0]);
      if (!latestBackup) {
        console.warn('Respaldo no encontrado');
        return false;
      }
      
      const data = JSON.parse(latestBackup);
      
      // Actualizar estados
      setClientes(data.clientes || []);
      setEmpleados(data.empleados || []);
      setEquipos(data.equipos || []);
      setTareas(data.tareas || []);
      
      // Guardar en localStorage
      saveToStorage(STORAGE_KEYS.CLIENTES, data.clientes || []);
      saveToStorage(STORAGE_KEYS.EMPLEADOS, data.empleados || []);
      saveToStorage(STORAGE_KEYS.EQUIPOS, data.equipos || []);
      saveToStorage(STORAGE_KEYS.TAREAS, data.tareas || []);
      
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