'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import sportsConfig from '@/data/sports-config.json';
import EventsTabs, { EventTabType } from '@/components/events/EventsTabs';
import EventsList from '@/components/events/EventsList';
import EventDetail from '@/components/events/EventDetail';
import PlatformSelector from '@/components/events/PlatformSelector';
import FssioEvents from '@/components/events/fssio/FssioEvents';
import { Sport } from '@/types/events';
import { useEvents, EventsFilters, UnifiedEvent } from '@/hooks/useEvents';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { useEventDetail } from '@/hooks/useEventDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import FloatingBettingButton from '@/components/betting/FloatingBettingButton';
import BettingSlipModal from '@/components/betting/BettingSlipModal';
import { useBetting } from '@/contexts/BettingContext';

interface Platform {
  id: string;
  name: string;
  description: string;
  defaultSite: string;
  integration: string;
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  url: string;
  integration: string;
  isDefault: boolean;
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [filters, setFilters] = useState<EventsFilters>({
    sortBy: 'date'
  });
  const [activeTab, setActiveTab] = useState<EventTabType>('prematch');
  const { isOpen, setIsOpen } = useBetting();
  
  // Estados para seleção de plataforma
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showPlatformSelector, setShowPlatformSelector] = useState(true);

  // Criar uma data fixa para evitar recriação a cada render
  const [currentDate] = useState(() => new Date());

  // Função para lidar com a seleção de plataforma
  const handlePlatformSelect = (platform: Platform, site: Site) => {
    setSelectedPlatform(platform);
    setSelectedSite(site);
    setShowPlatformSelector(false);
  };

  // Função para voltar à seleção de plataforma
  const handleBackToPlatformSelector = () => {
    setShowPlatformSelector(true);
    setSelectedPlatform(null);
    setSelectedSite(null);
  };

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
  } = useLiveEvents(selectedSport?.sportId || 0, currentDate, activeTab === 'live');

  // Hook para detalhes do evento
  const {
    eventDetail,
    loading: eventDetailLoading,
    error: eventDetailError,
    refetch: refetchEventDetail
  } = useEventDetail(selectedEventId);

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
        setSelectedEventId(parseInt(eventId));
        setShowEventsModal(false);
      }
    } else if (sportId && !eventId) {
      // Cenário 2: URL apenas com sportId - mostrar lista de eventos
      const sport = sportsConfig.find(s => s.sportId === parseInt(sportId));
      if (sport) {
        setSelectedSport(sport);
        setShowEventsModal(true);
        setSelectedEventId(null);
        
        // Se há parâmetro page na URL, usar ele
        if (page && parseInt(page) > 1) {
          onPageChange(parseInt(page));
        }
      }
    } else {
      // Cenário 3: URL sem parâmetros - mostrar seleção de esportes
      setSelectedSport(null);
      setShowEventsModal(false);
      setSelectedEventId(null);
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
    setSelectedEventId(event.id);
    setShowEventsModal(false);
    // Atualizar URL com eventId e sportId
    if (selectedSport) {
      router.push(`/events?eventId=${event.id}&sportId=${selectedSport.sportId}`);
    }
  };

  const handleBackToList = () => {
    setSelectedEventId(null);
    setShowEventsModal(true);
    // Atualizar URL para mostrar apenas o esporte
    if (selectedSport) {
      router.push(`/events?sportId=${selectedSport.sportId}`);
    }
  };

  const handleBackToSports = () => {
    setSelectedEventId(null);
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

  if (selectedEventId && eventDetail) {
    return (
      <>
        <EventDetail 
          event={eventDetail}
          onBackToList={handleBackToList}
          loading={eventDetailLoading}
          error={eventDetailError}
          onRetry={refetchEventDetail}
        />
        
        {/* Sistema de Apostas */}
        <FloatingBettingButton />
        <BettingSlipModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        
      </>
    );
  }

  if (showEventsModal) {
    const currentEvents = activeTab === 'live' ? liveEvents : events;
    const currentLoading = activeTab === 'live' ? liveLoading : loading;
    const currentError = activeTab === 'live' ? liveError : error;
    const currentRefetch = activeTab === 'live' ? refetchLive : refetch;

    return (
      <>
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
        
        {/* Sistema de Apostas */}
        <FloatingBettingButton />
        <BettingSlipModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        
      </>
    );
  }

  // Renderizar seleção de plataforma se ainda não foi selecionada
  if (showPlatformSelector) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">23/10/2025</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600">Escolha uma plataforma para começar</p>
        </div>

        {/* Platform Selector */}
        <PlatformSelector
          onPlatformSelect={handlePlatformSelect}
          selectedPlatform={selectedPlatform || undefined}
          selectedSite={selectedSite || undefined}
        />
      </div>
    );
  }

  // Renderizar componentes específicos da plataforma selecionada
  if (selectedPlatform && selectedSite) {
    if (selectedPlatform.id === 'fssio') {
      return (
        <div className="space-y-6">
          {/* Header com opção de voltar */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">23/10/2025</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600">
                {selectedPlatform.name} - {selectedSite.name}
              </p>
            </div>
            
            <button
              onClick={handleBackToPlatformSelector}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Trocar Plataforma
            </button>
          </div>

          {/* FSSIO Events Component */}
          <FssioEvents />
        </div>
      );
    } else if (selectedPlatform.id === 'biahosted') {
      // Renderizar interface Biahosted existente
      return (
        <div className="space-y-6">
          {/* Header com opção de voltar */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">23/10/2025</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600">
                {selectedPlatform.name} - {selectedSite.name}
              </p>
            </div>
            
            <button
              onClick={handleBackToPlatformSelector}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Trocar Plataforma
            </button>
          </div>

          {/* Sports Grid para Biahosted */}
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

          {/* Sistema de Apostas */}
          <FloatingBettingButton />
          <BettingSlipModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      );
    }
  }

  // Fallback - não deveria chegar aqui
  return (
    <div className="space-y-6">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erro na seleção de plataforma
        </h2>
        <p className="text-gray-600 mb-4">
          Ocorreu um erro ao carregar a plataforma selecionada.
        </p>
        <button
          onClick={handleBackToPlatformSelector}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar à Seleção
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  );
}