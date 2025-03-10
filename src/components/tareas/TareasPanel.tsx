'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCRM } from '@/lib/contexts/CRMContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Tarea } from '@/lib/contexts/CRMContext';

interface TareasPanelProps {
  empleadoId?: string;
}

export default function TareasPanel({ empleadoId }: TareasPanelProps) {
  const { tareas, equipos, agregarTarea, actualizarTarea, eliminarTarea } = useCRM();
  const { isAdmin, user, empleadosRegistrados, empleadosConectados } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comision, setComision] = useState(0);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [tareaAMover, setTareaAMover] = useState<string | null>(null);
  const [equipoDestino, setEquipoDestino] = useState('');
  const [observacion, setObservacion] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [montoCobrado, setMontoCobrado] = useState<Record<string, number>>({});
  const [metodoPago, setMetodoPago] = useState<Record<string, string>>({});
  const [tareaSeleccionada, setTareaSeleccionada] = useState<string | null>(null);

  // Filtrar tareas según el rol y el ID del empleado
  const tareasFiltradas = empleadoId
    ? tareas.filter(tarea => {
        const equipo = equipos.find(eq => eq.id === tarea.equipoId);
        return equipo?.members?.includes(empleadoId);
      })
    : tareas;

  // Actualizar tareas cada 30 segundos para mantener sincronización
  useEffect(() => {
    const interval = setInterval(() => {
      // La actualización ocurrirá automáticamente a través del CRMContext
      // ya que está conectado al localStorage
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Efecto para mover tareas vencidas
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      tareas.forEach(tarea => {
        if (tarea.estado === 'pendiente') {
          const fechaTarea = new Date(tarea.fecha);
          if (fechaTarea < new Date(ahora.setHours(0, 0, 0, 0))) {
            const nuevaFecha = new Date(fechaTarea);
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
            actualizarTarea(tarea.id, {
              ...tarea,
              fecha: nuevaFecha.toISOString()
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [tareas, actualizarTarea]);

  // Agrupar tareas por fecha
  const tareasAgrupadas = tareasFiltradas.reduce((acc, tarea) => {
    const fecha = new Date(tarea.fecha).toISOString().split('T')[0];
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(tarea);
    return acc;
  }, {} as Record<string, typeof tareas>);

  // Generar días del mes actual
  const diasDelMes = () => {
    const primerDia = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
    const ultimoDia = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);
    const dias = [];

    // Agregar días vacíos al principio si es necesario
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null);
    }

    // Agregar los días del mes
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), i);
      dias.push(fecha);
    }

    return dias;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agregarTarea({
      titulo,
      descripcion,
      equipoId: equipoSeleccionado,
      comision: comision,
      fecha: fechaSeleccionada.toISOString()
    });
    setTitulo('');
    setDescripcion('');
    setComision(0);
    setEquipoSeleccionado('');
    setMostrarFormulario(false);
  };

  const handleCompletarTarea = (tareaId: string) => {
    const monto = montoCobrado[tareaId];
    const metodo = metodoPago[tareaId];

    if (!monto || !metodo) {
      alert('Por favor, ingrese el monto cobrado y el método de pago antes de completar la tarea.');
      return;
    }

    actualizarTarea(tareaId, {
      estado: 'completada',
      montoCobrado: monto,
      metodoPago: metodo as 'efectivo' | 'tarjeta'
    });

    // Limpiar los campos después de completar
    setMontoCobrado(prev => {
      const { [tareaId]: _, ...rest } = prev;
      return rest;
    });
    setMetodoPago(prev => {
      const { [tareaId]: _, ...rest } = prev;
      return rest;
    });
    setTareaSeleccionada(null);
  };

  const handleAgregarObservacion = (tareaId: string) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (tarea && observacion.trim()) {
      actualizarTarea(tareaId, {
        ...tarea,
        observaciones: observacion
      });
      setObservacion('');
    }
  };

  const handleEliminarTarea = (tareaId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (confirmar) {
      eliminarTarea(tareaId);
    }
  };

  // Obtener información del equipo del empleado
  const equipoDelEmpleado = empleadoId ? equipos.find(eq => eq.members.includes(empleadoId)) : null;
  const miembrosEquipo = equipoDelEmpleado ? empleadosRegistrados.filter(emp => 
    equipoDelEmpleado.members.includes(emp.id)
  ) : [];

  const verificarEstadoTarea = (fecha: string) => {
    const fechaTarea = new Date(fecha);
    const ahora = new Date();
    
    // Si es del día actual, mantenerla como pendiente
    if (fechaTarea.toDateString() === ahora.toDateString()) {
      return 'pendiente';
    }
    
    // Si es de días anteriores, marcarla como vencida
    if (fechaTarea < new Date(ahora.setHours(0, 0, 0, 0))) {
      return 'vencida';
    }
    
    return 'pendiente';
  };

  const handleMoverTarea = (tareaId: string, nuevoEquipoId: string) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (tarea) {
      actualizarTarea(tarea.id, {
        ...tarea,
        equipoId: nuevoEquipoId
      });
      setTareaAMover(null);
      setEquipoDestino('');
    }
  };

  const renderTareas = () => {
    return tareas
      .filter(tarea => {
        if (empleadoId) {
          const equipoDelEmpleado = equipos.find(eq => eq.members.includes(empleadoId));
          return equipoDelEmpleado && tarea.equipoId === equipoDelEmpleado.id;
        }
        return true;
      })
      .map(tarea => {
        const equipo = equipos.find(eq => eq.id === tarea.equipoId);
        const fechaTarea = new Date(tarea.fecha);
        
        return (
          <div
            key={tarea.id}
            className={`p-4 rounded-lg border ${
              tarea.estado === 'completada'
                ? 'bg-green-50 border-green-200'
                : tarea.estado === 'vencida'
                ? 'bg-red-50 border-red-200'
                : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{tarea.titulo}</h4>
                <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                <p className="text-sm text-gray-500">
                  Equipo: {equipo?.nombre || 'Sin equipo'}
                </p>
                <p className="text-sm text-gray-500">
                  Fecha: {fechaTarea.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Comisión: {tarea.comision}%
                </p>
                {tarea.estado === 'completada' && tarea.montoCobrado && (
                  <>
                    <p className="text-sm text-gray-500">
                      Monto cobrado: ${tarea.montoCobrado} UYU
                    </p>
                    <p className="text-sm text-gray-500">
                      Método de pago: {tarea.metodoPago}
                    </p>
                  </>
                )}
              </div>
              <span
                className={`px-2 py-1 text-sm rounded ${
                  tarea.estado === 'completada'
                    ? 'bg-green-100 text-green-800'
                    : tarea.estado === 'vencida'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
              </span>
            </div>

            {/* Sección de observaciones */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Agregar observación..."
                  className="flex-1 px-3 py-1 border rounded-md text-gray-900 bg-white"
                />
                <button
                  onClick={() => handleAgregarObservacion(tarea.id)}
                  className="px-4 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Agregar
                </button>
              </div>
              {tarea.observaciones && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                  {tarea.observaciones}
                </div>
              )}
            </div>

            {/* Campos de pago y botones de acción */}
            <div className="mt-4 space-y-4">
              {!isAdmin && tarea.estado === 'pendiente' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto cobrado (UYU) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={montoCobrado[tarea.id] || ''}
                        onChange={(e) => setMontoCobrado(prev => ({
                          ...prev,
                          [tarea.id]: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                        placeholder="Ingrese el monto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de pago *
                      </label>
                      <select
                        value={metodoPago[tarea.id] || ''}
                        onChange={(e) => setMetodoPago(prev => ({
                          ...prev,
                          [tarea.id]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                      >
                        <option value="">Seleccionar método...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompletarTarea(tarea.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!montoCobrado[tarea.id] || !metodoPago[tarea.id]}
                  >
                    Completar
                  </button>
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleEliminarTarea(tarea.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        );
      });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              {/* Filtros de estado */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="completada">Completadas</option>
                <option value="vencida">Vencidas</option>
              </select>
              
              {/* Filtro de equipo (solo para admin) */}
              {!empleadoId && (
                <select
                  value={filtroEquipo}
                  onChange={(e) => setFiltroEquipo(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="">Todos los equipos</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Calendario */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {empleadoId ? 'Mis Tareas' : 'Gestión de Tareas'}
              </h2>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.setMonth(fechaSeleccionada.getMonth() - 1)))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <h3 className="text-base sm:text-lg font-semibold">
                  {fechaSeleccionada.toLocaleString('es', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.setMonth(fechaSeleccionada.getMonth() + 1)))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
                  <div key={index} className="text-center font-medium text-gray-900 p-2">
                    {dia}
                  </div>
                ))}
                {diasDelMes().map((fecha, index) => {
                  if (!fecha) {
                    return <div key={`empty-${index}`} className="p-1 sm:p-2" />;
                  }

                  const fechaStr = fecha.toISOString().split('T')[0];
                  const tareasDelDia = tareasFiltradas.filter(tarea => 
                    new Date(tarea.fecha).toISOString().split('T')[0] === fechaStr
                  );
                  const esFechaActual = new Date().toISOString().split('T')[0] === fechaStr;

                  return (
                    <div
                      key={fechaStr}
                      className={`border rounded p-2 text-center cursor-pointer hover:bg-gray-50 ${
                        esFechaActual ? 'bg-blue-100' : ''
                      } ${!fecha.getDate() ? 'opacity-50' : ''}`}
                      onClick={() => setFechaSeleccionada(fecha)}
                    >
                      <div className="text-gray-900">{fecha.getDate()}</div>
                      {tareasDelDia.map(tarea => {
                        const equipo = equipos.find(eq => eq.id === tarea.equipoId);
                        return (
                          <div
                            key={tarea.id}
                            className={`text-xs p-1 mt-1 rounded truncate ${
                              tarea.estado === 'completada'
                                ? 'bg-green-100 text-green-800'
                                : tarea.estado === 'vencida'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            style={{
                              backgroundColor: equipo?.color || 'transparent',
                              color: 'black'
                            }}
                          >
                            {tarea.titulo.substring(0, 3)}...
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista detallada de tareas */}
      <div className="grid gap-4 sm:gap-6">
        {renderTareas()}
      </div>

      {/* Lista de tareas con opciones de movimiento */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">Tareas Asignadas</h3>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={tareaAMover || ''}
                onChange={(e) => setTareaAMover(e.target.value)}
                className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccionar tarea...</option>
                {tareas.map(tarea => (
                  <option key={tarea.id} value={tarea.id}>
                    {tarea.titulo}
                  </option>
                ))}
              </select>
              {tareaAMover && (
                <>
                  <select
                    value={equipoDestino}
                    onChange={(e) => setEquipoDestino(e.target.value)}
                    className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar equipo...</option>
                    {equipos.map(equipo => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleMoverTarea(tareaAMover, equipoDestino)}
                    className="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={!equipoDestino}
                  >
                    Mover Tarea
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formulario de completar tarea */}
      {!isAdmin && tareaSeleccionada && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Completar Tarea</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto cobrado (UYU)
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                placeholder="Ingrese el monto"
                value={montoCobrado[tareaSeleccionada] || ''}
                onChange={(e) => setMontoCobrado(prev => ({
                  ...prev,
                  [tareaSeleccionada]: parseInt(e.target.value)
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                value={metodoPago[tareaSeleccionada] || ''}
                onChange={(e) => setMetodoPago(prev => ({
                  ...prev,
                  [tareaSeleccionada]: e.target.value
                }))}
              >
                <option value="">Seleccionar método...</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => handleCompletarTarea(tareaSeleccionada)}
            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Completar Tarea
          </button>
        </div>
      )}
    </div>
  );
} 