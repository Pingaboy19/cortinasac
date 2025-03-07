'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useCRM } from '@/lib/contexts/CRMContext';
import { useState } from 'react';

export default function EmpleadosPanel() {
  const { empleadosRegistrados, eliminarEmpleado } = useAuth();
  const { equipos } = useCRM();

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleEliminarEmpleado = (empleadoId: string) => {
    eliminarEmpleado(empleadoId);
    setShowConfirmDelete(null);
  };

  const getEquipoNombre = (equipoId?: string) => {
    if (!equipoId) return 'Sin equipo';
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Sin equipo';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
        <p className="text-gray-600">Administra los empleados de CortinasAC</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empleadosRegistrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-[#E31E24] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {empleado.username[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {empleado.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {getEquipoNombre(empleado.equipoId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      empleado.isConnected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {empleado.isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {showConfirmDelete === empleado.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEliminarEmpleado(empleado.id)}
                          className="text-white bg-[#E31E24] hover:bg-[#C41A1F] px-3 py-1 rounded-md transition-colors duration-200"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(null)}
                          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmDelete(empleado.id)}
                        className="text-[#E31E24] hover:text-[#C41A1F] font-medium transition-colors duration-200"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {empleadosRegistrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay empleados registrados</p>
          </div>
        )}
      </div>
    </div>
  );
} 