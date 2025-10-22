import { BiaHostedEventsList, BiaHostedEventDetail, BiaHostedLiveEventsList } from '@/types/events';

const BIA_HOSTED_BASE_URL = 'https://sb2frontend-altenar2.biahosted.com/api/widget';

export interface EventsListParams {
  sportId: number;
  date?: Date;
  culture?: string;
  timezoneOffset?: number;
  integration?: string;
  deviceType?: number;
  numFormat?: string;
  countryCode?: string;
  eventCount?: number;
  couponType?: number;
  playerRegDate?: string; // Campo específico para eventos ao vivo
}

export interface EventDetailParams {
  eventId: number;
  culture?: string;
  timezoneOffset?: number;
  integration?: string;
  deviceType?: number;
  numFormat?: string;
  countryCode?: string;
}

/**
 * Serviço para fazer chamadas diretas à API BiaHosted
 */
export class BiaHostedApiService {
  private static instance: BiaHostedApiService;
  
  private constructor() {}
  
  public static getInstance(): BiaHostedApiService {
    if (!BiaHostedApiService.instance) {
      BiaHostedApiService.instance = new BiaHostedApiService();
    }
    return BiaHostedApiService.instance;
  }

  /**
   * Busca lista de eventos por sportId
   */
  async getEventsList(params: EventsListParams): Promise<BiaHostedEventsList> {
    const {
      sportId,
      date = new Date(),
      culture = 'pt-BR',
      timezoneOffset = 180,
      integration = 'estrelabet',
      deviceType = 1,
      numFormat = 'en-GB',
      countryCode = 'BR',
      eventCount = 0,
      couponType = 3
    } = params;

    // Formatar data no formato ISO
    const isoDate = date.toISOString().split('T')[0] + 'T03:00:00.000Z';
    
    const url = new URL(`${BIA_HOSTED_BASE_URL}/GetCouponEvents`);
    url.searchParams.append('culture', culture);
    url.searchParams.append('timezoneOffset', timezoneOffset.toString());
    url.searchParams.append('integration', integration);
    url.searchParams.append('deviceType', deviceType.toString());
    url.searchParams.append('numFormat', numFormat);
    url.searchParams.append('countryCode', countryCode);
    url.searchParams.append('eventCount', eventCount.toString());
    url.searchParams.append('sportId', sportId.toString());
    url.searchParams.append('couponType', couponType.toString());
    url.searchParams.append('startDate', isoDate);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://www.estrelabet.bet.br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'Referer': 'https://www.estrelabet.bet.br/',
        },
        // Adicionar mode: 'cors' se necessário
        mode: 'cors',
        credentials: 'omit', // Não enviar cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BiaHostedEventsList = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar lista de eventos:', error);
      throw new Error(`Falha ao buscar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca eventos ao vivo por sportId
   */
  async getLiveEvents(params: EventsListParams): Promise<BiaHostedLiveEventsList> {
    const {
      sportId,
      culture = 'pt-BR',
      timezoneOffset = 180,
      integration = 'estrelabet',
      deviceType = 1,
      numFormat = 'en-GB',
      countryCode = 'BR',
      playerRegDate,
      eventCount = 0,
      couponType = 3,
    } = params;

    // Gerar data atual no formato correto se não fornecida
    const currentPlayerRegDate = playerRegDate || new Date().toISOString().replace(/:/g, '%3A');

    const url = new URL(`${BIA_HOSTED_BASE_URL}/GetLiveEvents`);
    url.searchParams.append('culture', culture);
    url.searchParams.append('timezoneOffset', timezoneOffset.toString());
    url.searchParams.append('integration', integration);
    url.searchParams.append('deviceType', deviceType.toString());
    url.searchParams.append('numFormat', numFormat);
    url.searchParams.append('countryCode', countryCode);
    url.searchParams.append('playerRegDate', currentPlayerRegDate);
    url.searchParams.append('eventCount', eventCount.toString());
    url.searchParams.append('sportId', sportId.toString());
    url.searchParams.append('couponType', couponType.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://www.estrelabet.bet.br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'Referer': 'https://www.estrelabet.bet.br/',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BiaHostedLiveEventsList = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar eventos ao vivo:', error);
      throw new Error(`Falha ao buscar eventos ao vivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca detalhes de um evento específico
   * (Implementaremos quando você passar o endpoint)
   */
  async getEventDetail(): Promise<BiaHostedEventDetail> {
    // TODO: Implementar quando o endpoint for fornecido
    throw new Error('Endpoint de detalhes do evento ainda não implementado');
  }

  /**
   * Busca eventos para múltiplos esportes
   */
  async getEventsForSports(sportIds: number[], date?: Date): Promise<Map<number, BiaHostedEventsList>> {
    const results = new Map<number, BiaHostedEventsList>();
    
    const promises = sportIds.map(async (sportId) => {
      try {
        const events = await this.getEventsList({ sportId, date });
        results.set(sportId, events);
      } catch (error) {
        console.error(`Erro ao buscar eventos para sportId ${sportId}:`, error);
        // Continuar com outros esportes mesmo se um falhar
      }
    });

    await Promise.allSettled(promises);
    return results;
  }
}

// Exportar instância singleton
export const biaHostedApi = BiaHostedApiService.getInstance();
