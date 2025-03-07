'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LoginForm() {
  const { login, registrarEmpleado } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const success = await registrarEmpleado(formData.username, formData.password);
      if (success) {
        setIsRegistering(false);
        setFormData({ username: '', password: '' });
        alert('Empleado registrado exitosamente');
      } else {
        setError('El nombre de usuario ya existe');
      }
    } else {
      const success = await login(formData.username, formData.password);
      if (!success) {
        setError('Credenciales inválidas');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#E31E24] mb-2">CortinasAC</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRegistering ? 'Registro de Empleado' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering ? 'Crea tu cuenta de empleado' : 'Accede a tu cuenta'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#E31E24] focus:border-[#E31E24] sm:text-sm"
                placeholder="Ingresa tu nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#E31E24] focus:border-[#E31E24] sm:text-sm"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="text-[#E31E24] text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E31E24] hover:bg-[#C41A1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31E24] transition-colors duration-200"
            >
              {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setFormData({ username: '', password: '' });
            }}
            className="text-sm text-[#E31E24] hover:text-[#C41A1F] font-medium transition-colors duration-200"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿Eres nuevo? Regístrate como empleado'}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Elegancia en tu hogar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 