import { useState, useEffect, useCallback } from 'react';
import { BiaHostedEventListItem } from '@/types/events';
import { biaHostedApi, EventsListParams } from '@/services/biaHostedApi';

export interface UseEventsReturn {
  events: BiaHostedEventListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalEvents: number;
  currentPage: number;
}

export interface EventsFilters {
  searchTerm?: string;
  date?: Date;
  league?: string;
  status?: 'all' | 'live' | 'upcoming';
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
  const [events, setEvents] = useState<BiaHostedEventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);

  // Função para aplicar filtros aos eventos
  const applyFilters = useCallback((eventsList: BiaHostedEventListItem[], filters?: EventsFilters) => {
    if (!filters) return eventsList;

    let filtered = [...eventsList];

    // Filtro por termo de pesquisa
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(event => {
        if (filters.status === 'live') {
          return event.et === 1; // et = 1 significa ao vivo
        }
        if (filters.status === 'upcoming') {
          return event.et === 0; // et = 0 significa próximo
        }
        return true;
      });
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

  const fetchEvents = useCallback(async (page: number = 1, reset: boolean = true) => {
    if (!sportId || sportId === 0) {
      console.log('🚫 Hook useEvents: sportId inválido, não fazendo requisição');
      return;
    }

    console.log('🔄 Hook useEvents: Fazendo requisição para sportId:', sportId, 'página:', page);
    setLoading(true);
    setError(null);

    try {
      const params: EventsListParams = {
        sportId,
        date: date || new Date(),
      };

      const data = await biaHostedApi.getEventsList(params);
      const allEventsData = data.events || [];
      
      // Aplicar filtros
      const filteredEvents = applyFilters(allEventsData, filters);
      
      if (reset) {
        setEvents(filteredEvents.slice(0, pageSize));
        setCurrentPage(1);
      } else {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newEvents = filteredEvents.slice(startIndex, endIndex);
        setEvents(prev => [...prev, ...newEvents]);
        setCurrentPage(page);
      }
      
      setTotalEvents(filteredEvents.length);
      setHasMore((currentPage * pageSize) < filteredEvents.length);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, [sportId, date, filters, pageSize, applyFilters, currentPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchEvents(currentPage + 1, false);
  }, [hasMore, loading, currentPage, fetchEvents]);

  const refetch = useCallback(async () => {
    await fetchEvents(1, true);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents(1, true);
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
    totalEvents,
    currentPage,
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