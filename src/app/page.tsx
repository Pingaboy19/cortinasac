import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirigir a la página de login por defecto
  redirect('/auth/login');
}
