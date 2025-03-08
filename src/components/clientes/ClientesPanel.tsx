'use client';

import { useState, useMemo } from 'react';
import { useCRM } from '@/lib/contexts/CRMContext';

export default function ClientesPanel() {
  const { clientes, equipos, agregarCliente, agregarTarea, buscarClientePorNombre } = useCRM();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    necesidades: ''
  });
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({
    equipoId: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false);
  const [clienteActual, setClienteActual] = useState<string | null>(null);
  const [descripcionTarea, setDescripcionTarea] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoCliente.nombre && nuevoCliente.telefono) {
      await agregarCliente(nuevoCliente);
      setModalAbierto(false);
      setNuevoCliente({ nombre: '', telefono: '', direccion: '', necesidades: '' });
    }
  };

  const handleSubmitTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteActual) return;

    agregarTarea({
      titulo: `Tarea para ${clienteActual}`,
      descripcion: descripcionTarea,
      equipoId: nuevaTarea.equipoId,
      comision: 1, // Comisión fija del 1%
      fecha: nuevaTarea.fecha
    });
    setNuevaTarea({
      equipoId: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormularioTarea(false);
    setClienteActual(null);
    setDescripcionTarea('');
  };

  const clientesFiltrados = useMemo(() => {
    return buscarClientePorNombre(busqueda);
  }, [busqueda, buscarClientePorNombre]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Clientes</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMBRE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TELÉFONO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Necesidades
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {cliente.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {cliente.telefono}
                  </td>
                  <td className="px-6 py-4">{cliente.direccion}</td>
                  <td className="px-6 py-4">{cliente.necesidades}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setClienteActual(cliente.nombre);
                        setDescripcionTarea(cliente.necesidades || '');
                        setMostrarFormularioTarea(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Asignar Tarea
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Nuevo Cliente</h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
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
                  className="w-full p-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  className="w-full p-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Necesidades
                </label>
                <textarea
                  value={nuevoCliente.necesidades}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, necesidades: e.target.value })}
                  className="w-full p-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Necesidades del cliente (opcional)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
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
                    Equipo *
                  </label>
                  <select
                    required
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
  );
} 