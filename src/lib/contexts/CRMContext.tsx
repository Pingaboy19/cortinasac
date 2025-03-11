'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { saveData, loadData, setupStorageListener } from '../services/syncService';

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  necesidades?: string;
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
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
  miembros: string[]; // IDs de los empleados en el equipo
  fechaCreacion: string;
  ultimaModificacion: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  asignadoA: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  comision: number;
  observaciones: string;
  montoCobrado?: number;
  metodoPago?: 'efectivo' | 'tarjeta';
}

export interface CRMContextType {
  clientes: Cliente[];
  empleados: Empleado[];
  equipos: Equipo[];
  tareas: Tarea[];
  agregarCliente: (cliente: Cliente) => void;
  actualizarCliente: (id: string, cliente: Cliente) => void;
  eliminarCliente: (id: string) => void;
  agregarEquipo: (equipo: Equipo) => void;
  actualizarEquipo: (id: string, equipo: Equipo) => void;
  eliminarEquipo: (id: string) => void;
  agregarEmpleado: (empleado: Empleado) => void;
  actualizarEmpleado: (id: string, empleado: Empleado) => void;
  eliminarEmpleado: (id: string) => void;
  agregarTarea: (tarea: Tarea) => void;
  actualizarTarea: (id: string, tarea: Tarea) => void;
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

// Proveedor del contexto
export function CRMProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncInitialized, setSyncInitialized] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = () => {
      try {
        // Cargar datos desde localStorage a través del servicio de sincronización
        const clientesData = loadData(STORAGE_KEYS.CLIENTES) || [];
        const empleadosData = loadData(STORAGE_KEYS.EMPLEADOS) || [];
        const equiposData = loadData(STORAGE_KEYS.EQUIPOS) || [];
        const tareasData = loadData(STORAGE_KEYS.TAREAS) || [];
        
        // Actualizar estados
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setEmpleados(Array.isArray(empleadosData) ? empleadosData : []);
        setEquipos(Array.isArray(equiposData) ? equiposData : []);
        
        // Actualizar estado de tareas (mover vencidas a pendientes)
        const hoy = new Date().toISOString().split('T')[0];
        const tareasActualizadas = Array.isArray(tareasData) 
          ? tareasData.map((tarea: Tarea) => {
              if (tarea.estado === 'pendiente' && tarea.fechaVencimiento < hoy) {
                return { ...tarea, fechaVencimiento: hoy, ultimaModificacion: getTimestamp() };
              }
              return tarea;
            })
          : [];
        
        setTareas(tareasActualizadas);
        
        // Si se actualizaron las tareas, guardar los cambios
        if (JSON.stringify(tareasData) !== JSON.stringify(tareasActualizadas)) {
          saveData(STORAGE_KEYS.TAREAS, tareasActualizadas);
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
    const removeStorageListener = setupStorageListener((key, newData) => {
      // Actualizar estado según la clave
      switch (key) {
        case STORAGE_KEYS.CLIENTES:
          setClientes(newData);
          break;
        case STORAGE_KEYS.EMPLEADOS:
          setEmpleados(newData);
          break;
        case STORAGE_KEYS.EQUIPOS:
          setEquipos(newData);
          break;
        case STORAGE_KEYS.TAREAS:
          setTareas(newData);
          break;
      }
    });
    
    // Configurar sincronización periódica
    const stopPeriodicSync = setupStorageListener((key, newData) => {
      // Actualizar estado según la clave
      switch (key) {
        case STORAGE_KEYS.CLIENTES:
          setClientes(newData);
          break;
        case STORAGE_KEYS.EMPLEADOS:
          setEmpleados(newData);
          break;
        case STORAGE_KEYS.EQUIPOS:
          setEquipos(newData);
          break;
        case STORAGE_KEYS.TAREAS:
          setTareas(newData);
          break;
      }
    });
    
    // Configurar listener para eventos personalizados
    const handleDataUpdated = (event: CustomEvent) => {
      const { key, timestamp } = event.detail;
      console.log(`Evento de actualización recibido para ${key} con timestamp ${timestamp}`);
    };
    
    window.addEventListener('data-updated', handleDataUpdated as EventListener);
    
    setSyncInitialized(true);
    
    // Limpiar listeners al desmontar
    return () => {
      removeStorageListener();
      stopPeriodicSync();
      window.removeEventListener('data-updated', handleDataUpdated as EventListener);
    };
  }, [dataLoaded, syncInitialized]);

  // Configurar intervalo para verificar y actualizar tareas pendientes
  useEffect(() => {
    if (!dataLoaded) return;
    
    const interval = setInterval(() => {
      const hoy = new Date().toISOString().split('T')[0];
      setTareas(prevTareas => {
        const tareasActualizadas = prevTareas.map(tarea => {
          if (tarea.estado === 'pendiente' && tarea.fechaVencimiento < hoy) {
            return { ...tarea, fechaVencimiento: hoy, ultimaModificacion: getTimestamp() };
          }
          return tarea;
        });
        
        // Guardar solo si hay cambios
        if (JSON.stringify(prevTareas) !== JSON.stringify(tareasActualizadas)) {
          saveData(STORAGE_KEYS.TAREAS, tareasActualizadas);
        }
        
        return tareasActualizadas;
      });
    }, 3600000); // Verificar cada hora
    
    return () => clearInterval(interval);
  }, [dataLoaded]);

  // Funciones para manipular datos
  const agregarCliente = (cliente: Cliente) => {
    const timestamp = getTimestamp();
    const nuevoCliente: Cliente = {
      ...cliente,
      id: `cliente_${Date.now()}`,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosClientes = [...clientes, nuevoCliente];
    setClientes(nuevosClientes);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.CLIENTES, nuevosClientes);
  };

  const actualizarCliente = (id: string, cliente: Cliente) => {
    const nuevosClientes = clientes.map(c => c.id === id ? cliente : c);
    setClientes(nuevosClientes);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.CLIENTES, nuevosClientes);
  };

  const eliminarCliente = (id: string) => {
    const nuevosClientes = clientes.filter(c => c.id !== id);
    setClientes(nuevosClientes);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.CLIENTES, nuevosClientes);
  };

  const agregarEmpleado = (empleado: Empleado) => {
    const timestamp = getTimestamp();
    const nuevoEmpleado: Empleado = {
      ...empleado,
      id: `empleado_${Date.now()}`,
      ultimaComision: timestamp,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosEmpleados = [...empleados, nuevoEmpleado];
    setEmpleados(nuevosEmpleados);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
  };

  const actualizarEmpleado = (id: string, empleado: Empleado) => {
    const nuevosEmpleados = empleados.map(e => e.id === id ? empleado : e);
    setEmpleados(nuevosEmpleados);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
  };

  const eliminarEmpleado = (id: string) => {
    const nuevosEmpleados = empleados.filter(e => e.id !== id);
    setEmpleados(nuevosEmpleados);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
  };

  const agregarEquipo = (equipo: Equipo) => {
    const timestamp = getTimestamp();
    const nuevoEquipo: Equipo = {
      ...equipo,
      id: `equipo_${Date.now()}`,
      fechaCreacion: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevosEquipos = [...equipos, nuevoEquipo];
    setEquipos(nuevosEquipos);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
  };

  const actualizarEquipo = (id: string, equipo: Equipo) => {
    const nuevosEquipos = equipos.map(e => e.id === id ? equipo : e);
    setEquipos(nuevosEquipos);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
  };

  const eliminarEquipo = (id: string) => {
    // Obtener miembros del equipo antes de eliminarlo
    const equipo = equipos.find(eq => eq.id === id);
    if (equipo) {
      // Actualizar empleados para quitar la referencia al equipo eliminado
      const nuevosEmpleados = empleados.map(empleado => 
        equipo.miembros.includes(empleado.id)
          ? { ...empleado, equipo: '', ultimaModificacion: getTimestamp() }
          : empleado
      );
      
      setEmpleados(nuevosEmpleados);
      
      // Guardar con sincronización
      saveData(STORAGE_KEYS.EMPLEADOS, nuevosEmpleados);
    }
    
    // Eliminar el equipo
    const nuevosEquipos = equipos.filter(equipo => equipo.id !== id);
    setEquipos(nuevosEquipos);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
  };

  const agregarTarea = (tarea: Tarea) => {
    const timestamp = getTimestamp();
    const nuevaTarea: Tarea = {
      ...tarea,
      id: `tarea_${Date.now()}`,
      estado: 'pendiente',
      observaciones: '',
      fechaCreacion: timestamp,
      fechaVencimiento: timestamp,
      ultimaModificacion: timestamp
    };
    
    const nuevasTareas = [...tareas, nuevaTarea];
    setTareas(nuevasTareas);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.TAREAS, nuevasTareas);
  };

  const actualizarTarea = (id: string, tarea: Tarea) => {
    const nuevasTareas = tareas.map(t => t.id === id ? tarea : t);
    setTareas(nuevasTareas);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.TAREAS, nuevasTareas);
  };

  const eliminarTarea = (id: string) => {
    const nuevasTareas = tareas.filter(t => t.id !== id);
    setTareas(nuevasTareas);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.TAREAS, nuevasTareas);
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
      eq.id !== equipoId && eq.miembros.includes(empleadoId)
    );
    
    let nuevosEquipos = [...equipos];
    
    if (equipoActual) {
      // Remover del equipo actual
      nuevosEquipos = nuevosEquipos.map(eq => 
        eq.id === equipoActual.id
          ? { 
              ...eq, 
              miembros: eq.miembros.filter(id => id !== empleadoId),
              ultimaModificacion: getTimestamp()
            }
          : eq
      );
    }
    
    // Agregar al nuevo equipo
    nuevosEquipos = nuevosEquipos.map(eq => 
      eq.id === equipoId
        ? { 
            ...eq, 
            miembros: [...eq.miembros, empleadoId],
            ultimaModificacion: getTimestamp()
          }
        : eq
    );
    
    setEquipos(nuevosEquipos);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
    
    // Actualizar el empleado
    actualizarEmpleado(empleadoId, { equipo: equipoId });
  };

  const removerMiembroEquipo = (equipoId: string, empleadoId: string) => {
    const nuevosEquipos = equipos.map(eq => 
      eq.id === equipoId
        ? { 
            ...eq, 
            miembros: eq.miembros.filter(id => id !== empleadoId),
            ultimaModificacion: getTimestamp()
          }
        : eq
    );
    
    setEquipos(nuevosEquipos);
    
    // Guardar con sincronización
    saveData(STORAGE_KEYS.EQUIPOS, nuevosEquipos);
    
    // Actualizar el empleado
    actualizarEmpleado(empleadoId, { equipo: '' });
  };

  const obtenerMiembrosEquipo = (equipoId: string) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.miembros : [];
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
      
      // Guardar con sincronización
      saveData(`${STORAGE_KEYS.BACKUP}_${timestamp}`, backup);
      
      // Mantener solo los últimos 5 backups
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.BACKUP}_`))
        .sort()
        .reverse();
      
      if (keys.length > 5) {
        keys.slice(5).forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error al respaldar datos:', error);
    }
  };

  // Función para restaurar desde un respaldo
  const restaurarDatos = () => {
    try {
      // Obtener la lista de backups disponibles
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.BACKUP}_`))
        .sort()
        .reverse();
      
      if (keys.length === 0) {
        console.warn('No hay respaldos disponibles');
        return;
      }
      
      // Cargar el respaldo más reciente
      const latestBackupData = loadData(keys[0]);
      if (!latestBackupData) {
        console.warn('Respaldo no encontrado');
        return;
      }
      
      // Actualizar estados
      setClientes(latestBackupData.clientes || []);
      setEmpleados(latestBackupData.empleados || []);
      setEquipos(latestBackupData.equipos || []);
      setTareas(latestBackupData.tareas || []);
      
      // Guardar con sincronización
      saveData(STORAGE_KEYS.CLIENTES, latestBackupData.clientes || []);
      saveData(STORAGE_KEYS.EMPLEADOS, latestBackupData.empleados || []);
      saveData(STORAGE_KEYS.EQUIPOS, latestBackupData.equipos || []);
      saveData(STORAGE_KEYS.TAREAS, latestBackupData.tareas || []);
    } catch (error) {
      console.error('Error al restaurar datos:', error);
    }
  };

  const value = {
    clientes,
    empleados,
    equipos,
    tareas,
    agregarCliente,
    actualizarCliente,
    eliminarCliente,
    agregarEquipo,
    actualizarEquipo,
    eliminarEquipo,
    agregarEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    agregarTarea,
    actualizarTarea,
    eliminarTarea,
    buscarClientePorNombre,
    agregarMiembroEquipo,
    removerMiembroEquipo,
    obtenerMiembrosEquipo,
    respaldarDatos,
    restaurarDatos
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM debe ser usado dentro de un CRMProvider');
  }
  return context;
};

export default CRMContext; 