'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

export function CRMProvider({ children }: { children: ReactNode }) {
  // Datos de ejemplo
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
    <CRMContext.Provider value={{ equipos }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => useContext(CRMContext); 