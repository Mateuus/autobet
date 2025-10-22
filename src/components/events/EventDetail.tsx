import { useState } from 'react';
import MarketCard from './MarketCard';
import OddsButton from './OddsButton';
import { BiaHostedEventDetail, BiaHostedMarket, BiaHostedOdd } from '@/types/events';
import { shouldRemoveDuplicates } from '@/config/market-config';

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
  const [showFullList, setShowFullList] = useState(false);
  const [selectedSpreadValue, setSelectedSpreadValue] = useState<string>('');

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

    // Filtrar mercados pelos IDs encontrados
    let filteredMarkets = event.markets.filter(market => 
      marketIds.includes(market.id)
    );

    // Processar mercados duplicados - mercado de índice maior ocupa a posição do menor
    const finalMarkets: BiaHostedMarket[] = [];
    const processedIds = new Set<number>();
    
    // Processar todos os mercados na ordem original para manter posições
    event.markets.forEach(market => {
      if (marketIds.includes(market.id)) {
        if (shouldRemoveDuplicates(market.sportMarketId)) {
          // Para mercados especiais, verificar se já foi processado
          if (!processedIds.has(market.id)) {
            // Primeira vez vendo este ID - adicionar na posição atual
            finalMarkets.push(market);
            processedIds.add(market.id);
          } else {
            // ID já existe - substituir o mercado anterior na mesma posição
            const existingIndex = finalMarkets.findIndex(m => m.id === market.id);
            if (existingIndex !== -1) {
              finalMarkets[existingIndex] = market; // Substitui na mesma posição
            }
          }
        } else {
          // Para mercados normais, manter como estão
          finalMarkets.push(market);
        }
      }
    });
    
    filteredMarkets = finalMarkets;

    // Debug: verificar se há mercados duplicados processados
    const originalCount = event.markets.filter(m => marketIds.includes(m.id)).length;
    const finalCount = filteredMarkets.length;
    if (originalCount > finalCount) {
      console.log('🔄 Mercados duplicados processados:', originalCount - finalCount);
      console.log('📊 Total original:', originalCount, '→ Total final:', finalCount);
      console.log('📍 Mercados mantiveram suas posições originais');
    }

    // Filtrar mercados que não tenham desktopOddIds ou que tenham desktopOddIds vazio
    filteredMarkets = filteredMarkets.filter(market => 
      market.desktopOddIds && 
      market.desktopOddIds.length > 0 &&
      market.desktopOddIds.some(oddIdGroup => oddIdGroup.length > 0)
    );

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

  // Função para renderizar mercados com spread (sv)
  const renderSpreadMarket = (market: BiaHostedMarket, index: number) => {
    const uniqueKey = `${selectedCategory}-${index}-${market.id}`;
    
    // Buscar odds com sv
    const spreadOdds = market.desktopOddIds?.flatMap((oddIdGroup: number[]) => 
      oddIdGroup.map((oddId: number) => {
        const odd = event.odds?.find((o: BiaHostedOdd) => o.id === oddId);
        if (!odd || !odd.sv) return null;
        return odd;
      }).filter((item): item is BiaHostedOdd => item !== null)
    ) || [];

    if (spreadOdds.length === 0) {
      // Se não tem odds com sv, renderizar como mercado normal
      const marketOptions = market.desktopOddIds?.flatMap(oddIdGroup => 
        oddIdGroup.map(oddId => {
          const odd = event.odds?.find(o => o.id === oddId);
          if (!odd) return null;

          return {
            label: odd.name,
            odds: odd.price || 1.0,
            onClick: () => handleOddsClick(`market-${market.id}-${odd.id}`),
            isSelected: selectedOdds === `market-${market.id}-${odd.id}`,
            isDisabled: false,
            oddStatus: odd.oddStatus || 0
          };
        }).filter((item): item is NonNullable<typeof item> => item !== null)
      ) || [];

      return (
        <MarketCard
          key={uniqueKey}
          title={market.name}
          options={marketOptions}
          isCollapsed={collapsedMarkets.has(market.id)}
          onToggleCollapse={() => toggleMarketCollapse(market.id)}
          isBB={market.isBB}
        />
      );
    }

    // Separar odds por tipo (Mais/Menos) - incluindo typeIds asiáticos
    const maisOdds = spreadOdds.filter((odd: BiaHostedOdd) => odd.typeId === 12 || odd.typeId === 1715);
    const menosOdds = spreadOdds.filter((odd: BiaHostedOdd) => odd.typeId === 13 || odd.typeId === 1714);
    
    // Pegar todos os valores únicos de spread disponíveis (incluir valores negativos para mercados asiáticos)
    const availableSpreadValues = [...new Set(spreadOdds.map(odd => odd.sv).filter(Boolean))]
      .filter(value => {
        const num = parseFloat(value || '0');
        return !isNaN(num); // Aceitar valores negativos para mercados asiáticos
      })
      .sort((a, b) => parseFloat(a || '0') - parseFloat(b || '0'));
    
    // Usar o valor selecionado no slider ou o primeiro disponível
    const currentSpreadValue = selectedSpreadValue || availableSpreadValues[0] || '0';
    
    // Filtrar odds pelo valor selecionado
    let currentMaisOdds = maisOdds.filter(odd => odd.sv === currentSpreadValue);
    let currentMenosOdds = menosOdds.filter(odd => odd.sv === currentSpreadValue);
    
    // Se não encontrou odds para o valor selecionado, mostrar as primeiras disponíveis
    if (currentMaisOdds.length === 0 && maisOdds.length > 0) {
      currentMaisOdds = [maisOdds[0]]; // Mostrar pelo menos uma odd
    }
    if (currentMenosOdds.length === 0 && menosOdds.length > 0) {
      currentMenosOdds = [menosOdds[0]]; // Mostrar pelo menos uma odd
    }

    return (
      <div key={uniqueKey} className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header do mercado */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-medium">{market.name}</h3>
          <div className="flex items-center gap-2">
            {/* Toggle entre slider e lista completa */}
            <button
              onClick={() => setShowFullList(!showFullList)}
              className={`p-1 rounded transition-colors ${
                showFullList 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showFullList ? 'Ver slider' : 'Ver lista completa'}
            >
              {showFullList ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={() => toggleMarketCollapse(market.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              {collapsedMarkets.has(market.id) ? '▶' : '▼'}
            </button>
          </div>
        </div>

        {!collapsedMarkets.has(market.id) && (
          <div className="p-4">
            {showFullList ? (
              /* Lista completa com botões magros - mostra TODOS os valores separados por colunas */
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna Mais */}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700 mb-2">Mais</div>
                  {maisOdds.map((odd: BiaHostedOdd) => (
                    <button
                      key={odd.id}
                      onClick={() => handleOddsClick(`market-${market.id}-${odd.id}`)}
                      disabled={odd.oddStatus !== 0}
                      className={`
                        w-full flex items-center justify-between p-2 rounded border transition-colors relative
                        ${odd.oddStatus !== 0 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : selectedOdds === `market-${market.id}-${odd.id}`
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }
                      `}
                    >
                      {/* Ícone de cadeado para odds desativadas */}
                      {odd.oddStatus !== 0 && (
                        <div className="absolute top-1 right-1">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      <div className={`text-sm ${odd.oddStatus !== 0 ? 'text-gray-400' : (selectedOdds === `market-${market.id}-${odd.id}` ? 'text-blue-900' : 'text-gray-700')}`}>
                        {odd.name}
                      </div>
                      <div className={`font-bold ${odd.oddStatus !== 0 ? 'text-gray-400' : (selectedOdds === `market-${market.id}-${odd.id}` ? 'text-blue-600' : 'text-blue-500')}`}>
                        {odd.price}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Coluna Menos */}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-700 mb-2">Menos</div>
                  {menosOdds.map((odd: BiaHostedOdd) => (
                    <button
                      key={odd.id}
                      onClick={() => handleOddsClick(`market-${market.id}-${odd.id}`)}
                      disabled={odd.oddStatus !== 0}
                      className={`
                        w-full flex items-center justify-between p-2 rounded border transition-colors relative
                        ${odd.oddStatus !== 0 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : selectedOdds === `market-${market.id}-${odd.id}`
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }
                      `}
                    >
                      {/* Ícone de cadeado para odds desativadas */}
                      {odd.oddStatus !== 0 && (
                        <div className="absolute top-1 right-1">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      <div className={`text-sm ${odd.oddStatus !== 0 ? 'text-gray-400' : (selectedOdds === `market-${market.id}-${odd.id}` ? 'text-blue-900' : 'text-gray-700')}`}>
                        {odd.name}
                      </div>
                      <div className={`font-bold ${odd.oddStatus !== 0 ? 'text-gray-400' : (selectedOdds === `market-${market.id}-${odd.id}` ? 'text-blue-600' : 'text-blue-500')}`}>
                        {odd.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Layout em colunas para Mais/Menos (slider) - mostra apenas 1 par sem texto acima */
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna Mais */}
                <div className="space-y-2">
                  {currentMaisOdds.map((odd: BiaHostedOdd) => (
                    <OddsButton
                      key={odd.id}
                      label={odd.name}
                      odds={odd.price || 1.0}
                      onClick={() => handleOddsClick(`market-${market.id}-${odd.id}`)}
                      isSelected={selectedOdds === `market-${market.id}-${odd.id}`}
                      isDisabled={odd.oddStatus !== 0}
                      oddStatus={odd.oddStatus || 0}
                      oddId={odd.id}
                      className="w-full"
                      eventData={{
                        id: event.id,
                        name: event.name,
                        startDate: event.startDate,
                        code: event.eventCode,
                        competitors: event.competitors,
                        sport: event.sport,
                        championship: event.champ,
                        category: event.category
                      }}
                      marketData={{
                        typeId: market.typeId,
                        isMB: market.isMB,
                        sv: market.sv,
                        shortName: market.shortName,
                        name: market.name,
                        desktopOddIds: market.desktopOddIds,
                        mobileOddIds: market.mobileOddIds,
                        isBB: market.isBB,
                        so: market.so,
                        sportMarketId: market.sportMarketId,
                        id: market.id
                      }}
                    />
                  ))}
                </div>

                {/* Coluna Menos */}
                <div className="space-y-2">
                  {currentMenosOdds.map((odd: BiaHostedOdd) => (
                    <OddsButton
                      key={odd.id}
                      label={odd.name}
                      odds={odd.price || 1.0}
                      onClick={() => handleOddsClick(`market-${market.id}-${odd.id}`)}
                      isSelected={selectedOdds === `market-${market.id}-${odd.id}`}
                      isDisabled={odd.oddStatus !== 0}
                      oddStatus={odd.oddStatus || 0}
                      oddId={odd.id}
                      className="w-full"
                      eventData={{
                        id: event.id,
                        name: event.name,
                        startDate: event.startDate,
                        code: event.eventCode,
                        competitors: event.competitors,
                        sport: event.sport,
                        championship: event.champ,
                        category: event.category
                      }}
                      marketData={{
                        typeId: market.typeId,
                        isMB: market.isMB,
                        sv: market.sv,
                        shortName: market.shortName,
                        name: market.name,
                        desktopOddIds: market.desktopOddIds,
                        mobileOddIds: market.mobileOddIds,
                        isBB: market.isBB,
                        so: market.so,
                        sportMarketId: market.sportMarketId,
                        id: market.id
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Slider funcional para o spread value - apenas quando colunas desativado */}
            {!showFullList && (
              <div className="mt-2">
                <div className="relative">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Linha Asiática</span>
                    <span className="font-bold text-blue-600">{currentSpreadValue}</span>
                  </div>
                  
                  {/* Slider funcional */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={availableSpreadValues.length - 1}
                      value={availableSpreadValues.indexOf(currentSpreadValue)}
                      onChange={(e) => {
                        const index = parseInt(e.target.value);
                        const newValue = availableSpreadValues[index];
                        if (newValue) {
                          setSelectedSpreadValue(newValue);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(availableSpreadValues.indexOf(currentSpreadValue) / (availableSpreadValues.length - 1)) * 100}%, #E5E7EB ${(availableSpreadValues.indexOf(currentSpreadValue) / (availableSpreadValues.length - 1)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                    
                    {/* Marcadores dos valores */}
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      {availableSpreadValues.map((value) => (
                        <span key={value} className="text-center">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


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
            <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2 pl-4 pr-4">
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
            <div className="absolute left-0 top-0 bottom-2 w-4 bg-linear-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-2 w-4 bg-linear-to-l from-white to-transparent pointer-events-none"></div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
        {/* Renderizar mercados filtrados */}
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market, index) => {
            // Verificar se o mercado tem odds com sv (spread value)
            // Exceção: Handicap Europeu 1x2 (sportMarketId: 70510) deve ser tratado como mercado normal
            const isEuropeanHandicap = market.sportMarketId === 70510;
            const hasSpreadOdds = !isEuropeanHandicap && market.desktopOddIds?.some(oddIdGroup => 
              oddIdGroup.some(oddId => {
                const odd = event.odds?.find(o => o.id === oddId);
                return odd?.sv !== undefined;
              })
            );

            if (hasSpreadOdds) {
              // Layout especial para mercados com spread
              return renderSpreadMarket(market, index);
            } else {
              // Layout normal para mercados sem spread - SEMPRE renderizar
              const marketOptions = market.desktopOddIds?.flatMap(oddIdGroup => 
                oddIdGroup.map(oddId => {
                  const odd = event.odds?.find(o => o.id === oddId);
                  if (!odd) return null;

                  return {
                    label: odd.name,
                    odds: odd.price || 1.0,
                    onClick: () => handleOddsClick(`market-${market.id}-${odd.id}`),
                    isSelected: selectedOdds === `market-${market.id}-${odd.id}`,
                    isDisabled: false,
                    oddStatus: odd.oddStatus || 0,
                    oddId: odd.id
                  };
                }).filter((item): item is NonNullable<typeof item> => item !== null)
              ) || [];

              const uniqueKey = `${selectedCategory}-${index}-${market.id}`;

              return (
                <MarketCard
                  key={uniqueKey}
                  title={market.name}
                  options={marketOptions}
                  isCollapsed={collapsedMarkets.has(market.id)}
                  onToggleCollapse={() => toggleMarketCollapse(market.id)}
                  isBB={market.isBB}
                  eventData={{
                    id: event.id,
                    name: event.name,
                    startDate: event.startDate,
                    code: event.eventCode,
                    competitors: event.competitors,
                    sport: event.sport,
                    championship: event.champ,
                    category: event.category
                  }}
                  marketData={{
                    typeId: market.typeId,
                    isMB: market.isMB,
                    sv: market.sv,
                    shortName: market.shortName,
                    name: market.name,
                    desktopOddIds: market.desktopOddIds,
                    mobileOddIds: market.mobileOddIds,
                    isBB: market.isBB,
                    so: market.so,
                    sportMarketId: market.sportMarketId,
                    id: market.id
                  }}
                />
              );
            }
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
