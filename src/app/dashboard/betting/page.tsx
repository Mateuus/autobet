'use client';

import { useState } from 'react';
import { BettingStatsCards, QuickStatsRow } from '@/components/betting/BettingStatsCards';
import { BettingList } from '@/components/betting/BettingList';
import { BettingDetails } from '@/components/betting/BettingDetails';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extrato de Apostas</h1>
          <p className="text-gray-600">Acompanhe todas as suas apostas automáticas e analise a performance</p>
        </div>
      </div>

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
    <ProtectedRoute>
      <BettingExtractContent />
    </ProtectedRoute>
  );
}
