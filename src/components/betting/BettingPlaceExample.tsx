'use client';

import React, { useState } from 'react';
import { BettingResultModal } from '@/components/betting/BettingResultModal';

/**
 * Componente de exemplo mostrando como integrar o modal de resultados de apostas
 */
export function BettingPlaceExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bettingResult, setBettingResult] = useState<{
    betBetting: any;
    bilhetes: any[];
    summary: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceBet = async () => {
    setIsLoading(true);

    try {
      // Exemplo de payload para FSSB
      const betData = {
        platform: 'fssb',
        data: {
          selections: [
            {
              selectionId: '0ML770009677378678785H',
              viewKey: 0,
              isCrossBet: false,
              isAddedToBetslip: true,
              isDynamicMarket: false,
              isBetBuilderBet: false
            }
          ],
          stakes: [0.65]
        }
      };

      const response = await fetch('/api/betting/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      });

      if (!response.ok) {
        throw new Error('Erro ao processar aposta');
      }

      const result = await response.json();
      
      // Armazenar resultado
      setBettingResult({
        betBetting: result.betBetting,
        bilhetes: result.bilhetes,
        summary: result.summary
      });
      
      // Abrir modal
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao fazer apostas:', error);
      alert('Erro ao processar apostas. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (bilheteId: string) => {
    console.log('Tentar novamente aposta:', bilheteId);
    
    // Aqui você implementaria a lógica de retry
    // Exemplo: buscar dados do bilhete e fazer nova tentativa
    alert(`Implementar lógica de retry para bilhete: ${bilheteId}`);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fazer Aposta</h2>
        
        <button
          onClick={handlePlaceBet}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Processando...' : 'Fazer Aposta'}
        </button>
      </div>

      {/* Modal de Resultados */}
      {bettingResult && (
        <BettingResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          betBetting={bettingResult.betBetting}
          bilhetes={bettingResult.bilhetes}
          summary={bettingResult.summary}
          onRetry={handleRetry}
        />
      )}
    </>
  );
}

/**
 * Exemplo de como usar o modal diretamente em outro componente
 */
export function UseModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  // Dados de exemplo
  const exampleBetBetting = {
    id: '123',
    accountId: 'user-1',
    description: 'Aposta teste',
    stakeTotal: 0.65,
    averageOdd: 1.45,
    totalBilhetes: 1,
    successfulBilhetes: 1,
    failedBilhetes: 0,
    totalPotentialWin: 0.94,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const exampleBilhetes = [
    {
      id: '1',
      platform: 'fssb',
      site: 'bet7k',
      bilheteId: '770037694931546112',
      stake: 0.65,
      odd: 1.45,
      potentialWin: 0.94,
      balanceBefore: 3.71,
      balanceAfter: 3.06,
      status: 'pending',
      createdAt: new Date()
    }
  ];

  const exampleSummary = {
    totalStake: 0.65,
    successfulBets: 1,
    failedBets: 0,
    successRate: 100,
    processingTime: 9033
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Ver Resultado Exemplo
      </button>

      <BettingResultModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        betBetting={exampleBetBetting}
        bilhetes={exampleBilhetes}
        summary={exampleSummary}
        onRetry={(bilheteId) => console.log('Retry:', bilheteId)}
      />
    </>
  );
}
