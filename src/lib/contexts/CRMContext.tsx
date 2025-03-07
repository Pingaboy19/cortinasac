'use client';

import React, { createContext, useContext, useState } from 'react';

interface Cliente {
  id: string;
  nombre: string;
}

interface Tarea {
  id: string;
  titulo: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fecha: string;
}

interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

interface CRMContextType {
  equipos: Equipo[];
  clientes: Cliente[];
  tareas: Tarea[];
}

const CRMContext = createContext<CRMContextType>({
  equipos: [],
  clientes: [],
  tareas: []
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

  const [clientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Cliente A'
    },
    {
      id: '2',
      nombre: 'Cliente B'
    }
  ]);

  const [tareas] = useState<Tarea[]>([
    {
      id: '1',
      titulo: 'Tarea A',
      estado: 'pendiente',
      fecha: '2024-03-15'
    },
    {
      id: '2',
      titulo: 'Tarea B',
      estado: 'completada',
      fecha: '2024-03-16'
    }
  ]);

  return (
    <CRMContext.Provider value={{
      equipos,
      clientes,
      tareas
    }}>
      {children}
    </CRMContext.Provider>
  );
} 