import { useState } from 'react';
import MarketCard from './MarketCard';
import { BiaHostedEventDetail } from '@/types/events';

interface EventDetailProps {
  event: BiaHostedEventDetail;
  onBackToList: () => void;
}

export default function EventDetail({ event, onBackToList }: EventDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<number>>(new Set());

  const categories = [
    'Todos', 'Popular', 'Dicas', 'Criar Aposta', 'Gols', 'Handicap', 
    'Escanteios', 'Especiais de Jogadores', 'Especiais da Equipes', 
    'Estatísticas', 'Cartões', '1º tempo', '2º tempo', 'Merca'
  ];

  const handleOddsClick = (oddsId: string) => {
    setSelectedOdds(selectedOdds === oddsId ? null : oddsId);
  };

  const toggleMarketCollapse = (marketId: number) => {
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

  // Converter data ISO para formato brasileiro
  const eventDate = new Date(event.startDate);
  const dateStr = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;

  // Extrair nomes dos times dos competitors
  const homeTeam = event.competitors[0]?.name || 'Time Casa';
  const awayTeam = event.competitors[1]?.name || 'Time Visitante';

  // Encontrar mercados populares
  const popularMarkets = event.markets.filter(market => 
    event.marketGroups.find(group => group.name === 'Popular')?.marketIds.includes(market.id)
  );

  // Criar opções para mercados básicos
  const matchWinnerMarket = popularMarkets.find(m => m.name === 'Vencedor do encontro');
  const matchWinnerOptions = matchWinnerMarket?.selections?.flatMap(s => s.odds).map(odd => ({
    label: odd.name,
    odds: odd.price || 1.0,
    onClick: () => handleOddsClick(`match-${odd.id}`),
    isSelected: selectedOdds === `match-${odd.id}`
  })) || [];

  const totalGoalsMarket = popularMarkets.find(m => m.name.includes('Total de Gols'));
  const totalGoalsOptions = totalGoalsMarket?.selections?.flatMap(s => s.odds).map(odd => ({
    label: odd.name,
    odds: odd.price || 1.0,
    onClick: () => handleOddsClick(`total-${odd.id}`),
    isSelected: selectedOdds === `total-${odd.id}`
  })) || [];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onBackToList}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar para Lista
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500">{event.sport.name}</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500">{event.category.name}</span>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-500">{event.champ.name}</span>
        <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {homeTeam} x {awayTeam}
        </div>
        <button className="text-gray-400">
          ▼
        </button>
      </div>

      {/* Event Header */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          {event.champ.name.toUpperCase()}, APERTURA | DIA DE JOGO 14
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

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto">
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 whitespace-nowrap">🔍</button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 whitespace-nowrap ${
              selectedCategory === category 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 whitespace-nowrap">Merca →</button>
      </div>

      {/* Market Cards */}
      <div className="space-y-4">
        {/* Match Winner */}
        {matchWinnerOptions.length > 0 && (
          <MarketCard
            title="Vencedor do encontro"
            options={matchWinnerOptions}
            isCollapsed={collapsedMarkets.has(1211514334)}
            onToggleCollapse={() => toggleMarketCollapse(1211514334)}
          />
        )}

        {/* Total Goals */}
        {totalGoalsOptions.length > 0 && (
          <MarketCard
            title="Total de Gols (incluindo linhas Asiáticas)"
            options={totalGoalsOptions}
            isCollapsed={collapsedMarkets.has(1211514279)}
            onToggleCollapse={() => toggleMarketCollapse(1211514279)}
            additionalIcons={
              <>
                <button className="text-gray-400">⊞</button>
                <button className="text-gray-400">📊</button>
              </>
            }
          />
        )}

        {/* Renderizar outros mercados populares */}
        {popularMarkets
          .filter(market => !['Vencedor do encontro', 'Total de Gols'].some(name => market.name.includes(name)))
          .slice(0, 3)
          .map(market => {
            const marketOptions = market.selections?.flatMap(s => s.odds).map(odd => ({
              label: odd.name,
              odds: odd.price || 1.0,
              onClick: () => handleOddsClick(`market-${market.id}-${odd.id}`),
              isSelected: selectedOdds === `market-${market.id}-${odd.id}`
            })) || [];

            return (
              <MarketCard
                key={market.id}
                title={market.name}
                options={marketOptions}
                isCollapsed={collapsedMarkets.has(market.id)}
                onToggleCollapse={() => toggleMarketCollapse(market.id)}
              />
            );
          })}
      </div>
    </div>
  );
}
