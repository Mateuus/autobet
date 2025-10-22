import { useState } from 'react';
import MarketCard from './MarketCard';
import { BiaHostedEventDetail } from '@/types/events';

interface EventDetailProps {
  event: BiaHostedEventDetail;
  onBackToList: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function EventDetail({ event, onBackToList, loading = false, error = null, onRetry }: EventDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Criar categorias dinâmicas baseadas no marketGroups
  const categories = [
    'Todos',
    ...event.marketGroups.map(group => group.name)
  ];

  const handleOddsClick = (oddsId: string) => {
    setSelectedOdds(selectedOdds === oddsId ? null : oddsId);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setIsSearchActive(true);
    }
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchTerm('');
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
            onClick={onBackToList}
            className="ml-3 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  // Converter data ISO para formato brasileiro
  const eventDate = new Date(event.startDate);
  const dateStr = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;

  // Extrair nomes dos times dos competitors
  const homeTeam = event.competitors[0]?.name || 'Time Casa';
  const awayTeam = event.competitors[1]?.name || 'Time Visitante';

  // Filtrar mercados por categoria e pesquisa
  const getFilteredMarkets = () => {
    let marketIds: number[] = [];

    // Se categoria "Todos", pegar todos os marketIds de todos os grupos
    if (selectedCategory === 'Todos') {
      marketIds = event.marketGroups.flatMap(group => group.marketIds);
      // Remover duplicatas usando Set
      marketIds = [...new Set(marketIds)];
    } else {
      // Pegar marketIds da categoria selecionada
      const selectedGroup = event.marketGroups.find(group => group.name === selectedCategory);
      if (selectedGroup) {
        marketIds = selectedGroup.marketIds;
      }
    }

    console.log('🔍 Filtro de Categorias:');
    console.log('  - Categoria selecionada:', selectedCategory);
    console.log('  - Market IDs encontrados:', marketIds);
    console.log('  - Total de mercados disponíveis:', event.markets.length);

    // Filtrar mercados pelos IDs encontrados
    let filteredMarkets = event.markets.filter(market => 
      marketIds.includes(market.id)
    );

    console.log('  - Mercados filtrados por categoria:', filteredMarkets.length);
    console.log('  - Nomes dos mercados:', filteredMarkets.map(m => m.name));

    // Filtrar por pesquisa
    if (searchTerm.trim()) {
      filteredMarkets = filteredMarkets.filter(market =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('  - Após filtro de pesquisa:', filteredMarkets.length);
    }

    return filteredMarkets;
  };

  const filteredMarkets = getFilteredMarkets();

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
      <div className="relative">
        {/* Categorias com scroll customizado */}
        {!isSearchActive && (
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2">
              {/* Botão de pesquisa dentro da tab */}
              <button
                onClick={handleSearchToggle}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Categorias */}
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Gradiente nas bordas para indicar scroll */}
            <div className="absolute left-0 top-0 bottom-2 w-8 bg-linear-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-linear-to-l from-white to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* Input de pesquisa (expansível) */}
        {isSearchActive && (
          <div className="flex items-center gap-4 mb-4">
            {/* Botão de pesquisa ativo */}
            <button
              onClick={handleSearchToggle}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Input expandido */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar mercados..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
                  autoFocus={isSearchActive}
                />
                {searchTerm && (
                  <button
                    onClick={handleSearchClose}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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

        {/* Renderizar mercados filtrados */}
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market, index) => {
            const marketOptions = market.selections?.flatMap(s => s.odds).map(odd => ({
              label: odd.name,
              odds: odd.price || 1.0,
              onClick: () => handleOddsClick(`market-${market.id}-${odd.id}`),
              isSelected: selectedOdds === `market-${market.id}-${odd.id}`
            })) || [];

            // Usar índice como key para garantir unicidade
            const uniqueKey = `${selectedCategory}-${index}-${market.id}`;

            return (
              <MarketCard
                key={uniqueKey}
                title={market.name}
                options={marketOptions}
                isCollapsed={collapsedMarkets.has(market.id)}
                onToggleCollapse={() => toggleMarketCollapse(market.id)}
              />
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>Nenhum mercado encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-1">Tente pesquisar por outro termo</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
