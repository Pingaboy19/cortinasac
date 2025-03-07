'use client';

import React, { createContext, useContext, useState } from 'react';

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  necesidades?: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fecha: string;
  descripcion?: string;
  equipoId?: string;
  comision?: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

export interface CRMContextType {
  equipos: Equipo[];
  clientes: Cliente[];
  tareas: Tarea[];
  agregarCliente: (cliente: Omit<Cliente, 'id'>) => void;
  agregarTarea: (tarea: Omit<Tarea, 'id'>) => void;
  buscarClientePorNombre: (nombre: string) => Cliente[];
}

const CRMContext = createContext<CRMContextType>({
  equipos: [],
  clientes: [],
  tareas: [],
  agregarCliente: () => {},
  agregarTarea: () => {},
  buscarClientePorNombre: () => []
});

export function useCRM() {
  return useContext(CRMContext);
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  // Datos de ejemplo para desarrollo
  const [equipos] = useState<Equipo[]>([
    {
      id: '1',
      nombre: 'Equipo A',
      members: ['1', '2', '3']
    },
    {
      id: '2',
      nombre: 'Equipo B',
      members: ['4', '5', '6']
    }
  ]);

  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Cliente A',
      telefono: '123456789',
      direccion: 'Dirección A',
      necesidades: 'Necesidades A'
    },
    {
      id: '2',
      nombre: 'Cliente B',
      telefono: '987654321',
      direccion: 'Dirección B',
      necesidades: 'Necesidades B'
    }
  ]);

  const [tareas, setTareas] = useState<Tarea[]>([
    {
      id: '1',
      titulo: 'Tarea A',
      estado: 'pendiente',
      fecha: '2024-03-15',
      descripcion: 'Descripción A',
      equipoId: '1',
      comision: 1
    },
    {
      id: '2',
      titulo: 'Tarea B',
      estado: 'completada',
      fecha: '2024-03-16',
      descripcion: 'Descripción B',
      equipoId: '2',
      comision: 2
    }
  ]);

  const agregarCliente = (cliente: Omit<Cliente, 'id'>) => {
    const nuevoCliente = {
      ...cliente,
      id: Math.random().toString(36).substr(2, 9)
    };
    setClientes(prev => [...prev, nuevoCliente]);
  };

  const agregarTarea = (tarea: Omit<Tarea, 'id'>) => {
    const nuevaTarea = {
      ...tarea,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTareas(prev => [...prev, nuevaTarea]);
  };

  const buscarClientePorNombre = (nombre: string) => {
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  };

  return (
    <CRMContext.Provider value={{
      equipos,
      clientes,
      tareas,
      agregarCliente,
      agregarTarea,
      buscarClientePorNombre
    }}>
      {children}
    </CRMContext.Provider>
  );
} 