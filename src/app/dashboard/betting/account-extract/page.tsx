'use client';

import { AccountExtract } from '@/components/betting/AccountExtract';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AccountExtractPage() {
  return (
    <DashboardLayout title="Extrato por Conta">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Extrato por Conta
        </h1>
        <p className="text-gray-600">
          Analise a performance individual de cada conta de aposta
        </p>
      </div>

      <AccountExtract />
    </DashboardLayout>
  );
}
