'use client';

import { useState, useEffect, useCallback } from 'react';
import MarketCard from '../MarketCard';

interface Team {
  id: string;
  name: string;
  side: 'Home' | 'Away';
  type: string;
  logo?: string;
}

interface Market {
  id: string;
  name: string;
  displayName: string;
  description: string;
  outcomes: Outcome[];
  eventId: string;
  leagueId: string;
  sportId: string;
  startTime: string;
  providerId: number;
  lastUpdate: string;
  slug: string;
  leagueSlug: string;
}

interface Outcome {
  id: string;
  name: string;
  displayName: string;
  odds: number;
  isActive: boolean;
  isSuspended: boolean;
  oddsDisplay: string[];
  providerId: number;
  side: string;
  displaySide: string;
}

interface EventData {
  id: string;
  leagueId: string;
  leagueName: string;
  sportId: string;
  sportName: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  teams: Team[];
  providerId: number;
  name: string;
  startTime: string;
  status: string[];
  isLive: boolean;
  isSuspended: boolean;
  gameStatus: unknown;
  isPostponed: boolean;
  lastUpdate: string;
  markets: unknown[];
  providerEventId: string;
  slug: string;
  leagueSlug: string;
}

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [collapsedMarkets, setCollapsedMarkets] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const loadEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar detalhes do evento usando a API
      const response = await fetch(`/api/fssb/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const eventData = data.data[0];
        
        // Converter dados do evento
        const eventInfo: EventData = {
          id: eventData.id,
          leagueId: eventData.leagueId,
          leagueName: eventData.leagueName,
          sportId: eventData.sportId,
          sportName: eventData.sportName,
          countryId: eventData.countryId,
          countryCode: eventData.countryCode,
          countryName: eventData.countryName,
          teams: eventData.teams.map((team: Team) => ({
            id: team.id,
            name: team.name,
            side: team.side,
            type: team.type || 'Unknown',
            logo: team.logo || undefined
          })),
          providerId: eventData.providerId,
          name: eventData.name,
          startTime: eventData.startTime,
          status: eventData.status,
          isLive: eventData.isLive,
          isSuspended: eventData.isSuspended,
          gameStatus: eventData.gameStatus,
          isPostponed: eventData.isPostponed,
          lastUpdate: eventData.lastUpdate,
          markets: eventData.markets,
          providerEventId: eventData.providerEventId,
          slug: eventData.slug,
          leagueSlug: eventData.leagueSlug
        };
        
        setEvent(eventInfo);
        
        // Converter mercados
        if (eventData.markets && Array.isArray(eventData.markets) && eventData.markets.length > 0) {
          const marketsData: Market[] = eventData.markets.map((market: unknown[]) => ({
            id: market[0] as string,
            name: market[1] as string,
            displayName: market[2] as string,
            description: market[3] as string,
            outcomes: market[5] ? (market[5] as unknown[]).map((outcome: unknown) => {
              const outcomeArray = outcome as unknown[];
              return {
                id: outcomeArray[0] as string,
                name: outcomeArray[1] as string,
                displayName: outcomeArray[2] as string,
                odds: outcomeArray[5] as number,
                isActive: outcomeArray[6] as boolean,
                isSuspended: outcomeArray[7] as boolean,
                oddsDisplay: outcomeArray[8] as string[],
                providerId: outcomeArray[9] as number,
                side: outcomeArray[10] as string,
                displaySide: outcomeArray[11] as string
              };
            }) : [],
            eventId: market[6] as string,
            leagueId: market[7] as string,
            sportId: market[8] as string,
            startTime: market[9] as string,
            providerId: market[10] as number,
            lastUpdate: market[11] as string,
            slug: market[12] as string,
            leagueSlug: market[13] as string
          }));
          
          setMarkets(marketsData);
        }
      } else {
        setError('Evento não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar detalhes do evento');
      console.error('Erro ao carregar detalhes do evento:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId, loadEventDetails]);

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

  // Criar categorias dinâmicas baseadas nos mercados
  const categories = [
    'Todos',
    'Popular',
    'Resultado Final',
    'Ambas Marcam',
    'Over/Under'
  ];

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
            onClick={loadEventDetails}
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

    // Filtrar por pesquisa
    if (searchTerm.trim()) {
      filteredMarkets = filteredMarkets.filter(market =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredMarkets;
  };

  const filteredMarkets = getFilteredMarkets();

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          {event.leagueName.toUpperCase()}, APERTURA | DIA DE JOGO 14
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
            const marketOptions = market.outcomes.map((outcome: Outcome) => ({
              label: outcome.displayName,
              odds: outcome.odds,
              onClick: () => handleOddsClick(`market-${market.id}-${outcome.id}`),
              isSelected: selectedOdds === `market-${market.id}-${outcome.id}`,
              isDisabled: outcome.isSuspended,
              oddStatus: outcome.isSuspended ? 1 : 0,
              oddId: parseInt(outcome.id)
            }));

            const uniqueKey = `${selectedCategory}-${index}-${market.id}`;

            return (
              <MarketCard
                key={uniqueKey}
                title={market.displayName}
                options={marketOptions}
                isCollapsed={collapsedMarkets.has(parseInt(market.id))}
                onToggleCollapse={() => toggleMarketCollapse(parseInt(market.id))}
                isBB={false}
                eventData={{
                  id: parseInt(event.id),
                  name: event.name,
                  startDate: event.startTime,
                  code: parseInt(event.providerEventId),
                  competitors: event.teams.map(team => ({
                    id: parseInt(team.id),
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
                    hasLiveEvents: event.isLive,
                    id: parseInt(event.leagueId),
                    name: event.leagueName
                  },
                  category: {
                    iso: event.countryCode,
                    hasLiveEvents: event.isLive,
                    id: parseInt(event.countryId),
                    name: event.countryName
                  }
                }}
                marketData={{
                  typeId: parseInt(market.id),
                  isMB: false,
                  sv: undefined,
                  shortName: market.name,
                  name: market.displayName,
                  desktopOddIds: [[parseInt(market.id)]],
                  mobileOddIds: [[parseInt(market.id)]],
                  isBB: false,
                  so: 0,
                  sportMarketId: parseInt(market.id),
                  id: parseInt(market.id)
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