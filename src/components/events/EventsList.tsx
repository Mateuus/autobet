import { Calendar, Star, Monitor, RefreshCw, AlertCircle, Wifi } from 'lucide-react';
import { UnifiedEvent } from '@/hooks/useEvents';
import { EventsFilters } from '@/hooks/useEvents';
import EventsFiltersComponent from './EventsFilters';
import Pagination from './Pagination';

interface EventsListProps {
  events: UnifiedEvent[];
  sportName: string;
  onEventSelect: (event: UnifiedEvent) => void;
  onBackToSports: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Props para paginação
  totalEvents?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  filters?: EventsFilters;
  onFiltersChange?: (filters: EventsFilters) => void;
  onSearch?: (searchTerm: string) => void;
  // Props para atualização em tempo real
  isLiveRefreshing?: boolean;
  lastLiveUpdate?: Date | null;
}

export default function EventsList({ 
  events, 
  sportName, 
  onEventSelect, 
  onBackToSports,
  loading = false,
  error = null,
  onRetry,
  totalEvents = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  filters,
  onFiltersChange,
  onSearch,
  isLiveRefreshing = false,
  lastLiveUpdate = null
}: EventsListProps) {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={onBackToSports}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Voltar
          </button>
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">23/10/2025</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {sportName.charAt(0).toUpperCase() + sportName.slice(1)} - Eventos ao Vivo
        </h1>
        <p className="text-gray-600">Selecione um evento para ver os detalhes e odds</p>
        
        {/* Indicador de atualização em tempo real */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Wifi className={`w-4 h-4 ${isLiveRefreshing ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className={`text-sm ${isLiveRefreshing ? 'text-green-600' : 'text-gray-500'}`}>
              {isLiveRefreshing ? 'Atualizando odds...' : 'Tempo real ativo'}
            </span>
          </div>
          {lastLiveUpdate && (
            <span className="text-xs text-gray-400">
              Última atualização: {lastLiveUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      {filters && onFiltersChange && onSearch && (
        <EventsFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          onSearch={onSearch}
        />
      )}

      {/* Events List */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Carregando eventos...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-red-800 font-medium mb-2">Erro ao carregar eventos</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        )}

        {/* Events List */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500 text-sm">Não há eventos disponíveis para este esporte no momento.</p>
          </div>
        )}

        {/* Events */}
        {!loading && !error && events.map((event) => {
          // Converter data ISO para formato brasileiro
          const eventDate = new Date(event.startDate);
          const dateStr = `${eventDate.getDate().toString().padStart(2, '0')}/${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
          const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;
          
          return (
            <div 
              key={event.id}
              onClick={() => onEventSelect(event)}
              className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              {/* Event Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{dateStr} • {timeStr}</span>
                  {event.hasStream && <Monitor className="w-4 h-4 text-gray-400" />}
                  <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  {event.isLive ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          AO VIVO
                        </span>
                        {event.liveTime && (
                          <span className="text-green-600 text-sm font-mono font-bold">
                            {event.liveTime}
                          </span>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <span className="text-blue-600 text-sm font-medium">PRÉ-JOGO</span>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{event.name}</div>
                  {/* Mostrar placar para eventos ao vivo */}
                  {event.isLive && event.score && event.score.length >= 2 && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600 font-medium">Placar:</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold min-w-[30px] text-center">
                          {event.score[0]}
                        </div>
                        <span className="text-gray-400 font-bold">-</span>
                        <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-bold min-w-[30px] text-center">
                          {event.score[1]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">ID: {event.id}</span>
                    <span className="text-sm text-gray-500">Código: {event.code}</span>
                  </div>
                </div>
              </div>

              {/* Event Info 
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div>Sport ID: {event.sportId}</div>
                <div>Cat ID: {event.catId}</div>
                <div>Champ ID: {event.champId}</div>
              </div>*/}
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalEvents={totalEvents}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}