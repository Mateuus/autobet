'use client';

import { useState, useCallback, useEffect } from 'react';
import { biaHostedApi, EventsListParams } from '@/services/biaHostedApi';
import { UnifiedEvent } from './useEvents';

export interface UseLiveEventsReturn {
  liveEvents: UnifiedEvent[];
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

export function useLiveEvents(sportId: number, date?: Date, shouldRefresh: boolean = false): UseLiveEventsReturn {
  const [liveEvents, setLiveEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLiveEvents = useCallback(async () => {
    if (!sportId || sportId === 0) return;

    console.log('🔴 Buscando eventos ao vivo...');
    setLoading(true);
    setError(null);

    try {
      const params: EventsListParams = {
        sportId,
        date: date || new Date(),
      };

      const liveData = await biaHostedApi.getLiveEvents(params);
      const events: UnifiedEvent[] = (liveData.events || []).map(event => ({
        ...event,
        offers: event.offers || [],
        code: event.code || 0,
        isLive: true,
      }));

      setLiveEvents(events);
      setLastUpdate(new Date());
      console.log('✅ Eventos ao vivo carregados:', events.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar eventos ao vivo:', err);
    } finally {
      setLoading(false);
    }
  }, [sportId, date]);

  const refreshLiveEvents = useCallback(async () => {
    if (!sportId || sportId === 0) return;

    console.log('🔄 Atualizando eventos ao vivo...');
    setIsRefreshing(true);

    try {
      const params: EventsListParams = {
        sportId,
        date: date || new Date(),
      };

      const liveData = await biaHostedApi.getLiveEvents(params);
      const events: UnifiedEvent[] = (liveData.events || []).map(event => ({
        ...event,
        offers: event.offers || [],
        code: event.code || 0,
        isLive: true,
      }));

      setLiveEvents(events);
      setLastUpdate(new Date());
      console.log('✅ Eventos ao vivo atualizados:', events.length);
    } catch (err) {
      console.error('❌ Erro ao atualizar eventos ao vivo:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [sportId, date]);

  // Carregar eventos ao vivo inicialmente
  useEffect(() => {
    fetchLiveEvents();
  }, [fetchLiveEvents]);

  // Atualização automática a cada 10 segundos (apenas quando shouldRefresh = true)
  useEffect(() => {
    if (!sportId || sportId === 0) return;

    if (shouldRefresh) {
      console.log('🔄 Iniciando atualização automática de eventos ao vivo...');
      
      const interval = setInterval(() => {
        refreshLiveEvents();
      }, 10000); // 10 segundos

      return () => {
        clearInterval(interval);
        console.log('🛑 Parando atualização automática de eventos ao vivo...');
      };
    } else {
      console.log('⏸️ Pausando atualização automática de eventos ao vivo...');
    }
  }, [sportId, refreshLiveEvents, shouldRefresh]);

  return {
    liveEvents,
    loading,
    error,
    isRefreshing,
    lastUpdate,
    refetch: fetchLiveEvents,
  };
}
