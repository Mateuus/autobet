'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Se for a landing page, renderizar sem layout do dashboard
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  // Se for login, renderizar sem layout do dashboard mas dentro do contexto
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // Para todas as outras páginas (incluindo /dashboard), usar o layout do dashboard
  // A proteção de autenticação será feita individualmente em cada página
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
