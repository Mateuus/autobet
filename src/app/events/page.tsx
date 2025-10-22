'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import sportsConfig from '@/data/sports-config.json';
import EventsTabs, { EventTabType } from '@/components/events/EventsTabs';
import EventsList from '@/components/events/EventsList';
import EventDetail from '@/components/events/EventDetail';
import { Sport, BiaHostedEventDetail } from '@/types/events';
import { useEvents, EventsFilters, UnifiedEvent } from '@/hooks/useEvents';
import { useLiveEvents } from '@/hooks/useLiveEvents';

// Mock temporário para detalhes do evento (até implementarmos o endpoint)
const mockEventDetail: BiaHostedEventDetail = {
  id: 13087565,
  feedEventId: 15747275,
  name: "Atlas vs. Club Leon",
  et: 0,
  sport: {
    typeId: 1,
    iconName: "soccer",
    hasLiveEvents: false,
    id: 66,
    name: "Futebol"
  },
  champ: {
    hasLiveEvents: false,
    id: 10009,
    name: "Liga MX"
  },
  category: {
    iso: "MEX",
    hasLiveEvents: false,
    id: 560,
    name: "México"
  },
  competitors: [
    {
      jerseySource: 2,
      jerseyChamps: [10009],
      id: 46433,
      name: "Atlas"
    },
    {
      jerseySource: 2,
      jerseyChamps: [10009],
      id: 47213,
      name: "Club Leon"
    }
  ],
  marketGroups: [
    {
      type: 0,
      marketIds: [31046, 1211514334],
      isBundle: false,
      sortOrder: 0,
      id: 1,
      name: "Popular"
    }
  ],
  markets: [
    {
      desktopOddIds: [[2972253896], [2972253898], [2972253901]],
      mobileOddIds: [[2972253896], [2972253898], [2972253901]],
      childMarketIds: [],
      isBB: false,
      variant: 7,
      so: 0,
      typeId: 1,
      isMB: false,
      sportMarketId: 70472,
      hint: "Club Leon perdeu 10 das suas 14 últimas partidas fora de casa",
      id: 1211514334,
      name: "Vencedor do encontro",
      selections: [
        {
          typeId: 1,
          mst: 0,
          odds: [
            { id: 2972253896, name: "Atlas", price: 2.83, competitorId: 46433 },
            { id: 2972253898, name: "Empate", price: 3.40 },
            { id: 2972253901, name: "Club Leon", price: 2.28, competitorId: 47213 }
          ]
        }
      ]
    }
  ],
  boosts: [],
  nonBoosts: [],
  isParlay: false,
  eventCode: 2724,
  rc: false,
  startDate: "2025-10-23T03:00:00Z",
  showAll: true
};

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BiaHostedEventDetail | null>(null);
  const [filters, setFilters] = useState<EventsFilters>({
    sortBy: 'date'
  });
  const [activeTab, setActiveTab] = useState<EventTabType>('prematch');

  // Criar uma data fixa para evitar recriação a cada render
  const [currentDate] = useState(() => new Date());

  // Usar o hook para buscar eventos com filtros e paginação
  const { 
    events, 
    loading, 
    error, 
    refetch, 
    totalEvents, 
    currentPage,
    totalPages,
    onPageChange
  } = useEvents(
    selectedSport?.sportId || 0,
    currentDate,
    filters,
    20 // pageSize
  );

  // Hook para eventos ao vivo
  const {
    liveEvents,
    loading: liveLoading,
    error: liveError,
    isRefreshing: isLiveRefreshing,
    lastUpdate: lastLiveUpdate,
    refetch: refetchLive
  } = useLiveEvents(selectedSport?.sportId || 0, currentDate);

  // Verificar se há parâmetros na URL ao carregar a página
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    const sportId = searchParams.get('sportId');
    const page = searchParams.get('page');

    if (eventId && sportId) {
      // Cenário 1: URL com eventId e sportId - mostrar detalhes do evento
      const sport = sportsConfig.find(s => s.sportId === parseInt(sportId));
      
      if (sport) {
        setSelectedSport(sport);
        // Para simplificar, usar o mockEventDetail para todos os eventos
        setSelectedEvent(mockEventDetail);
        setShowEventsModal(false);
      }
    } else if (sportId && !eventId) {
      // Cenário 2: URL apenas com sportId - mostrar lista de eventos
      const sport = sportsConfig.find(s => s.sportId === parseInt(sportId));
      if (sport) {
        setSelectedSport(sport);
        setShowEventsModal(true);
        setSelectedEvent(null);
        
        // Se há parâmetro page na URL, usar ele
        if (page && parseInt(page) > 1) {
          onPageChange(parseInt(page));
        }
      }
    } else {
      // Cenário 3: URL sem parâmetros - mostrar seleção de esportes
      setSelectedSport(null);
      setShowEventsModal(false);
      setSelectedEvent(null);
    }
  }, [searchParams, onPageChange]);

  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
    setShowEventsModal(true);
    // Atualizar URL com sportId quando selecionar esporte
    router.push(`/events?sportId=${sport.sportId}`);
  };

  const handlePageChange = (page: number) => {
    if (selectedSport) {
      const url = page > 1 
        ? `/events?sportId=${selectedSport.sportId}&page=${page}`
        : `/events?sportId=${selectedSport.sportId}`;
      router.push(url);
    }
  };

  const handleEventSelect = (event: UnifiedEvent) => {
    // TODO: Implementar busca de detalhes do evento quando o endpoint estiver disponível
    // Por enquanto, usar o mockEventDetail
    setSelectedEvent(mockEventDetail);
    setShowEventsModal(false);
    // Atualizar URL com eventId e sportId
    if (selectedSport) {
      router.push(`/events?eventId=${event.id}&sportId=${selectedSport.sportId}`);
    }
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setShowEventsModal(true);
    // Atualizar URL para mostrar apenas o esporte
    if (selectedSport) {
      router.push(`/events?sportId=${selectedSport.sportId}`);
    }
  };

  const handleBackToSports = () => {
    setSelectedEvent(null);
    setShowEventsModal(false);
    setSelectedSport(null);
    // Limpar parâmetros da URL
    router.push('/events');
  };

  // Funções para filtros e pesquisa
  const handleFiltersChange = (newFilters: EventsFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  if (selectedEvent) {
    return (
      <EventDetail 
        event={selectedEvent}
        onBackToList={handleBackToList}
      />
    );
  }

  if (showEventsModal) {
    const currentEvents = activeTab === 'live' ? liveEvents : events;
    const currentLoading = activeTab === 'live' ? liveLoading : loading;
    const currentError = activeTab === 'live' ? liveError : error;
    const currentRefetch = activeTab === 'live' ? refetchLive : refetch;

    return (
      <div className="space-y-6">
        {/* Abas AO VIVO / PRÉ-JOGO */}
        <EventsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          liveEventsCount={liveEvents.length}
          prematchEventsCount={totalEvents}
          isLiveRefreshing={isLiveRefreshing}
        />

        {/* Lista de Eventos */}
        <EventsList
          events={currentEvents}
          sportName={selectedSport?.sport || ''}
          onEventSelect={handleEventSelect}
          onBackToSports={handleBackToSports}
          loading={currentLoading}
          error={currentError}
          onRetry={currentRefetch}
          totalEvents={activeTab === 'prematch' ? totalEvents : liveEvents.length}
          currentPage={activeTab === 'prematch' ? currentPage : 1}
          totalPages={activeTab === 'prematch' ? totalPages : 1}
          onPageChange={activeTab === 'prematch' ? (page) => onPageChange(page, handlePageChange) : undefined}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          isLiveRefreshing={isLiveRefreshing}
          lastLiveUpdate={lastLiveUpdate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">23/10/2025</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <p className="text-gray-600">Escolha um esporte para ver os eventos disponíveis</p>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sportsConfig.map((sport, index) => (
          <button
            key={index}
            onClick={() => handleSportSelect(sport)}
            className="bg-white hover:bg-gray-50 rounded-lg p-6 text-center transition-colors border border-gray-200 shadow-sm"
          >
            <div className="text-3xl mb-3">
              {sport.sport === 'futebol' && '⚽'}
              {sport.sport === 'basquete' && '🏀'}
            </div>
            <div className="text-gray-900 font-medium capitalize">
              {sport.sport}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}