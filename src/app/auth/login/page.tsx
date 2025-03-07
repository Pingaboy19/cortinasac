'use client';

import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  );
} 