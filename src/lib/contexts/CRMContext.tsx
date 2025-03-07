'use client';

import React, { createContext, useContext, useState } from 'react';

interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

interface CRMContextType {
  equipos: Equipo[];
}

const CRMContext = createContext<CRMContextType>({
  equipos: [],
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

  return (
    <CRMContext.Provider value={{
      equipos,
    }}>
      {children}
    </CRMContext.Provider>
  );
} 