'use client';

import React, { createContext, useContext } from 'react';

export interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

export interface Empleado {
  id: string;
  nombre: string;
  role: string;
}

interface CRMContextType {
  equipos: Equipo[];
  empleados: Empleado[];
}

const CRMContext = createContext<CRMContextType>({
  equipos: [
    { id: '1', nombre: 'Equipo A', members: ['1', '2'] },
    { id: '2', nombre: 'Equipo B', members: [] }
  ],
  empleados: [
    { id: '1', nombre: 'Empleado A', role: 'empleado' },
    { id: '2', nombre: 'Empleado B', role: 'empleado' },
    { id: '3', nombre: 'Admin', role: 'admin' }
  ]
});

export function useCRM() {
  return useContext(CRMContext);
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const value = {
    equipos: [
      { id: '1', nombre: 'Equipo A', members: ['1', '2'] },
      { id: '2', nombre: 'Equipo B', members: [] }
    ],
    empleados: [
      { id: '1', nombre: 'Empleado A', role: 'empleado' },
      { id: '2', nombre: 'Empleado B', role: 'empleado' },
      { id: '3', nombre: 'Admin', role: 'admin' }
    ]
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
} 