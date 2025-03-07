'use client';

import { useState } from 'react';
import { useCRM } from '@/lib/contexts/CRMContext';
import type { Cliente, Tarea } from '@/lib/contexts/CRMContext';

type NuevoCliente = Omit<Cliente, 'id'>;
type NuevaTarea = Omit<Tarea, 'id'>;

export default function ClientesPanel() {
  const { clientes, equipos, agregarCliente, agregarTarea, buscarClientePorNombre } = useCRM();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<NuevoCliente>({
    nombre: '',
    telefono: '',
    direccion: '',
    necesidades: ''
  });
  const [nuevaTarea, setNuevaTarea] = useState<NuevaTarea>({
    titulo: '',
    estado: 'pendiente',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    equipoId: '',
    comision: 1
  });
  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false);
  const [clienteActual, setClienteActual] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agregarCliente(nuevoCliente);
    setClienteActual(nuevoCliente.nombre);
    setMostrarFormularioTarea(true);
    setNuevoCliente({
      nombre: '',
      telefono: '',
      direccion: '',
      necesidades: ''
    });
    setMostrarFormulario(false);
  };

  const handleSubmitTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteActual) return;

    agregarTarea({
      titulo: `Tarea para ${clienteActual}`,
      estado: 'pendiente',
      fecha: nuevaTarea.fecha,
      descripcion: nuevaTarea.descripcion,
      equipoId: nuevaTarea.equipoId,
      comision: nuevaTarea.comision
    });
    
    setNuevaTarea({
      titulo: '',
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      equipoId: '',
      comision: 1
    });
    setMostrarFormularioTarea(false);
    setClienteActual(null);
  };

  const clientesFiltrados = buscarClientePorNombre(busqueda);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Clientes</h2>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 border rounded-lg mb-6"
        />

        <div className="grid grid-cols-1 gap-4">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{cliente.nombre}</h3>
              {cliente.telefono && (
                <p className="text-gray-600">📞 {cliente.telefono}</p>
              )}
              {cliente.direccion && (
                <p className="text-gray-600">📍 {cliente.direccion}</p>
              )}
              {cliente.necesidades && (
                <p className="text-gray-600">📝 {cliente.necesidades}</p>
              )}
              <button
                onClick={() => {
                  setClienteActual(cliente.nombre);
                  setMostrarFormularioTarea(true);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Asignar Tarea
              </button>
            </div>
          ))}
        </div>

        {/* Modal de nuevo cliente */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Nuevo Cliente</h3>
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCliente.nombre}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={nuevoCliente.telefono}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={nuevoCliente.direccion}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Dirección"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Necesidades
                    </label>
                    <textarea
                      value={nuevoCliente.necesidades}
                      onChange={(e) => setNuevoCliente({ ...nuevoCliente, necesidades: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Necesidades específicas"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Guardar Cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de nueva tarea */}
        {mostrarFormularioTarea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Asignar tarea para {clienteActual}
                  </h3>
                  <button
                    onClick={() => {
                      setMostrarFormularioTarea(false);
                      setClienteActual(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitTarea} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipo
                    </label>
                    <select
                      value={nuevaTarea.equipoId}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, equipoId: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar equipo...</option>
                      {equipos.map((equipo) => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={nuevaTarea.fecha}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={nuevaTarea.descripcion}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descripción de la tarea"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comisión (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nuevaTarea.comision}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, comision: Number(e.target.value) })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormularioTarea(false);
                        setClienteActual(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Asignar Tarea
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 