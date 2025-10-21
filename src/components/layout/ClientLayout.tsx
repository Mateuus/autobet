'use client';

import { ClientHeader } from '@/components/layout/ClientHeader';
import { Footer } from '@/components/layout/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
