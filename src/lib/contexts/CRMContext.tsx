'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase/firebaseConfig';
import { collection, onSnapshot, query, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Member {
  id: string;
  username: string;
  comision: number;
}

interface Team {
  id: string;
  nombre: string;
  members: Member[];
}

interface Task {
  id: string;
  equipoId: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  fechaVencimiento: string;
  monto: number;
  titulo: string;
  descripcion: string;
}

interface CRMContextType {
  equipos: Team[];
  tareas: Task[];
  actualizarEquipos: () => void;
  actualizarTareas: () => void;
}

const CRMContext = createContext<CRMContextType>({
  equipos: [],
  tareas: [],
  actualizarEquipos: () => {},
  actualizarTareas: () => {},
});

export function CRMProvider({ children }: { children: ReactNode }) {
  const [equipos, setEquipos] = useState<Team[]>([]);
  const [tareas, setTareas] = useState<Task[]>([]);

  const actualizarEquipos = () => {
    const q = query(collection(db, 'equipos'));
    onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const equiposData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
      setEquipos(equiposData);
    });
  };

  const actualizarTareas = () => {
    const q = query(collection(db, 'tareas'));
    onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tareasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTareas(tareasData);
    });
  };

  useEffect(() => {
    actualizarEquipos();
    actualizarTareas();
  }, []);

  return (
    <CRMContext.Provider value={{ equipos, tareas, actualizarEquipos, actualizarTareas }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => useContext(CRMContext); 