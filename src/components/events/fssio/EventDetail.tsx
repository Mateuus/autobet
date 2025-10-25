'use client';

import { useState } from 'react';
import { FssbEvent, FssbMarket, FssbOutcome, FssbTeam } from '@/services/fssbApi';

interface EventDetailProps {
  event: FssbEvent;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function EventDetail({ 
  event, 
  onBack, 
  loading = false, 
  error = null, 
  onRetry 
}: EventDetailProps) {
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<string>>(new Set());

  const handleOddsClick = (selectionId: string) => {
    setSelectedOdds(selectedOdds === selectionId ? null : selectionId);
  };

  const toggleMarketCollapse = (marketId: string) => {
    setCollapsedMarkets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  };

  // Estados de loading e error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar evento</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
          <button
            onClick={onBack}
            className="ml-3 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  // Converter data ISO para formato brasileiro
  const eventDate = new Date(event.startTime);
  const dateStr = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;

  // Extrair nomes dos times dos teams
  const homeTeam = event.teams.find((t: FssbTeam) => t.side === 'Home')?.name || 'Time Casa';
  const awayTeam = event.teams.find((t: FssbTeam) => t.side === 'Away')?.name || 'Time Visitante';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar para Lista
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500">{event.sportName}</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500">{event.leagueName}</span>
        <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {homeTeam} x {awayTeam}
        </div>
      </div>

      {/* Event Header */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          {event.leagueName.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 mb-4">
          {dateStr.replace('/', ' ').toUpperCase()} {timeStr}
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">{homeTeam.charAt(0)}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{homeTeam}</div>
          </div>
          <div className="text-gray-400">x</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">{awayTeam.charAt(0)}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{awayTeam}</div>
          </div>
        </div>
      </div>

      {/* Market Cards */}
      <div className="space-y-4">
        {event.markets?.map((market: FssbMarket, index: number) => {
          const marketOptions = market.outcomes?.map((outcome: FssbOutcome) => ({
            label: typeof outcome.name === 'string' ? outcome.name : outcome.name['BR-PT'] || outcome.name['EN'] || Object.values(outcome.name)[0],
            odds: outcome.odds,
            onClick: () => {
              handleOddsClick(outcome.id);
              // A chamada addSelection já é feita pelo MarketCard.tsx
            },
            isSelected: selectedOdds === outcome.id,
            isDisabled: outcome.isBlocked,
            oddStatus: outcome.isBlocked ? 1 : 0,
            oddId: outcome.id, // ✅ Manter como string para FSSIO
            className: "w-full",
            eventData: {
              id: event.id, // ✅ Manter como string para FSSIO
              name: event.name,
              startDate: event.startTime,
              code: 0,
              competitors: event.teams.map((t: { id: string; name: string }) => ({
                id: t.id, // ✅ Manter como string para FSSIO
                name: t.name
              })),
              sport: {
                typeId: parseInt(event.sportId),
                iconName: 'soccer',
                hasLiveEvents: event.isLive,
                id: parseInt(event.sportId),
                name: event.sportName
              },
              championship: {
                hasLiveEvents: false,
                id: parseInt(event.leagueId),
                name: event.leagueName
              },
              category: {
                iso: 'BR',
                hasLiveEvents: false,
                id: 1,
                name: 'Categoria'
              }
            },
            marketData: {
              typeId: 1,
              isMB: false,
              sv: undefined,
              shortName: market.name,
              name: market.name,
              desktopOddIds: [[outcome.id]], // ✅ Manter como string para FSSIO
              mobileOddIds: [[outcome.id]], // ✅ Manter como string para FSSIO
              isBB: false,
              so: 0,
              sportMarketId: market._id, // ✅ Manter como string para FSSIO
              id: market._id // ✅ Manter como string para FSSIO
            }
          })) || [];

          return (
            <div key={`${market._id}-${index}`} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header do mercado */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-medium">{typeof market.name === 'string' ? market.name : market.name['BR-PT'] || market.name['EN'] || Object.values(market.name)[0]}</h3>
                <button 
                  onClick={() => toggleMarketCollapse(market._id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {collapsedMarkets.has(market._id) ? '▶' : '▼'}
                </button>
              </div>

              {!collapsedMarkets.has(market._id) && (
                <div className="p-4">
                  <div className={`grid gap-2 ${
                    marketOptions.length === 2 ? 'grid-cols-2' : 
                    marketOptions.length === 3 ? 'grid-cols-3' : 
                    'grid-cols-1'
                  }`}>
                    {marketOptions.map((option: { label: string; odds: number; onClick: () => void; isSelected: boolean; isDisabled: boolean; oddStatus: number; oddId: string; className: string; eventData: object; marketData: object }, optionIndex: number) => (
                      <button
                        key={optionIndex}
                        onClick={option.onClick}
                        disabled={option.isDisabled}
                        className={`
                          flex items-center justify-between p-2 rounded border transition-colors relative
                          ${option.isDisabled 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : option.isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                          }
                        `}
                      >
                        {/* Ícone de cadeado para odds desativadas */}
                        {option.isDisabled && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className={`text-sm ${option.isDisabled ? 'text-gray-400' : (option.isSelected ? 'text-blue-900' : 'text-gray-700')}`}>
                          {option.label}
                        </div>
                        <div className={`font-bold ${option.isDisabled ? 'text-gray-400' : (option.isSelected ? 'text-blue-600' : 'text-blue-500')}`}>
                          {option.odds}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
