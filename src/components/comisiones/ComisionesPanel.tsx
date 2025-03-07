'use client';

import { useCRM } from '@/lib/contexts/CRMContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ComisionesPanel() {
  const { empleados, tareas, equipos } = useCRM();
  const { empleadosRegistrados } = useAuth();

  // Obtener tareas completadas y calcular comisiones
  const obtenerTareasCompletadas = (empleadoId: string) => {
    return tareas.filter(tarea => {
      const equipo = equipos.find(eq => eq.id === tarea.equipoId);
      return equipo?.members.includes(empleadoId) && tarea.estado === 'completada';
    });
  };

  // Calcular comisión total
  const calcularComisionTotal = (montoCobrado: number) => {
    return (montoCobrado * 0.01); // 1% de comisión
  };

  // Calcular monto total (monto + comisión)
  const calcularMontoTotal = (montoCobrado: number) => {
    const comision = calcularComisionTotal(montoCobrado);
    return montoCobrado + comision;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">💰 Comisiones de Empleados</h2>
      
      <div className="grid gap-6">
        {empleadosRegistrados.map(empleado => {
          const empleadoInfo = empleados.find(emp => emp.id === empleado.id);
          const tareasCompletadas = obtenerTareasCompletadas(empleado.id);
          const comisionActual = empleadoInfo?.comision || 0;
          
          return (
            <div key={empleado.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{empleado.username}</h3>
                  <p className="text-sm text-gray-500">
                    Comisión actual: {comisionActual}%
                  </p>
                </div>
              </div>

              {tareasCompletadas.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Tareas Completadas:</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarea</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comisión (1%)</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tareasCompletadas.map(tarea => {
                          const montoCobrado = tarea.montoCobrado || 0;
                          const comision = calcularComisionTotal(montoCobrado);
                          const total = calcularMontoTotal(montoCobrado);
                          return (
                            <tr key={tarea.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{tarea.titulo}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(tarea.fecha).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">
                                ${montoCobrado} UYU
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-green-600">
                                ${comision.toFixed(2)} UYU
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                                ${total.toFixed(2)} UYU
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 font-medium">
                          <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">Total</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            ${tareasCompletadas.reduce((sum, tarea) => sum + (tarea.montoCobrado || 0), 0)} UYU
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">
                            ${tareasCompletadas
                              .reduce((sum, tarea) => sum + calcularComisionTotal(tarea.montoCobrado || 0), 0)
                              .toFixed(2)} UYU
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-blue-600 font-bold">
                            ${tareasCompletadas
                              .reduce((sum, tarea) => sum + calcularMontoTotal(tarea.montoCobrado || 0), 0)
                              .toFixed(2)} UYU
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay tareas completadas</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 