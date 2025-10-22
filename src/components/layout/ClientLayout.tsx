'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BettingProvider } from '@/contexts/BettingContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Se for a landing page, renderizar sem layout do dashboard
  if (pathname === '/') {
    return (
      <BettingProvider>
        {children}
      </BettingProvider>
    );
  }
  
  // Se for login ou register, renderizar sem layout do dashboard mas dentro do contexto
  if (pathname === '/login' || pathname === '/register') {
    return (
      <BettingProvider>
        {children}
      </BettingProvider>
    );
  }
  
  // Para todas as outras páginas (incluindo /dashboard), usar o layout do dashboard
  // A proteção de autenticação será feita individualmente em cada página
  return (
    <BettingProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </BettingProvider>
  );
}
