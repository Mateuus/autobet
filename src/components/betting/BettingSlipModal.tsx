'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Settings } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';

interface BettingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BettingSlipModal({ isOpen, onClose }: BettingSlipModalProps) {
  const { selections, removeSelection, clearAllSelections } = useBetting();
  const [activeTab, setActiveTab] = useState<'simples' | 'multipla'>('simples');
  const [stakes, setStakes] = useState<Record<number, number>>({});
  const router = useRouter();

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStakeChange = (oddId: number, value: string) => {
    const stakeValue = parseFloat(value) || 0;
    setStakes(prev => ({
      ...prev,
      [oddId]: stakeValue
    }));
  };

  const calculatePotentialWin = (oddId: number) => {
    const stake = stakes[oddId] || 0;
    const selection = selections.find(s => s.odd.id === oddId);
    if (!selection) return 0;
    
    return stake * selection.odd.price;
  };

  const getTotalStakeAmount = () => {
    return Object.values(stakes).reduce((total, stake) => total + stake, 0);
  };

  const getTotalPotentialWin = () => {
    if (activeTab === 'simples') {
      // Para apostas simples, soma todos os ganhos individuais
      return selections.reduce((total, selection) => {
        const stake = stakes[selection.odd.id] || 0;
        return total + (stake * selection.odd.price);
      }, 0);
    } else {
      // Para apostas múltiplas, multiplica todas as odds e multiplica pelo stake total
      const totalStake = getTotalStakeAmount();
      const totalOdds = selections.reduce((total, selection) => total * selection.odd.price, 1);
      return totalStake * totalOdds;
    }
  };

  const handleRemoveSelection = (oddId: number) => {
    removeSelection(oddId);
    // Limpar o stake quando remover a seleção
    setStakes(prev => {
      const newStakes = { ...prev };
      delete newStakes[oddId];
      return newStakes;
    });
  };

  const prepareBettingPayload = () => {
    // Agrupar seleções por evento
    const eventsMap = new Map();
    
    selections.forEach(selection => {
      const eventId = selection.event.id;
      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          id: selection.event.id,
          isBanker: selection.isBanker,
          dbId: 10, // Valor fixo por enquanto
          sportName: selection.sport.name,
          rC: selection.event.rc,
          eventName: selection.event.name,
          catName: selection.category.name,
          champName: selection.championship.name,
          sportTypeId: selection.sport.typeId,
          odds: []
        });
      }
      
      const event = eventsMap.get(eventId);
      event.odds.push({
        id: selection.odd.id,
        marketId: selection.market.id,
        price: selection.odd.price,
        marketName: selection.market.name,
        marketTypeId: selection.market.typeId,
        mostBalanced: selection.market.isMB,
        selectionTypeId: selection.odd.typeId,
        selectionName: selection.odd.name,
        widgetInfo: selection.widgetInfo
      });
    });

    const betMarkets = Array.from(eventsMap.values());
    const stakesArray = selections.map(selection => stakes[selection.odd.id] || 0);

    return {
      data: {
        betMarkets,
        stakes: stakesArray
      }
    };
  };

  const handlePlaceBet = async () => {
    try {
      const payload = prepareBettingPayload();
      
      console.log('🎯 Enviando aposta para o backend:', payload);
      
      const response = await fetch('/api/betting/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta do backend:', result);
        alert('Aposta enviada com sucesso!');
      } else {
        console.error('❌ Erro ao enviar aposta:', response.statusText);
        alert('Erro ao enviar aposta. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro na conexão. Tente novamente.');
    }
  };

  const handleNavigateToEvent = (eventId: number, sportId: number) => {
    router.push(`/events?eventId=${eventId}&sportId=${sportId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      {/* Modal */}
      <div className="relative bg-white border border-gray-200 shadow-xl w-full max-w-md h-full max-h-[90vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">BOLETIM DE APOSTA</span>
            <div className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {selections.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">MINHAS APOSTAS</span>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('simples')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'simples' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Simples
          </button>
          <button
            onClick={() => setActiveTab('multipla')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'multipla' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Múltipla
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-medium">Nenhuma seleção</p>
              <p className="text-sm">Selecione uma odd para começar</p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {selections.map((selection) => (
                <div key={selection.odd.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveSelection(selection.odd.id)}
                    className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Event info */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">⚽</div>
                    <div>
                      <button
                        onClick={() => handleNavigateToEvent(selection.event.id, selection.sport.id)}
                        className="font-medium text-blue-600 hover:text-blue-800 text-sm text-left hover:underline"
                      >
                        {selection.event.name}
                      </button>
                      <div className="text-xs text-gray-500">
                        {formatDate(selection.event.startDate)} • {formatTime(selection.event.startDate)}
                      </div>
                    </div>
                  </div>

                  {/* Market and selection */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-0.5">{selection.market.shortName}</div>
                    <div className="font-medium text-gray-900 text-sm">{selection.odd.name}</div>
                  </div>

                  {/* Odds */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Odd</span>
                    <span className="text-base font-bold text-blue-600">{selection.odd.price}</span>
                  </div>

                  {/* Stake input */}
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-0.5">Valor da aposta</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={stakes[selection.odd.id] || ''}
                      onChange={(e) => handleStakeChange(selection.odd.id, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Potential win */}
                  <div className="text-xs text-gray-500">
                    Ganha: <span className="text-green-600 font-medium">R$ {calculatePotentialWin(selection.odd.id).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selections.length > 0 && (
          <div className="border-t border-gray-200 p-3 space-y-3">
            {/* Clear all button */}
            <button
              onClick={() => {
                clearAllSelections();
                setStakes({});
              }}
              className="w-full flex items-center justify-center gap-2 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar tudo
            </button>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor total de aposta</span>
                <span className="text-gray-900 font-medium">R$ {getTotalStakeAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ganho total</span>
                <span className="text-green-600 font-medium">R$ {getTotalPotentialWin().toFixed(2)}</span>
              </div>
            </div>

            {/* Place bet button */}
            <button 
              onClick={handlePlaceBet}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded transition-colors"
            >
              Fazer aposta
            </button>

            {/* Settings */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Settings className="w-3 h-3" />
              <span>Perguntar sempre na alteração da...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
