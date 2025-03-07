'use client';

import { useState } from 'react';
import { useCRM } from '@/lib/contexts/CRMContext';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function EquiposPanel() {
  const {
    equipos,
    agregarEquipo,
    agregarMiembroEquipo,
    removerMiembroEquipo,
    eliminarEquipo
  } = useCRM();
  const { empleadosRegistrados, empleadosConectados, eliminarEmpleado } = useAuth();

  const [mostrarFormularioEquipo, setMostrarFormularioEquipo] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    color: '#000000',
    members: [] as string[]
  });
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string | null>(null);

  const handleSubmitEquipo = (e: React.FormEvent) => {
    e.preventDefault();
    agregarEquipo(nuevoEquipo);
    setNuevoEquipo({ nombre: '', color: '#000000', members: [] });
    setMostrarFormularioEquipo(false);
  };

  const handleAsignarEquipo = (empleadoId: string, equipoId: string) => {
    // Primero remover del equipo actual si existe
    equipos.forEach(equipo => {
      if (equipo.members.includes(empleadoId)) {
        removerMiembroEquipo(equipo.id, empleadoId);
      }
    });
    
    // Luego agregar al nuevo equipo
    if (equipoId) {
      agregarMiembroEquipo(equipoId, empleadoId);
    }
  };

  const handleEliminarEmpleado = (empleadoId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.');
    if (confirmar) {
      // Primero remover de todos los equipos
      equipos.forEach(equipo => {
        if (equipo.members.includes(empleadoId)) {
          removerMiembroEquipo(equipo.id, empleadoId);
        }
      });
      // Luego eliminar el empleado
      eliminarEmpleado(empleadoId);
    }
  };

  const handleDisolverEquipo = (equipoId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas disolver este equipo? Todos los miembros quedarán sin equipo.');
    if (confirmar) {
      // Remover todos los miembros antes de eliminar
      const equipo = equipos.find(eq => eq.id === equipoId);
      if (equipo) {
        equipo.members.forEach(empleadoId => {
          removerMiembroEquipo(equipo.id, empleadoId);
        });
        eliminarEquipo(equipoId);
      }
    }
  };

  const handleMoverEmpleados = (equipoOrigenId: string, equipoDestinoId: string) => {
    const equipoOrigen = equipos.find(eq => eq.id === equipoOrigenId);
    if (equipoOrigen && equipoDestinoId) {
      equipoOrigen.members.forEach(empleadoId => {
        removerMiembroEquipo(equipoOrigenId, empleadoId);
        agregarMiembroEquipo(equipoDestinoId, empleadoId);
      });
    }
  };

  const handleMoverEmpleado = (empleadoId: string, nuevoEquipoId: string) => {
    // Primero, encontrar y remover al empleado de su equipo actual si existe
    equipos.forEach(equipo => {
      if (equipo.members.includes(empleadoId)) {
        removerMiembroEquipo(equipo.id, empleadoId);
      }
    });
    // Luego, agregar al empleado al nuevo equipo
    agregarMiembroEquipo(nuevoEquipoId, empleadoId);
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

      {/* Mostrar todos los empleados registrados */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Empleados Registrados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleadosRegistrados.map((empleado) => {
            const estaConectado = empleadosConectados.some(e => e.id === empleado.id);
            const equipoActual = equipos.find(eq => eq.members.includes(empleado.id));
            
            return (
              <div
                key={empleado.id}
                className={`p-4 rounded-lg border ${
                  estaConectado ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      estaConectado ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="font-medium">{empleado.username}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {estaConectado ? 'En línea' : 'Desconectado'}
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
                    <button
                      onClick={() => handleEliminarEmpleado(empleado.id)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                      title="Eliminar empleado"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {equipoActual && (
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: equipoActual.color }}></span>
                      <span>Equipo: {equipoActual.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de nuevo equipo */}
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
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Nombre del equipo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color del Equipo *
                  </label>
                  <input
                    type="color"
                    required
                    value={nuevoEquipo.color}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, color: e.target.value })}
                    className="w-full p-1 border rounded-lg h-10"
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

      {/* Lista de equipos */}
      <div className="grid gap-6">
        {equipos.map((equipo) => (
          <div
            key={equipo.id}
            className="bg-white rounded-lg p-6 shadow-sm"
            style={{ borderLeft: `4px solid ${equipo.color}` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: equipo.color }}
                ></span>
                <h3 className="text-lg font-semibold text-gray-900">{equipo.nombre}</h3>
              </div>
              <button
                onClick={() => eliminarEquipo(equipo.id)}
                className="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>

            {/* Lista de miembros y selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <select
                  className="flex-1 p-2 border rounded-lg text-gray-900 bg-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMoverEmpleado(e.target.value, equipo.id);
                    }
                  }}
                  value=""
                >
                  <option value="">Agregar empleado...</option>
                  {empleadosRegistrados
                    .filter(emp => !equipos.some(eq => eq.members.includes(emp.id)))
                    .map((empleado) => (
                      <option key={empleado.id} value={empleado.id}>
                        {empleado.username}
                      </option>
                    ))}
                </select>
              </div>

              {/* Lista de miembros actuales */}
              <div className="grid gap-2">
                {equipo.members.map((memberId) => {
                  const empleado = empleadosRegistrados.find(e => e.id === memberId);
                  if (!empleado) return null;

                  return (
                    <div
                      key={memberId}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{empleado.username}</span>
                      <button
                        onClick={() => removerMiembroEquipo(equipo.id, memberId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
                {equipo.members.length === 0 && (
                  <p className="text-gray-500 text-sm">No hay miembros en este equipo</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {equipos.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay equipos creados</p>
        )}
      </div>
    </div>
  );
} 