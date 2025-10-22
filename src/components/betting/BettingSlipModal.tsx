'use client';

import { useState } from 'react';
import { X, Trash2, Settings } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';

interface BettingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BettingSlipModal({ isOpen, onClose }: BettingSlipModalProps) {
  const { selections, removeSelection, clearAllSelections, getTotalStake, getTotalWin } = useBetting();
  const [activeTab, setActiveTab] = useState<'simples' | 'multipla'>('simples');

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
            <div className="p-4 space-y-4">
              {selections.map((selection) => (
                <div key={selection.odd.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  {/* Remove button */}
                  <button
                    onClick={() => removeSelection(selection.odd.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Event info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">⚽</div>
                    <div>
                      <div className="font-medium text-gray-900">{selection.event.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(selection.event.startDate)} • {formatTime(selection.event.startDate)}
                      </div>
                    </div>
                  </div>

                  {/* Market and selection */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 mb-1">{selection.market.shortName}</div>
                    <div className="font-medium text-gray-900">{selection.odd.name}</div>
                  </div>

                  {/* Odds */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Odd</span>
                    <span className="text-lg font-bold text-blue-600">{selection.odd.price}</span>
                  </div>

                  {/* Stake input */}
                  <div className="mb-3">
                    <label className="block text-sm text-gray-500 mb-1">Valor da aposta</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Potential win */}
                  <div className="text-sm text-gray-500">
                    Ganha: <span className="text-green-600 font-medium">R$ 0.00</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selections.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Clear all button */}
            <button
              onClick={clearAllSelections}
              className="w-full flex items-center justify-center gap-2 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar tudo
            </button>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor total de aposta</span>
                <span className="text-gray-900 font-medium">R$ {getTotalStake().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ganho total</span>
                <span className="text-green-600 font-medium">R$ {getTotalWin().toFixed(2)}</span>
              </div>
            </div>

            {/* Place bet button */}
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded transition-colors">
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
