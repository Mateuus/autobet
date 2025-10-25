'use client';

import { useState, useEffect, useRef } from 'react';
import FssioMarketCard from './MarketCard';
import { FssbEvent, FssbMarket } from '@/services/fssbApi';

// Helper function para extrair valores localizados
const getLocalizedValue = (value: string | Record<string, string> | null | undefined): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Prioridade: BR-PT > EN > primeiro valor disponível
    return value['BR-PT'] || value['EN'] || Object.values(value)[0] || '';
  }
  return '';
};

// Função para traduzir categorias
const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    'Main': 'Todos',
    'Full Time': 'Tempo Completo',
    'Halves': 'Tempos',
    'Quarters': 'Quartos',
    'Goals': 'Gols',
    'Corners': 'Escanteios',
    'Cards': 'Cartões',
    'Players': 'Jogadores',
    'Specials': 'Especiais',
    'Period': 'Período'
  };
  
  return translations[category] || category;
};

// Usando as interfaces do fssbApi.ts

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const [event, setEvent] = useState<FssbEvent | null>(null);
  const [markets, setMarkets] = useState<FssbMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Main'); // Será atualizado quando os dados carregarem
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const lastLoadedEventIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!eventId) return;
    
    // Evitar requisições duplicadas para o mesmo evento
    if (lastLoadedEventIdRef.current === eventId && isLoadingRef.current) {
      console.log('🚫 [EventDetails] Evitando requisição duplicada para evento:', eventId);
      return;
    }

    let isCancelled = false;

    const loadEventDetails = async () => {
      try {
        console.log('🔄 [EventDetails] Carregando evento:', eventId);
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);
        
        // Buscar detalhes do evento usando a API
        const response = await fetch(`/api/fssb/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar se o componente ainda está montado
        if (isCancelled) return;
        
        if (data.data && data.data.length > 0) {
          const eventData = data.data[0];
          
          // Usar diretamente os dados da API (já estão no formato correto)
          setEvent(eventData);
          lastLoadedEventIdRef.current = eventId; // Marcar evento como carregado
          
          // Usar os mercados diretamente da API
          if (eventData.markets && Array.isArray(eventData.markets)) {
            setMarkets(eventData.markets);
          }
          
          // Definir categoria inicial baseada nos marketsTypes disponíveis
          if (eventData.marketsTypes && eventData.marketsTypes.length > 0) {
            const availableCategories = eventData.marketsTypes.map((mt: { name: string }) => mt.name);
            if (availableCategories.includes('Main')) {
              setSelectedCategory('Main');
            } else if (availableCategories.includes('Full Time')) {
              setSelectedCategory('Full Time');
            } else {
              // Usar a primeira categoria disponível
              setSelectedCategory(availableCategories[0]);
            }
          }
        } else {
          setError('Evento não encontrado');
        }
      } catch (err) {
        if (isCancelled) return;
        setError('Erro ao carregar detalhes do evento');
        console.error('Erro ao carregar detalhes do evento:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadEventDetails();

    // Cleanup function para cancelar requisições pendentes
    return () => {
      isCancelled = true;
    };
  }, [eventId]); // Remover lastLoadedEventId e event das dependências

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

  // Criar categorias baseadas nos marketsTypes do endpoint
  const categories = event?.marketsTypes ? 
    event.marketsTypes.map(marketType => marketType.name) : 
    ['Main', 'Full Time', 'Halves', 'Quarters', 'Goals', 'Corners', 'Cards', 'Players', 'Specials', 'Period'];

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
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evento não encontrado</h2>
          <p className="text-gray-600 mb-4">O evento solicitado não foi encontrado.</p>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
  const homeTeam = event.teams[0]?.name || 'Time Casa';
  const awayTeam = event.teams[1]?.name || 'Time Visitante';

  // Filtrar mercados por categoria e pesquisa
  const getFilteredMarkets = () => {
    let filteredMarkets = markets;
    // Filtrar por categoria (marketType)
    if (selectedCategory) {
      filteredMarkets = filteredMarkets.filter(market =>
        market.marketType && market.marketType.includes(selectedCategory)
      );
    }

    // Filtrar por pesquisa
    if (searchTerm.trim()) {
      filteredMarkets = filteredMarkets.filter(market => {
        const marketName = getLocalizedValue(market.name);
        return marketName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filteredMarkets;
  };

  const filteredMarkets = getFilteredMarkets();

  return (
    <div className="space-y-6">
      {/* Event Header with Football Field Background */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-green-600 via-green-700 to-green-800 mb-6">
        {/* Football Field Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          {/* Field Lines */}
          <div className="absolute inset-0">
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-0.5"></div>
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Goal Areas */}
            <div className="absolute top-1/2 left-0 w-8 h-12 border-2 border-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-8 h-12 border-2 border-white transform -translate-y-1/2"></div>
            {/* Penalty Areas */}
            <div className="absolute top-1/2 left-0 w-16 h-20 border-2 border-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-16 h-20 border-2 border-white transform -translate-y-1/2"></div>
            {/* Field Markings */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-8">
          {/* League Info */}
          <div className="text-center mb-6">
            <div className="text-sm text-green-100 mb-2 font-medium">
              {event.leagueName.toUpperCase()}
            </div>
            <div className="text-sm text-green-200 mb-4">
              {dateStr.replace('/', ' ').toUpperCase()} {timeStr}
            </div>
          </div>

          {/* Teams Matchup */}
          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Home Team */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border-2 border-white/30">
                <span className="text-white font-bold text-lg">{homeTeam.charAt(0)}</span>
              </div>
              <div className="text-sm font-semibold text-white">{homeTeam}</div>
            </div>

            {/* VS Separator */}
            <div className="text-white/80 text-2xl font-bold">VS</div>

            {/* Away Team */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border-2 border-white/30">
                <span className="text-white font-bold text-lg">{awayTeam.charAt(0)}</span>
              </div>
              <div className="text-sm font-semibold text-white">{awayTeam}</div>
            </div>
          </div>

          {/* Match Status */}
          <div className="text-center">
            {event.isLive ? (
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                AO VIVO
              </div>
            ) : event.isPostponed ? (
              <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⏰ PRÉ-JOGO
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⏸️ ADIADO
              </div>
            )}
          </div>
        </div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/20"></div>
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
                  {translateCategory(category)}
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
            const uniqueKey = `${selectedCategory}-${index}-${market._id}`;

            return (
              <FssioMarketCard
                key={uniqueKey}
                title={getLocalizedValue(market.displayName) || getLocalizedValue(market.name)}
                outcomes={market.outcomes}
                isCollapsed={collapsedMarkets.has(parseInt(market._id))}
                onToggleCollapse={() => toggleMarketCollapse(parseInt(market._id))}
                onOutcomeClick={(outcomeId: string) => {
                  const oddsId = `market-${market._id}-${outcomeId}`;
                  handleOddsClick(oddsId);
                  // A chamada addSelection já é feita pelo MarketCard.tsx
                }}
                selectedOutcomeId={selectedOdds?.startsWith(`market-${market._id}-`) ? 
                  selectedOdds.replace(`market-${market._id}-`, '') : null}
                eventData={{
                  id: event.id,
                  name: event.name,
                  startDate: event.startTime,
                  code: 0,
                  competitors: event.teams.map(team => ({
                    id: team.id,
                    name: team.name
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
                }}
                marketData={{
                  typeId: 1,
                  isMB: false,
                  sv: undefined,
                  shortName: getLocalizedValue(market.displayName) || getLocalizedValue(market.name),
                  name: getLocalizedValue(market.displayName) || getLocalizedValue(market.name),
                  desktopOddIds: [market.outcomes.map(o => o.id)],
                  mobileOddIds: [market.outcomes.map(o => o.id)],
                  isBB: false,
                  so: 0,
                  sportMarketId: market._id,
                  id: market._id
                }}
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