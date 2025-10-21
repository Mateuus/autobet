'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NoSSR } from '@/components/common/NoSSR';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ProtectedRouteContent({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Se está carregando, mostrar loading
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">AB</span>
          </div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  // Se está logado, renderizar o conteúdo
  return <>{children}</>;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <NoSSR fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">AB</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ProtectedRouteContent fallback={fallback}>
        {children}
      </ProtectedRouteContent>
    </NoSSR>
  );
}
