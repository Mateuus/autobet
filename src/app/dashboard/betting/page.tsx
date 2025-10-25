'use client';

import { useState } from 'react';
import { BettingStatsCards, QuickStatsRow } from '@/components/betting/BettingStatsCards';
import { BettingList } from '@/components/betting/BettingList';
import { BettingDetails } from '@/components/betting/BettingDetails';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BetBetting } from '@/types/betting';

function BettingExtractContent() {
  const [selectedBetting, setSelectedBetting] = useState<BetBetting | null>(null);
  const [view, setView] = useState<'list' | 'details'>('list');

  const handleViewDetails = (betting: BetBetting) => {
    setSelectedBetting(betting);
    setView('details');
  };

  const handleBackToList = () => {
    setSelectedBetting(null);
    setView('list');
  };

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <>
          {/* Cards de Estatísticas */}
          <div className="mb-8">
            <BettingStatsCards />
            <QuickStatsRow />
          </div>

          {/* Lista de Apostas */}
          <BettingList onViewDetails={handleViewDetails} />
        </>
      ) : selectedBetting ? (
        <BettingDetails 
          betting={selectedBetting} 
          onBack={handleBackToList} 
        />
      ) : null}
    </div>
  );
}

export default function BettingExtractPage() {
  return (
    <DashboardLayout title="Extrato de Apostas">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Extrato de Apostas
        </h1>
        <p className="text-gray-600">
          Acompanhe todas as suas apostas automáticas e analise a performance
        </p>
      </div>

      <BettingExtractContent />
    </DashboardLayout>
  );
}
