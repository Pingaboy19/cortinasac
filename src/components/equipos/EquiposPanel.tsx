'use client';

import { useState } from 'react';
import { useCRM } from '@/lib/contexts/CRMContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function EquiposPanel() {
  const {
    equipos,
    empleados,
    agregarEquipo,
    agregarMiembroEquipo,
    removerMiembroEquipo,
    eliminarEquipo
  } = useCRM();
  const { user } = useAuth();

  const [mostrarFormularioEquipo, setMostrarFormularioEquipo] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    members: [] as string[]
  });

  const handleSubmitEquipo = (e: React.FormEvent) => {
    e.preventDefault();
    agregarEquipo(nuevoEquipo);
    setNuevoEquipo({ nombre: '', members: [] });
    setMostrarFormularioEquipo(false);
  };

  const handleAsignarEquipo = (empleadoId: string, equipoId: string) => {
    equipos.forEach(equipo => {
      if (equipo.members.includes(empleadoId)) {
        removerMiembroEquipo(equipo.id, empleadoId);
      }
    });
    
    if (equipoId) {
      agregarMiembroEquipo(equipoId, empleadoId);
    }
  };

  const handleDisolverEquipo = (equipoId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas disolver este equipo? Todos los miembros quedarán sin equipo.');
    if (confirmar) {
      const equipo = equipos.find(eq => eq.id === equipoId);
      if (equipo) {
        equipo.members.forEach(empleadoId => {
          removerMiembroEquipo(equipo.id, empleadoId);
        });
        eliminarEquipo(equipoId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Equipos</h2>
        <button
          onClick={() => setMostrarFormularioEquipo(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Equipo
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Empleados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleados.map((empleado) => {
            const equipoActual = equipos.find(eq => eq.members.includes(empleado.id));
            
            return (
              <div
                key={empleado.id}
                className="p-4 rounded-lg border bg-gray-50 border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{empleado.nombre}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {empleado.role}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <select
                      value={equipoActual?.id || ''}
                      onChange={(e) => handleAsignarEquipo(empleado.id, e.target.value)}
                      className="flex-1 text-sm border rounded p-2"
                    >
                      <option value="">Sin equipo</option>
                      {equipos.map((equipo) => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {equipoActual && (
                    <div className="text-sm text-gray-600">
                      <span>Equipo: {equipoActual.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mostrarFormularioEquipo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Nuevo Equipo</h3>
                <button
                  onClick={() => setMostrarFormularioEquipo(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitEquipo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoEquipo.nombre}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, nombre: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del equipo"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioEquipo(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Crear Equipo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {equipos.map((equipo) => (
          <div
            key={equipo.id}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{equipo.nombre}</h3>
                <p className="text-gray-600">
                  {equipo.members.length} miembros
                </p>
              </div>
              <button
                onClick={() => handleDisolverEquipo(equipo.id)}
                className="text-red-600 hover:text-red-800"
              >
                Disolver Equipo
              </button>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Miembros:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipo.members.map(memberId => {
                  const empleado = empleados.find(e => e.id === memberId);
                  return empleado ? (
                    <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{empleado.nombre}</span>
                      <button
                        onClick={() => handleAsignarEquipo(memberId, '')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 