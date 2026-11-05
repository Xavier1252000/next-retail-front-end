import React, { Suspense } from 'react';
import Login from '@/components/auth/login';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
