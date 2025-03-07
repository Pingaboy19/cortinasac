import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { DeepgramContextProvider } from '@/lib/contexts/DeepgramContext';
import { CRMProvider } from '@/lib/contexts/CRMContext';
import { theme } from '@/styles/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CortinasAC - Sistema de Gestión',
  description: 'Sistema de gestión para CortinasAC - Elegancia en tu hogar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content={theme.colors.primary} />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <DeepgramContextProvider>
            <CRMProvider>
              {children}
            </CRMProvider>
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
