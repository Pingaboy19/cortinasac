'use client';

interface Equipo {
  id: string;
  nombre: string;
  members: string[];
}

interface Empleado {
  id: string;
  nombre: string;
  role: string;
}

const equipos: Equipo[] = [
  { id: '1', nombre: 'Equipo A', members: ['1', '2'] },
  { id: '2', nombre: 'Equipo B', members: [] }
];

const empleados: Empleado[] = [
  { id: '1', nombre: 'Empleado A', role: 'empleado' },
  { id: '2', nombre: 'Empleado B', role: 'empleado' },
  { id: '3', nombre: 'Admin', role: 'admin' }
];

export default function EquiposPanel() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Equipos</h2>
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
                
                {equipoActual && (
                  <div className="text-sm text-gray-600">
                    <span>Equipo: {equipoActual.nombre}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Miembros:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipo.members.map(memberId => {
                  const empleado = empleados.find(e => e.id === memberId);
                  return empleado ? (
                    <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{empleado.nombre}</span>
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