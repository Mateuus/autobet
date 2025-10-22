import { AxiosRequestConfig } from 'axios';

const FSSB_BASE_URL = 'https://prod20350-kbet-152319626.fssb.io'; // URL padrão para bet7k
const PIXBET_FSSB_URL = 'https://prod20383.fssb.io'; // URL para pixbet

export interface FssbTokenResponse {
  authorization: string;
  session: string;
}

export interface FssbEventListParams {
  leagueId?: string;
  sportId?: number;
  regionCode?: string;
  numberOfLeagues?: number;
  topLeagues?: string;
  isAllPreMatch?: boolean;
  prioritySports?: string;
  returnAvailableDates?: boolean;
  fetchSports?: boolean;
  marketTypeIds?: string;
  priorityCountries?: string;
  crossBetting?: boolean;
  view?: string;
  hideX25X75Selections?: boolean;
}

export interface FssbEventDetailsParams {
  eventId: string;
  hideX25X75Selections?: boolean;
}

export interface FssbEvent {
  eventId: string;
  leagueId: string;
  leagueName: string;
  sportId: string;
  sportName: string;
  countryCode: string;
  countryName: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    position: string;
    country?: string;
    logo?: string;
  }>;
  matchTime: number;
  eventName: string;
  startTime: string;
  score: Array<string>;
  isLive: boolean;
  isSuspended: boolean;
  gameClock?: {
    ClockRunning: boolean;
    ClockDirection: number;
    GameTime: number;
    GamePart: number;
    UpdateDate: string;
    GameTimeBFFGotAt: number;
  };
  isBetBuilderEnabled: boolean;
  markets: unknown[]; // Mudado de any[] para unknown[]
  slug: string;
  leagueSlug: string;
  countrySlug: string;
  sportSlug: string;
  sportTypeId: number;
  providerId: number;
  eventStatus: string;
  priority: number;
  isEarlyPayout: boolean;
  earlyPayout: unknown; // Mudado de any para unknown
  providerEventId: string;
  providerLeagueId: string;
  teamColors?: {
    HomeShirtColorPrimary?: string;
    AwayShirtColorPrimary?: string;
    HasVARCoverage?: string;
    HasIncidentCoverage?: string;
  };
  additionalData?: unknown; // Mudado de any para unknown
  metadata?: unknown; // Mudado de any para unknown
}

// Interface para dados brutos da API (antes da transformação)
export interface FssbRawEventData {
  [key: string]: unknown; // Permite qualquer estrutura de dados
}

// Interface para resposta bruta da API
export interface FssbRawResponse {
  data: FssbRawEventData[];
}

export interface FssbEventListResponse {
  data: FssbEvent[];
}

export interface FssbEventDetailsResponse {
  data: FssbEvent[];
}

/**
 * Serviço para fazer chamadas diretas à API FSBB
 */
export class FssbApiService {
  private static instance: FssbApiService;
  private authorization: string = '';
  private session: string = '';
  private siteName: string = '';
  
  private constructor() {}
  
  public static getInstance(): FssbApiService {
    if (!FssbApiService.instance) {
      FssbApiService.instance = new FssbApiService();
    }
    return FssbApiService.instance;
  }

  /**
   * Definir tokens de autenticação
   */
  setTokens(authorization: string, session: string, siteName: string) {
    this.authorization = authorization;
    this.session = session;
    this.siteName = siteName;
  }

  /**
   * Obter URL base baseada no site
   */
  private getBaseUrl(): string {
    switch (this.siteName.toLowerCase()) {
      case 'bet7k':
        return FSSB_BASE_URL;
      case 'pixbet':
        return PIXBET_FSSB_URL;
      default:
        return FSSB_BASE_URL;
    }
  }

  /**
   * Obter URL do script baseada no site
   */
  private getScriptUrl(): string {
    switch (this.siteName.toLowerCase()) {
      case 'bet7k':
        return 'https://7k.bet.br/scripts/whl/production/bet7k/whl.js';
      case 'pixbet':
        return 'https://pix.bet.br/scripts/whl/production/pixbet/whl.js';
      default:
        return 'https://7k.bet.br/scripts/whl/production/bet7k/whl.js';
    }
  }

  /**
   * Obter tokens iniciais da plataforma FSBB
   */
  async getInitialTokens(siteName: string): Promise<FssbTokenResponse> {
    this.siteName = siteName;
    const baseUrl = this.getBaseUrl();
    const scriptUrl = this.getScriptUrl();
    
    const url = `${baseUrl}?operatorToken=logout&api=${encodeURIComponent(scriptUrl)}&sportId=&eventId=&leagueId=`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extrair cookies da resposta
      const setCookieHeader = response.headers.get('set-cookie');
      let authorization = '';
      let session = '';

      if (setCookieHeader) {
        const cookies = setCookieHeader.split(',');
        for (const cookie of cookies) {
          const trimmedCookie = cookie.trim();
          if (trimmedCookie.startsWith('authorization=')) {
            authorization = trimmedCookie.split(';')[0].split('=')[1];
          } else if (trimmedCookie.startsWith('session=')) {
            session = trimmedCookie.split(';')[0].split('=')[1];
          }
        }
      }

      if (!authorization || !session) {
        throw new Error('Não foi possível obter tokens de autorização');
      }

      // Armazenar tokens
      this.setTokens(authorization, session, siteName);

      return {
        authorization,
        session
      };
    } catch (error) {
      console.error('Erro ao obter tokens iniciais:', error);
      throw new Error(`Falha ao obter tokens: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Fazer requisição autenticada
   */
  private async makeAuthenticatedRequest<T>(url: string, config: RequestInit = {}): Promise<T> {
    if (!this.authorization || !this.session) {
      throw new Error('Tokens de autenticação não definidos. Chame getInitialTokens() primeiro.');
    }

    const cookieHeader = `authorization=${this.authorization}; session=${this.session}`;

    const requestConfig: RequestInit = {
      ...config,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Cookie': cookieHeader,
        ...config.headers,
      },
    };

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro na requisição autenticada:', error);
      throw new Error(`Falha na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Transformar dados brutos em estrutura tipada (quando conhecermos a estrutura)
   */
  private transformRawEventData(rawData: FssbRawEventData): FssbEvent {
    // Por enquanto, retornamos os dados como estão
    // Quando conhecermos a estrutura real, implementaremos a transformação
    return rawData as unknown as FssbEvent;
  }

  /**
   * Buscar lista de eventos por liga (dados brutos)
   */
  async getLeagueEventsRaw(params: FssbEventListParams): Promise<FssbRawResponse> {
    const {
      leagueId,
      sportId = 1,
      regionCode = 'BR',
      numberOfLeagues = 10,
      topLeagues = '',
      isAllPreMatch = true,
      prioritySports = '1,234,19,2,6,14,8,64,10,26,236,3,7,20,41,11',
      returnAvailableDates = true,
      fetchSports = true,
      marketTypeIds = 'ML0,ML1,OU200,OU201,QA158',
      priorityCountries = '277,256,260,29,65,107,54,72,180',
      crossBetting = false,
      view = 'european',
      hideX25X75Selections = false
    } = params;

    const baseUrl = this.getBaseUrl();
    
    // Construir URL com parâmetros
    const url = new URL(`${baseUrl}/api/eventlist/eu/events/league-events`);
    
    if (leagueId) {
      url.searchParams.append('leagueId', leagueId);
    }
    url.searchParams.append('numberOfLeagues', numberOfLeagues.toString());
    url.searchParams.append('topLeagues', topLeagues);
    url.searchParams.append('regionCode', regionCode);
    url.searchParams.append('isAllPreMatch', isAllPreMatch.toString());
    url.searchParams.append('prioritySports', prioritySports);
    url.searchParams.append('sportId', sportId.toString());
    url.searchParams.append('returnAvailableDates', returnAvailableDates.toString());
    url.searchParams.append('fetchSports', fetchSports.toString());
    url.searchParams.append('marketTypeIds', marketTypeIds);
    url.searchParams.append('priorityCountries', priorityCountries);
    url.searchParams.append('crossBetting', crossBetting.toString());
    url.searchParams.append('view', view);
    url.searchParams.append('hideX25X75Selections', hideX25X75Selections.toString());

    return await this.makeAuthenticatedRequest<FssbRawResponse>(url.toString());
  }

  /**
   * Buscar lista de eventos por liga (com transformação)
   */
  async getLeagueEvents(params: FssbEventListParams): Promise<FssbEventListResponse> {
    const rawResponse = await this.getLeagueEventsRaw(params);
    
    // Transformar dados brutos em estrutura tipada
    const transformedEvents = rawResponse.data.map(rawEvent => 
      this.transformRawEventData(rawEvent)
    );

    return {
      data: transformedEvents
    };
  }

  /**
   * Buscar eventos com cross betting (dados brutos)
   */
  async getCrossBettingEventsRaw(params: FssbEventListParams): Promise<FssbRawResponse> {
    const {
      numberOfLeagues = 10,
      topLeagues = '',
      regionCode = 'BR',
      isAllPreMatch = true,
      prioritySports = '1,234,19,2,6,14,8,64,10,26,236,3,7,20,41,11',
      sportId = 1,
      returnAvailableDates = true,
      fetchSports = true,
      marketTypeIds = 'ML0,ML1,OU200,OU201,QA158',
      priorityCountries = '277,256,260,29,65,107,54,72,180',
      crossBetting = false,
      view = 'european',
      hideX25X75Selections = false
    } = params;

    const baseUrl = this.getBaseUrl();
    
    // Construir URL com parâmetros
    const url = new URL(`${baseUrl}/api/eventlist/eu/events/crossbetting/initial`);
    
    url.searchParams.append('numberOfLeagues', numberOfLeagues.toString());
    url.searchParams.append('topLeagues', topLeagues);
    url.searchParams.append('regionCode', regionCode);
    url.searchParams.append('isAllPreMatch', isAllPreMatch.toString());
    url.searchParams.append('prioritySports', prioritySports);
    url.searchParams.append('sportId', sportId.toString());
    url.searchParams.append('returnAvailableDates', returnAvailableDates.toString());
    url.searchParams.append('fetchSports', fetchSports.toString());
    url.searchParams.append('marketTypeIds', marketTypeIds);
    url.searchParams.append('priorityCountries', priorityCountries);
    url.searchParams.append('crossBetting', crossBetting.toString());
    url.searchParams.append('view', view);
    url.searchParams.append('hideX25X75Selections', hideX25X75Selections.toString());

    return await this.makeAuthenticatedRequest<FssbRawResponse>(url.toString());
  }

  /**
   * Buscar eventos com cross betting (com transformação)
   */
  async getCrossBettingEvents(params: FssbEventListParams): Promise<FssbEventListResponse> {
    const rawResponse = await this.getCrossBettingEventsRaw(params);
    
    // Transformar dados brutos em estrutura tipada
    const transformedEvents = rawResponse.data.map(rawEvent => 
      this.transformRawEventData(rawEvent)
    );

    return {
      data: transformedEvents
    };
  }

  /**
   * Buscar detalhes de um evento específico (dados brutos)
   */
  async getEventDetailsRaw(params: FssbEventDetailsParams): Promise<FssbRawResponse> {
    const {
      eventId,
      hideX25X75Selections = false
    } = params;

    const baseUrl = this.getBaseUrl();
    
    const url = new URL(`${baseUrl}/api/eventpage/events/${eventId}`);
    url.searchParams.append('hideX25X75Selections', hideX25X75Selections.toString());

    return await this.makeAuthenticatedRequest<FssbRawResponse>(url.toString());
  }

  /**
   * Buscar detalhes de um evento específico (com transformação)
   */
  async getEventDetails(params: FssbEventDetailsParams): Promise<FssbEventDetailsResponse> {
    const rawResponse = await this.getEventDetailsRaw(params);
    
    // Transformar dados brutos em estrutura tipada
    const transformedEvents = rawResponse.data.map(rawEvent => 
      this.transformRawEventData(rawEvent)
    );

    return {
      data: transformedEvents
    };
  }

  /**
   * Método utilitário para analisar estrutura dos dados brutos
   */
  analyzeRawDataStructure(rawData: FssbRawEventData): void {
    console.log('🔍 Análise da estrutura dos dados brutos:');
    console.log('📊 Tipo:', typeof rawData);
    console.log('📋 Chaves disponíveis:', Object.keys(rawData));
    console.log('📄 Dados completos:', JSON.stringify(rawData, null, 2));
    
    // Analisar arrays se existirem
    if (Array.isArray(rawData)) {
      console.log('📊 É um array com', rawData.length, 'elementos');
      if (rawData.length > 0) {
        console.log('📋 Primeiro elemento:', JSON.stringify(rawData[0], null, 2));
      }
    }
  }

  /**
   * Método para obter dados brutos com análise automática
   */
  async getLeagueEventsWithAnalysis(params: FssbEventListParams): Promise<{
    rawData: FssbRawResponse;
    analysis: void;
  }> {
    const rawData = await this.getLeagueEventsRaw(params);
    
    if (rawData.data.length > 0) {
      console.log('🔍 Analisando estrutura dos dados...');
      this.analyzeRawDataStructure(rawData.data[0]);
    }
    
    return {
      rawData,
      analysis: undefined
    };
  }

  /**
   * Buscar eventos para múltiplas ligas
   */
  async getEventsForLeagues(leagueIds: string[], siteName: string): Promise<Map<string, FssbEventListResponse>> {
    const results = new Map<string, FssbEventListResponse>();
    
    // Obter tokens se necessário
    if (!this.authorization || !this.session || this.siteName !== siteName) {
      await this.getInitialTokens(siteName);
    }
    
    const promises = leagueIds.map(async (leagueId) => {
      try {
        const events = await this.getLeagueEvents({ leagueId });
        results.set(leagueId, events);
      } catch (error) {
        console.error(`Erro ao buscar eventos para leagueId ${leagueId}:`, error);
        // Continuar com outras ligas mesmo se uma falhar
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Buscar eventos para múltiplos IDs de eventos
   */
  async getEventsDetails(eventIds: string[], siteName: string): Promise<Map<string, FssbEventDetailsResponse>> {
    const results = new Map<string, FssbEventDetailsResponse>();
    
    // Obter tokens se necessário
    if (!this.authorization || !this.session || this.siteName !== siteName) {
      await this.getInitialTokens(siteName);
    }
    
    const promises = eventIds.map(async (eventId) => {
      try {
        const eventDetails = await this.getEventDetails({ eventId });
        results.set(eventId, eventDetails);
      } catch (error) {
        console.error(`Erro ao buscar detalhes do evento ${eventId}:`, error);
        // Continuar com outros eventos mesmo se um falhar
      }
    });

    await Promise.allSettled(promises);
    return results;
  }
}

// Exportar instância singleton
export const fssbApi = FssbApiService.getInstance();
