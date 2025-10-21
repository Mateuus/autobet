'use client';

import { AuthProvider } from '@/hooks/useAuth';

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
