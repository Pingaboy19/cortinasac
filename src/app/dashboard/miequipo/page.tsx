'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import Sidebar from '@/components/ui/Sidebar';

interface Equipo {
  id: string;
  nombre: string;
  color: string;
  miembros: string[];
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
  equipo: string;
  comision: number;
  ultimaComision: string;
}

export default function MiEquipoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { equipos, empleados } = useCRM();
  const [miEquipo, setMiEquipo] = useState<Equipo | null>(null);
  const [miembrosEquipo, setMiembrosEquipo] = useState<Empleado[]>([]);
  const [seccionActiva, setSeccionActiva] = useState('miequipo');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Encontrar el equipo del empleado
    const equipoEncontrado = equipos.find((equipo: Equipo) =>
      equipo.miembros.includes(user.id)
    );

    if (equipoEncontrado) {
      setMiEquipo(equipoEncontrado);
      
      // Encontrar los empleados que son miembros del equipo
      const miembros = empleados.filter((empleado: Empleado) =>
        equipoEncontrado.miembros.includes(empleado.id)
      );
      setMiembrosEquipo(miembros);
    }
  }, [user, equipos, empleados, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={user.role === 'admin'}
        username={user.username}
        seccionActiva={seccionActiva}
        onCambiarSeccion={(seccion) => {
          setSeccionActiva(seccion);
          router.push(`/dashboard/${seccion}`);
        }}
      />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Equipo</h1>
        
        {miEquipo ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: miEquipo.color }}
              />
              <h2 className="text-2xl font-semibold text-gray-900">
                {miEquipo.nombre}
              </h2>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900">
                Miembros del Equipo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {miembrosEquipo.map((miembro) => (
                  <div 
                    key={miembro.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-medium">
                        {miembro.nombre[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {miembro.nombre}
                        {miembro.id === user.id && ' (Tú)'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {miembro.rol === 'admin' ? 'Administrador' : 'Empleado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              No estás asignado a ningún equipo actualmente.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 