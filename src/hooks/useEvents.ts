import { useState, useEffect, useCallback } from 'react';
import { BiaHostedEventListItem } from '@/types/events';
import { biaHostedApi, EventsListParams } from '@/services/biaHostedApi';

// Tipo unificado para eventos (normais + ao vivo)
export type UnifiedEvent = BiaHostedEventListItem & {
  // Campos específicos de eventos ao vivo
  liveTime?: string;
  lst?: string;
  ls?: string;
  score?: number[];
  isLive?: boolean;
};

export interface UseEventsReturn {
  events: UnifiedEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number, onUrlUpdate?: (page: number) => void) => void;
}

export interface EventsFilters {
  searchTerm?: string;
  date?: Date;
  league?: string;
  sortBy?: 'date' | 'name' | 'league';
}

export interface PaginationParams {
  page: number;
  limit: number;
  filters?: EventsFilters;
}

/**
 * Hook para gerenciar eventos da API BiaHosted com paginação e filtros
 */
export function useEvents(
  sportId: number, 
  date?: Date, 
  filters?: EventsFilters,
  pageSize: number = 20
): UseEventsReturn {
  const [allEvents, setAllEvents] = useState<UnifiedEvent[]>([]);
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Função para aplicar filtros aos eventos
  const applyFilters = useCallback((eventsList: UnifiedEvent[], filters?: EventsFilters) => {
    if (!filters) return eventsList;

    let filtered = [...eventsList];

    // Filtro por termo de pesquisa
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por liga (baseado no nome do evento)
    if (filters.league) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(filters.league!.toLowerCase())
      );
    }

    // Ordenação
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date':
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          case 'league':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, []);

  // Função para paginar eventos localmente
  const paginateEvents = useCallback((eventsList: UnifiedEvent[], page: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return eventsList.slice(startIndex, endIndex);
  }, [pageSize]);

  const fetchEvents = useCallback(async () => {
    if (!sportId || sportId === 0) {
      console.log('🚫 Hook useEvents: sportId inválido, não fazendo requisição');
      return;
    }

    console.log('🔄 Hook useEvents: Fazendo requisição para sportId:', sportId);
    setLoading(true);
    setError(null);

    try {
      const params: EventsListParams = {
        sportId,
        date: date || new Date(),
      };

      // Carregar todos os eventos normais de uma vez
      console.log('📅 Carregando todos os eventos normais...');
      const normalData = await biaHostedApi.getEventsList(params);
      const normalEvents: UnifiedEvent[] = (normalData.events || []).map(event => ({
        ...event,
        isLive: false,
      }));
      console.log('📅 Eventos normais encontrados:', normalEvents.length);
      
      // Aplicar filtros aos eventos
      const filteredEvents = applyFilters(normalEvents, filters);
      
      // Armazenar todos os eventos filtrados
      setAllEvents(filteredEvents);
      setTotalEvents(filteredEvents.length);
      
      // Calcular total de páginas
      const totalPagesCount = Math.ceil(filteredEvents.length / pageSize);
      setTotalPages(totalPagesCount);
      
      // Mostrar primeira página
      const firstPageEvents = paginateEvents(filteredEvents, 1);
      setEvents(firstPageEvents);
      setCurrentPage(1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, [sportId, date, filters, pageSize, applyFilters, paginateEvents]);

  const refetch = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const onPageChange = useCallback((page: number, onUrlUpdate?: (page: number) => void) => {
    console.log('📄 Mudando para página:', page);
    
    // Paginar eventos localmente sem fazer nova requisição
    const pageEvents = paginateEvents(allEvents, page);
    setEvents(pageEvents);
    setCurrentPage(page);
    
    // Atualizar URL se callback fornecido
    if (onUrlUpdate) {
      onUrlUpdate(page);
    }
  }, [allEvents, paginateEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch,
    totalEvents,
    currentPage,
    totalPages,
    onPageChange,
  };
}

/**
 * Hook para buscar eventos de múltiplos esportes
 */
export function useMultipleSportsEvents(sportIds: number[], date?: Date) {
  const [eventsBySport, setEventsBySport] = useState<Map<number, BiaHostedEventListItem[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEvents = useCallback(async () => {
    if (!sportIds.length) return;

    setLoading(true);
    setError(null);

    try {
      const results = await biaHostedApi.getEventsForSports(sportIds, date);
      
      // Converter Map para Map<number, BiaHostedEventListItem[]>
      const eventsMap = new Map<number, BiaHostedEventListItem[]>();
      results.forEach((eventsList, sportId) => {
        eventsMap.set(sportId, eventsList.events || []);
      });
      
      setEventsBySport(eventsMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar eventos de múltiplos esportes:', err);
    } finally {
      setLoading(false);
    }
  }, [sportIds, date]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  return {
    eventsBySport,
    loading,
    error,
    refetch: fetchAllEvents,
  };
}