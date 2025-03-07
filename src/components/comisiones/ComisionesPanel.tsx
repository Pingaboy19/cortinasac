'use client';

import { useCRM } from '@/lib/contexts/CRMContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ComisionesPanel() {
  const { empleados, tareas, equipos } = useCRM();
  const { user } = useAuth();

  // Calcular comisiones por empleado
  const comisionesPorEmpleado = empleados.map(empleado => {
    const tareasCompletadas = tareas.filter(tarea => {
      const equipo = equipos.find(e => e.id === tarea.equipoId);
      return equipo?.members.includes(empleado.id) && tarea.estado === 'completada';
    });

    const totalComisiones = tareasCompletadas.reduce((total, tarea) => total + (tarea.comision || 0), 0);

    return {
      empleado,
      tareasCompletadas: tareasCompletadas.length,
      totalComisiones
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">💰 Comisiones de Empleados</h2>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {comisionesPorEmpleado.map(({ empleado, tareasCompletadas, totalComisiones }) => (
              <div key={empleado.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{empleado.nombre}</h3>
                    <p className="text-gray-600">
                      Tareas completadas: {tareasCompletadas}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {totalComisiones}% en comisiones
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 