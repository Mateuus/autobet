import { useState, useEffect, useCallback } from 'react';
import { BiaHostedEventDetail } from '@/types/events';
import { biaHostedApi, EventDetailParams } from '@/services/biaHostedApi';

export interface UseEventDetailReturn {
  eventDetail: BiaHostedEventDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEventDetail(eventId: number | null): UseEventDetailReturn {
  const [eventDetail, setEventDetail] = useState<BiaHostedEventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventDetail = useCallback(async () => {
    if (!eventId || eventId === 0) {
      setEventDetail(null);
      return;
    }

    console.log('🔍 Buscando detalhes do evento:', eventId);
    setLoading(true);
    setError(null);

    try {
      const params: EventDetailParams = {
        eventId,
      };

      const data = await biaHostedApi.getEventDetail(params);
      setEventDetail(data);
      console.log('✅ Detalhes do evento carregados:', data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do evento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar detalhes do evento');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);

  const refetch = useCallback(async () => {
    await fetchEventDetail();
  }, [fetchEventDetail]);

  return {
    eventDetail,
    loading,
    error,
    refetch,
  };
}
