'use client';

import { AccountExtract } from '@/components/betting/AccountExtract';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function AccountExtractContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extrato por Conta</h1>
          <p className="text-gray-600">Analise a performance individual de cada conta de aposta</p>
        </div>
      </div>

      <AccountExtract />
    </div>
  );
}

export default function AccountExtractPage() {
  return (
    <ProtectedRoute>
      <AccountExtractContent />
    </ProtectedRoute>
  );
}
