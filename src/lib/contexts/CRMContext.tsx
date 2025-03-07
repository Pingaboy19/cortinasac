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

interface CRMContextType {
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

const CRMContext = createContext<CRMContextType | null>(null);

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
    localStorage.setItem(key, JSON.stringify(data));
    // Crear backup automático
    localStorage.setItem(`${key}_backup`, JSON.stringify(data));
  } catch (error: any) {
    console.error(`Error al guardar datos en ${key}:`, error);
    // Intentar limpiar localStorage si está lleno
    if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014) {
      try {
        // Mantener solo los datos esenciales
        Object.keys(localStorage).forEach(key => {
          if (!key.startsWith('crm_')) {
            localStorage.removeItem(key);
          }
        });
        // Intentar guardar nuevamente
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('No se pudo liberar espacio en localStorage');
      }
    }
  }
};

// Función para cargar datos de localStorage con respaldo
const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    // Si no hay datos, intentar cargar el backup
    const backup = localStorage.getItem(`${key}_backup`);
    if (backup) {
      return JSON.parse(backup);
    }
    return null;
  } catch (error) {
    console.error(`Error al cargar datos de ${key}:`, error);
    // Intentar cargar el backup en caso de error
    try {
      const backup = localStorage.getItem(`${key}_backup`);
      if (backup) {
        return JSON.parse(backup);
      }
    } catch (e) {
      console.error(`Error al cargar backup de ${key}:`, e);
    }
    return null;
  }
};

export function CRMProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = () => {
      const storedClientes = loadFromStorage(STORAGE_KEYS.CLIENTES);
      const storedEmpleados = loadFromStorage(STORAGE_KEYS.EMPLEADOS);
      const storedEquipos = loadFromStorage(STORAGE_KEYS.EQUIPOS);
      const storedTareas = loadFromStorage(STORAGE_KEYS.TAREAS);

      if (storedClientes) setClientes(storedClientes);
      if (storedEmpleados) setEmpleados(storedEmpleados);
      if (storedEquipos) setEquipos(storedEquipos);
      if (storedTareas) setTareas(storedTareas);
    };

    loadData();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
  }, [clientes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EMPLEADOS, empleados);
  }, [empleados]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EQUIPOS, equipos);
  }, [equipos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TAREAS, tareas);
  }, [tareas]);

  // Crear respaldo automático cada hora
  useEffect(() => {
    const backupInterval = setInterval(() => {
      const backup = {
        clientes,
        empleados,
        equipos,
        tareas,
        timestamp: getTimestamp()
      };
      saveToStorage(STORAGE_KEYS.BACKUP, backup);
    }, 3600000); // 1 hora

    return () => clearInterval(backupInterval);
  }, [clientes, empleados, equipos, tareas]);

  // Verificar y resetear comisiones cada 30 días
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      empleados.forEach(empleado => {
        const ultimaComision = new Date(empleado.ultimaComision || empleado.fechaCreacion);
        const diasTranscurridos = Math.floor((ahora.getTime() - ultimaComision.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasTranscurridos >= 30) {
          actualizarEmpleado(empleado.id, {
            comision: 0,
            ultimaComision: ahora.toISOString()
          });
        }
      });
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [empleados]);

  const agregarCliente = (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoCliente = {
      ...cliente,
      id: `cliente_${Date.now()}`,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setClientes(prev => [...prev, nuevoCliente]);
  };

  const agregarEmpleado = (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => {
    const timestamp = getTimestamp();
    const nuevoEmpleado = {
      ...empleado,
      id: `empleado_${Date.now()}`,
      comision: 0,
      ultimaComision: timestamp,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    setEmpleados(prev => [...prev, nuevoEmpleado]);
  };

  const agregarEquipo = (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    const timestamp = getTimestamp();
    const nuevoEquipo = {
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
    setEmpleados(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...datos, ultimaModificacion: getTimestamp() } : emp
    ));
  };

  const actualizarTarea = (id: string, datos: Partial<Tarea>) => {
    setTareas(prev => prev.map(tarea => {
      if (tarea.id === id) {
        const tareaActualizada = { ...tarea, ...datos, ultimaModificacion: getTimestamp() };
        
        // Si la tarea se completó, actualizar la comisión del empleado
        if (datos.estado === 'completada' && tarea.estado !== 'completada') {
          const equipo = equipos.find(eq => eq.id === tarea.equipoId);
          if (equipo) {
            equipo.members.forEach(empleadoId => {
              const empleado = empleados.find(emp => emp.id === empleadoId);
              if (empleado) {
                actualizarEmpleado(empleadoId, {
                  comision: 1,
                  ultimaComision: getTimestamp()
                });
              }
            });
          }
        }
        
        return tareaActualizada;
      }
      return tarea;
    }));
  };

  const eliminarEquipo = (id: string) => {
    // Marcar tareas del equipo como vencidas
    setTareas(prev => prev.map(tarea => 
      tarea.equipoId === id ? { ...tarea, estado: 'vencida', ultimaModificacion: getTimestamp() } : tarea
    ));
    
    // Eliminar equipo
    setEquipos(prev => prev.filter(eq => eq.id !== id));
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(tarea => tarea.id !== id));
  };

  const buscarClientePorNombre = (nombre: string) => {
    const termino = nombre.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(termino)
    );
  };

  const agregarMiembroEquipo = (equipoId: string, empleadoId: string) => {
    setEquipos(prev => prev.map(equipo => {
      if (equipo.id === equipoId && !equipo.members.includes(empleadoId)) {
        return {
          ...equipo,
          members: [...equipo.members, empleadoId],
          ultimaModificacion: getTimestamp()
        };
      }
      return equipo;
    }));
  };

  const removerMiembroEquipo = (equipoId: string, empleadoId: string) => {
    setEquipos(prev => prev.map(equipo => {
      if (equipo.id === equipoId) {
        return {
          ...equipo,
          members: equipo.members.filter(id => id !== empleadoId),
          ultimaModificacion: getTimestamp()
        };
      }
      return equipo;
    }));
  };

  const obtenerMiembrosEquipo = (equipoId: string) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.members : [];
  };

  // Función para crear respaldo manual
  const respaldarDatos = () => {
    const backup = {
      clientes,
      empleados,
      equipos,
      tareas,
      timestamp: getTimestamp()
    };
    saveToStorage(STORAGE_KEYS.BACKUP, backup);
  };

  // Función para restaurar desde respaldo
  const restaurarDatos = () => {
    try {
      const backup = loadFromStorage(STORAGE_KEYS.BACKUP);
      if (backup) {
        setClientes(backup.clientes);
        setEmpleados(backup.empleados);
        setEquipos(backup.equipos);
        setTareas(backup.tareas);
      }
    } catch (error) {
      console.error('Error al restaurar datos:', error);
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
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM debe ser usado dentro de un CRMProvider');
  }
  return context;
} 