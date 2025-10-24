// FSSB API Service
// Baseado na estrutura do biaHostedApi.ts mas adaptado para FSSB

const FSSB_BASE_URL = 'https://prod20350-kbet-152319626.fssb.io';

// Cache global para manter instância e tokens entre requisições
declare global {
  var __fssbApiInstance: FssbApiService | undefined;
  var __fssbTokens: { authorization: string; session: string; timestamp: number } | undefined;
}

export interface FssbSport {
  sportId: string;
  sportName: string;
  numberOfEvents: number;
}

export interface FssbSportsResponse {
  sports: FssbSport[];
}

export interface SportsParams {
  crossBetting?: boolean;
  isAllPreMatch?: boolean;
}

export interface FssbLeague {
  id: string;           // "741930177135853568" - ID da liga
  name: string;         // "Alemanha Copa DFB" - Nome da liga
  isPopular: boolean;   // false - Se é popular/destacada
  priority: number;     // 0 - Prioridade da liga
  slug: string;         // "Alemanha-Copa-DFB" - Nome para URL
  country: string;      // "Alemanha" - País
  sport: string;        // "Futebol" - Esporte
  sportId: string;      // "54" - ID do esporte
  providerId: number;  // 60000900 - ID do provedor
  providerLeagueId: string; // "5768" - ID da liga no provedor
}

export interface FssbLeaguesResponse {
  data: FssbLeague[];
}

export interface LeaguesParams {
  sportId: string;
  isTopLeague?: boolean;
}

export interface FssbTeam {
  id: string;
  name: string;
  side: 'Home' | 'Away';
  type?: string;
  logo?: string;
}

export interface FssbGameStatus {
  clockRunning: boolean;
  clockDirection: number;
  updateDate: string;
  gameTimeBFFGotAt: number;
}

export interface FssbOutcome {
  id: string;                    //0 ID do outcome
  name: string | Record<string, string>;                  //1 Nome do outcome (pode ser objeto localizado)
  displayName: string | Record<string, string>;           //2 Display name (pode ser objeto localizado)
  TypeName: string | Record<string, string>;              //3 TypeName (pode ser objeto localizado)
  array2: string;                //4 Desconhecido
  isSuspense: boolean;           //5 Se a odd está suspensa (true = não mostrar)
  odds: number;                  //6 Odds
  isBlocked: boolean;            //7 Se está bloqueado (false = pode apostar, true = bloqueado)
  oddsDisplay: string[];         //8 Display das odds
  array9: boolean;               //9 Desconhecido (era isSuspended)
  providerId: number;            //10 Provider ID
  OutcomeType: string | Record<string, string>;           //11 Lado (Home/Away/Draw) (pode ser objeto localizado)
  MarketId: string;              //12 Market ID
  array4: string;                //13 Desconhecido
  array5: string;                //14 Desconhecido
  array6: string;                //15 Desconhecido
  Points: string;                //16 Points Handicap
  marketType: string;            //19 Market Type
}

export interface FssbMarket {
  _id: string;                   //0 ID do market
  name: string | Record<string, string>;                  //1 Nome do market (pode ser objeto localizado)
  displayName: string | Record<string, string> | null;    //2 Display name (pode ser objeto localizado)
  description: string;           //3 Descrição
  array4: string;                //4 Desconhecido
  array5: string;                //5 Desconhecido
  eventId: string;               //6 Event ID
  leagueId: string;              //7 League ID
  sportId: string;               //8 Sport ID
  startTime: string;             //9 Start time
  array10: string;               //10 Desconhecido
  array11: string;               //11 Desconhecido
  array12: string;               //12 Desconhecido
  outcomes: FssbOutcome[];       //13 Array de outcomes
  array14: string;               //14 Desconhecido
  array15: string;               //15 Desconhecido
  array16: string;               //16 Desconhecido
  array17: string;               //17 Desconhecido
  array18: string;               //18 Desconhecido
  marketType: string[];         //19 Market Type
  array20: string;               //20 Desconhecido
  array21: string;               //21 Desconhecido
  array22: string;               //22 Desconhecido
  array23: string;               //23 Desconhecido
  array24: string;               //24 Desconhecido
  array25: string;               //25 Desconhecido
  array26: string;               //26 Desconhecido
  array27: string;               //27 Desconhecido
  array28: string;               //28 Desconhecido
  array29: string;               //29 Desconhecido
}

export interface FssbEvent {
  id: string;                    //0 "766498955642302464" - ID do evento
  leagueId: string;              //1 "677879777860075520" - ID da liga
  leagueName: string;            //2 "Brasileirão Série A" - Nome da liga
  sportId: string;               //3 "1" - ID do esporte
  sportName: string;             //4 "Futebol" - Nome do esporte
  countryId: string;             //5 "29" - ID do país
  countryCode: string;           //6 "BR" - Código do país
  countryName: string;           //7 "Brasil" - Nome do país
  teams: FssbTeam[];             //8 Array de times
  providerId: number;            //9 1602 - ID do provedor
  name: string;                  //10 "Atlético MG vs Ceará" - Nome do evento
  startTime: string;             //11 "2025-10-25T19:00:00.000Z" - Data/hora de início
  status: string[];              //12 Status do evento
  isLive: boolean;               //13 false - Se está ao vivo
  array14: boolean;              //14 Desconhecido (era isSuspended)
  gameStatus: FssbGameStatus;    //15 Status do jogo
  isPostponed: boolean;          //16 true - Se foi adiado
  lastUpdate: string;            //17 "" - Última atualização
  providerEventId: string;       //19 string id de alguma coisa
  markets: FssbMarket[];         //20 Mercados de apostas
  slug: string;                  //21 "Atlético-MG-vs-Ceará" - Slug para URL
  leagueSlug: string;            //22 "Brasileirão-Série-A" - Slug da liga
  countrySlug: string;           //23 "Brasil" - Slug do país
  sportSlug: string;             //24 "Futebol" - Slug do esporte
  array25: unknown[];           //25 Array desconhecido [25]
  array26: unknown[];           //26 Array desconhecido [26]
  array27: unknown[];           //27 Array desconhecido [27]
  Fixture: unknown[];           //28 Fixture
  colorsInfo: unknown[];         //29 colorsInfo
  marketsTypes: MarketType[];   //30 Tipos de mercados
  array31: unknown[];           //31 Array desconhecido [31]
  array32: unknown[];           //32 Array desconhecido [32]
  array33: unknown[];           //33 Array desconhecido [33]
  array34: unknown[];           //34 Array desconhecido [34]
  array35: unknown[];           //35 Array desconhecido [35]
  array36: unknown[];           //36 Array desconhecido [36]
  array37: unknown[];           //37 Array desconhecido [37]
}

export interface FssbEventsResponse {
  data: FssbEvent[];
}

export interface LeagueEventsParams {
  leagueId: string;
}

export interface EventDetailsParams {
  eventId: string;
}

export interface MarketType {
  id: number;           // ID único do tipo de mercado
  name: string;         // Nome do tipo de mercado
  displayName: string;  // Nome de exibição (geralmente igual ao name)
  category: string;     // Categoria (derivada do nome)
}

export interface FssbEventDetailsResponse {
  data: FssbEvent[];
}

/**
 * Serviço para fazer chamadas diretas à API FSSB
 */
export class FssbApiService {
  private authorization: string = '';
  private session: string = '';
  private tokenInitialized: boolean = false;

  
  constructor() {}
  
  public static getInstance(): FssbApiService {
    // Usar cache global para manter instância entre requisições
    if (!global.__fssbApiInstance) {
      global.__fssbApiInstance = new FssbApiService();
    }
    return global.__fssbApiInstance;
  }

  /**
   * Inicializa tokens de autorização automaticamente
   */
  private async initializeTokens(): Promise<void> {
    // Verificar se já temos tokens válidos no cache global
    if (global.__fssbTokens) {
      const tokenAge = Date.now() - global.__fssbTokens.timestamp;
      const maxAge = 30 * 60 * 1000; // 30 minutos
      
      if (tokenAge < maxAge) {
        console.log('♻️ [FSSB API] Reutilizando tokens do cache global...');
        this.authorization = global.__fssbTokens.authorization;
        this.session = global.__fssbTokens.session;
        this.tokenInitialized = true;
        return;
      } else {
        global.__fssbTokens = undefined;
      }
    }

    if (this.tokenInitialized) {
      return;
    }

    try {
      const response = await fetch(FSSB_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (response.ok) {
        const setCookieHeader = response.headers.get('set-cookie');

        if (setCookieHeader) {
          // Parse cookies corretamente - cada cookie é separado por vírgula
          const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
          
          for (const cookie of cookies) {
            if (cookie.includes('authorization=')) {
              const authMatch = cookie.match(/authorization=([^;]+)/);
              if (authMatch) {
                this.authorization = authMatch[1];
              }
            }
            if (cookie.includes('session=')) {
              const sessionMatch = cookie.match(/session=([^;]+)/);
              if (sessionMatch) {
                this.session = sessionMatch[1];
              }
            }
          }
        }
      }

      // Salvar tokens no cache global
      global.__fssbTokens = {
        authorization: this.authorization,
        session: this.session,
        timestamp: Date.now()
      };

      this.tokenInitialized = true;
      console.log('🔑 [FSSB API] Novos tokens obtidos e salvos no cache global!');
      
    } catch (error) {
      console.error('❌ [FSSB API] Erro ao buscar token:', error);
      throw new Error('Falha ao inicializar tokens de autorização');
    }
  }

  /**
   * Busca lista de esportes disponíveis
   */
  async getSports(params: SportsParams = {}): Promise<FssbSportsResponse> {
    const {
      crossBetting = false,
      isAllPreMatch = true
    } = params;

    // Inicializar tokens se necessário
    await this.initializeTokens();

    const url = new URL(`${FSSB_BASE_URL}/api/eventlist/eu/events/crossbetting/sports`);
    url.searchParams.append('crossBetting', crossBetting.toString());
    url.searchParams.append('isAllPreMatch', isAllPreMatch.toString());

    const cookieString = `authorization=${this.authorization}; session=${this.session}`;
    
    try {
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authorization,
        'Cookie': cookieString,
        'Origin': 'https://7k.bet.br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Referer': 'https://7k.bet.br/',
      };
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: requestHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FssbSportsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [FSSB API] Erro ao buscar lista de esportes:', error);
      throw new Error(`Falha ao buscar esportes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca lista de ligas disponíveis para um esporte específico
   */
  async getLeagues(params: LeaguesParams): Promise<FssbLeaguesResponse> {
    const {
      sportId,
      isTopLeague = false
    } = params;

    // Inicializar tokens se necessário
    await this.initializeTokens();

    const url = new URL(`${FSSB_BASE_URL}/api/eventlist/eu/sports/${sportId}/leagues`);
    url.searchParams.append('IsTopLeague', isTopLeague.toString());

    //const cookieString = `authorization=${this.authorization}; session=${this.session}`;
    
    try {
      const requestHeaders = {
        'Authorization': this.authorization,
        'Session': this.session,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        //'Cookie': `authorization=${this.authorization}; session=${this.session}`
      };
      
      console.log('🌐 [FSSB API] Fazendo requisição para:', url.toString());
      console.log('📤 [FSSB API] Headers enviados:', Object.keys(requestHeaders));
      console.log('🔑 [FSSB API] Authorization:', this.authorization.substring(0, 50) + '...');
      console.log('🍪 [FSSB API] Session:', this.session.substring(0, 50) + '...');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: requestHeaders,
      });

      if (!response.ok) {
        // Tentar ler o corpo da resposta para debug
        try {
          const errorText = await response.text();
          console.error('📄 [FSSB API] Corpo da resposta de erro:', errorText.substring(0, 1000));
        } catch {
          console.error('❌ [FSSB API] Não foi possível ler o corpo da resposta');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      
      console.log('🔍 [FSSB API] Dados brutos recebidos:', rawData.data?.slice(0, 2));
      
      // Mapear os dados do array para objetos FssbLeague
      const mappedLeagues: FssbLeague[] = rawData.data.map((leagueArray: unknown[]) => ({
        id: leagueArray[0] as string,           // "741930177135853568"
        name: leagueArray[1] as string,          // "Alemanha Copa DFB"
        isPopular: leagueArray[2] as boolean,    // false
        priority: leagueArray[3] as number,     // 0
        slug: leagueArray[4] as string,         // "Alemanha-Copa-DFB"
        country: leagueArray[5] as string,      // "Alemanha"
        sport: leagueArray[6] as string,        // "Futebol"
        sportId: leagueArray[7] as string,      // "54"
        providerId: leagueArray[8] as number,   // 60000900
        providerLeagueId: leagueArray[9] as string // "5768"
      }));

      const data: FssbLeaguesResponse = {
        data: mappedLeagues
      };
      
      console.log('🏆 [FSSB API] Primeiras 3 ligas mapeadas:', mappedLeagues.slice(0, 3));
      
      return data;
    } catch (error) {
      console.error('❌ [FSSB API] Erro ao buscar lista de ligas:', error);
      throw new Error(`Falha ao buscar ligas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca eventos de uma liga específica
   */
  async getLeagueEvents(params: LeagueEventsParams): Promise<FssbEventsResponse> {
    const { leagueId } = params;

    // Inicializar tokens se necessário
    await this.initializeTokens();

    const url = new URL(`${FSSB_BASE_URL}/api/eventlist/eu/events/league-events`);
    url.searchParams.append('leagueId', leagueId);

    try {
      const requestHeaders = {
        'Authorization': this.authorization,
        'Session': this.session,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Cookie': `authorization=${this.authorization}; session=${this.session}`,
        'Accept': 'application/json',
        'Origin': 'https://7k.bet.br',
        'Referer': 'https://7k.bet.br/',
      };
      
      console.log('🌐 [FSSB API] Fazendo requisição para eventos:', url.toString());
      console.log('📤 [FSSB API] Headers enviados:', Object.keys(requestHeaders));
      console.log('🔑 [FSSB API] Authorization:', this.authorization.substring(0, 50) + '...');
      console.log('🍪 [FSSB API] Session:', this.session.substring(0, 50) + '...');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: requestHeaders,
      });

      if (!response.ok) {
        // Tentar ler o corpo da resposta para debug
        try {
          const errorText = await response.text();
          console.error('📄 [FSSB API] Corpo da resposta de erro:', errorText.substring(0, 1000));
        } catch {
          console.error('❌ [FSSB API] Não foi possível ler o corpo da resposta');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
            
      // Mapear os dados do array para objetos FssbEvent
      const mappedEvents: FssbEvent[] = rawData.data.map((eventArray: unknown[]) => ({
        id: eventArray[0] as string,                    // "766498955642302464"
        leagueId: eventArray[1] as string,              // "677879777860075520"
        leagueName: eventArray[2] as string,            // "Brasileirão Série A"
        sportId: eventArray[3] as string,               // "1"
        sportName: eventArray[4] as string,             // "Futebol"
        countryId: eventArray[5] as string,             // "29"
        countryCode: eventArray[6] as string,           // "BR"
        countryName: eventArray[7] as string,           // "Brasil"
        teams: (eventArray[8] as unknown[]).map((team: unknown) => {
          const teamArray = team as unknown[];
          return {
            id: teamArray[0] as string,
            name: typeof teamArray[1] === 'object' ? 
              (teamArray[1] as Record<string, string>)['BR-PT'] || 
              (teamArray[1] as Record<string, string>)['EN'] || 
              Object.values(teamArray[1] as Record<string, string>)[0] : 
              teamArray[1] as string,
            side: teamArray[2] as 'Home' | 'Away',
            type: (teamArray[3] as string) || 'Unknown',
            logo: teamArray[4] as string || undefined
          };
        }),
        providerId: eventArray[9] as number,            // 1602
        name: eventArray[10] as string,                 // "Atlético MG vs Ceará"
        startTime: eventArray[11] as string,            // "2025-10-25T19:00:00.000Z"
        status: eventArray[12] as string[],              // Status do evento
        isLive: eventArray[13] as boolean,              // false
        gameStatus: eventArray[15] as FssbGameStatus,   // Status do jogo
        isPostponed: eventArray[16] as boolean,         // true
        lastUpdate: eventArray[17] as string,           // ""
        markets: Array.isArray(eventArray[20]) ? (eventArray[20] as unknown[]).map((market: unknown) => {
          const marketArray = market as unknown[];
          return {
            id: marketArray[0] as string,                    // ID do market
            name: marketArray[1] as string,                  // Nome do market
            displayName: marketArray[2] as string | null,    // Display name
            description: marketArray[3] as string,           // Descrição
            outcomes: Array.isArray(marketArray[13]) ? (marketArray[13] as unknown[])
              .filter((outcome: unknown) => outcome !== null && outcome !== undefined && Array.isArray(outcome))
              .map((outcome: unknown) => {
                const outcomeArray = outcome as unknown[];
                return {
                  id: outcomeArray[0] as string,               // ID do outcome
                  name: outcomeArray[1] as string,             // Nome do outcome
                  displayName: outcomeArray[2] as string,       // Display name
                  odds: outcomeArray[6] as number,             // Odds
                  isBlocked: outcomeArray[7] as boolean,      // Se está bloqueado (false = pode apostar)
                  array9: outcomeArray[8] as boolean,           // Desconhecido (era isSuspended)
                  oddsDisplay: outcomeArray[9] as string[],     // Display das odds
                  providerId: outcomeArray[10] as number,      // Provider ID
                  side: outcomeArray[11] as string,           // Lado (Home/Away/Draw)
                  displaySide: outcomeArray[12] as string       // Display do lado
                };
              }) : [],
            eventId: marketArray[6] as string,              // Event ID
            leagueId: marketArray[7] as string,            // League ID
            sportId: marketArray[8] as string,             // Sport ID
            startTime: marketArray[9] as string,           // Start time
            providerId: marketArray[10] as number,           // Provider ID
            lastUpdate: marketArray[11] as string,           // Last update
            marketType: marketArray[19] as string,          // Category Type
            marketType2: marketArray[20] as string           // League slug
          };
        }) : [],                                          // Mercados
        providerEventId: eventArray[21] as string,      // "638967881930679868"
        slug: eventArray[22] as string,                 // "Atlético-MG-vs-Ceará"
        leagueSlug: eventArray[23] as string            // "Brasileirão-Série-A"
      }));

      const data: FssbEventsResponse = {
        data: mappedEvents
      };
      
      return data;
    } catch (error) {
      console.error('❌ [FSSB API] Erro ao buscar eventos da liga:', error);
      throw new Error(`Falha ao buscar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Busca detalhes de um evento específico
   */
  async getEventDetails(params: EventDetailsParams): Promise<FssbEventDetailsResponse> {
    const { eventId } = params;

    // Inicializar tokens se necessário
    await this.initializeTokens();

    const url = new URL(`${FSSB_BASE_URL}/api/eventpage/events/${eventId}`);
    url.searchParams.append('hideX25X75Selections', 'false');

    try {
      const requestHeaders = {
        'Authorization': this.authorization,
        'Session': this.session,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Cookie': `authorization=${this.authorization}; session=${this.session}`,
        'Accept': 'application/json',
        'Origin': 'https://7k.bet.br',
        'Referer': 'https://7k.bet.br/',
      };
      
      console.log('🌐 [FSSB API] Fazendo requisição para detalhes do evento:', url.toString());
      console.log('📤 [FSSB API] Headers enviados:', Object.keys(requestHeaders));
      console.log('🔑 [FSSB API] Authorization:', this.authorization.substring(0, 50) + '...');
      console.log('🍪 [FSSB API] Session:', this.session.substring(0, 50) + '...');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: requestHeaders,
      });

      if (!response.ok) {
        // Tentar ler o corpo da resposta para debug
        try {
          const errorText = await response.text();
          console.error('📄 [FSSB API] Corpo da resposta de erro:', errorText.substring(0, 1000));
        } catch {
          console.error('❌ [FSSB API] Não foi possível ler o corpo da resposta');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
            
      // Mapear os dados do array para objetos FssbEvent
      const mappedEvents: FssbEvent[] = rawData.data.map((eventArray: unknown[]) => ({
        id: eventArray[0] as string,                    // "766498955642302464"
        leagueId: eventArray[1] as string,              // "677879777860075520"
        leagueName: eventArray[2] as string,            // "Brasileirão Série A"
        sportId: eventArray[3] as string,               // "1"
        sportName: eventArray[4] as string,             // "Futebol"
        countryId: eventArray[5] as string,             // "29"
        countryCode: eventArray[6] as string,           // "BR"
        countryName: eventArray[7] as string,           // "Brasil"
        teams: (eventArray[8] as unknown[]).map((team: unknown) => {
          const teamArray = team as unknown[];
          return {
            id: teamArray[0] as string,
            name: typeof teamArray[1] === 'object' ? 
              (teamArray[1] as Record<string, string>)['BR-PT'] || 
              (teamArray[1] as Record<string, string>)['EN'] || 
              Object.values(teamArray[1] as Record<string, string>)[0] : 
              teamArray[1] as string,
            side: teamArray[2] as 'Home' | 'Away',
            type: (teamArray[3] as string) || 'Unknown',
            logo: teamArray[4] as string || undefined
          };
        }),
        providerId: eventArray[9] as number,            // 1602
        name: eventArray[10] as string,                 // "Atlético MG vs Ceará"
        startTime: eventArray[11] as string,            // "2025-10-25T19:00:00.000Z"
        status: eventArray[12] as string[],              // Status do evento
        isLive: eventArray[13] as boolean,              // false
        array14: eventArray[14] as boolean,             // false
        gameStatus: eventArray[15] as FssbGameStatus,   // Status do jogo
        isPostponed: eventArray[16] as boolean,         // true
        lastUpdate: eventArray[17] as string,           // ""
        providerEventId: eventArray[19] as string,          // string id de algumac coisa
        //marketType2: marketArray[20] as string           // League slug
        markets: Array.isArray(eventArray[20]) ? (eventArray[20] as unknown[]).map((market: unknown): FssbMarket => {
          const marketArray = market as unknown[];
          return {
            _id: marketArray[0] as string,                    // ID do market
            name: marketArray[1] as string,                  // Nome do market
            displayName: marketArray[2] as string | null,    // Display name
            description: marketArray[3] as string,           // Descrição
            array4: marketArray[4] as string,                // Desconhecido
            array5: marketArray[5] as string,                // Desconhecido
            eventId: marketArray[6] as string,              // Event ID
            leagueId: marketArray[7] as string,            // League ID
            sportId: marketArray[8] as string,             // Sport ID
            startTime: marketArray[9] as string,           // Start time
            array10: marketArray[10] as string,              // Desconhecido
            array11: marketArray[11] as string,              // Desconhecido
            array12: marketArray[12] as string,              // Desconhecido
            outcomes: Array.isArray(marketArray[13]) ? (marketArray[13] as unknown[])
              .filter((outcome: unknown) => outcome !== null && outcome !== undefined && Array.isArray(outcome))
              .map((outcome: unknown): FssbOutcome => {
                const outcomeArray = outcome as unknown[];
                return {
                  id: outcomeArray[0] as string,              // ID do outcome
                  name: outcomeArray[1] as string,             // Nome do outcome
                  displayName: outcomeArray[2] as string,      // Display name
                  TypeName: outcomeArray[3] as string,         // TypeName
                  array2: outcomeArray[4] as string,           // Desconhecido
                  isSuspense: outcomeArray[5] as boolean,      // Se a odd está suspensa (true = não mostrar)
                  odds: outcomeArray[6] as number,             // Odds
                  isBlocked: outcomeArray[7] as boolean,        // Se está bloqueado (false = pode apostar)
                  oddsDisplay: outcomeArray[8] as string[],    // Display das odds
                  array9: outcomeArray[9] as boolean,           // Desconhecido (era isSuspended)
                  providerId: outcomeArray[10] as number,      // Provider ID
                  OutcomeType: outcomeArray[11] as string,     // Lado (Home/Away/Draw)
                  MarketId: outcomeArray[12] as string,         // Market ID
                  array4: outcomeArray[13] as string,           // Desconhecido
                  array5: outcomeArray[14] as string,           // Desconhecido
                  array6: outcomeArray[15] as string,           // Desconhecido
                  Points: outcomeArray[16] as string,           // Points Handicap
                  marketType: outcomeArray[19] as string        // Market Type
                };
              }) : [],
            array14: marketArray[14] as string,              // Desconhecido
            array15: marketArray[15] as string,              // Desconhecido
            array16: marketArray[16] as string,              // Desconhecido
            array17: marketArray[17] as string,              // Desconhecido
            array18: marketArray[18] as string,              // Desconhecido
            marketType: Array.isArray(marketArray[19]) ? marketArray[19] as string[] : [marketArray[19] as string], // Market Type
            array20: marketArray[20] as string,              // Desconhecido
            array21: marketArray[21] as string,              // Desconhecido
            array22: marketArray[22] as string,              // Desconhecido
            array23: marketArray[23] as string,              // Desconhecido
            array24: marketArray[24] as string,              // Desconhecido
            array25: marketArray[25] as string,              // Desconhecido
            array26: marketArray[26] as string,              // Desconhecido
            array27: marketArray[27] as string,              // Desconhecido
            array28: marketArray[28] as string,              // Desconhecido
            array29: marketArray[29] as string,              // Desconhecido
          };
        }) : [],                                        // Mercados
        slug: eventArray[21] as string,                 // "Atlético-MG-vs-Ceará"
        leagueSlug: eventArray[22] as string,           // "Brasileirão-Série-A"
        countrySlug: eventArray[23] as string,          // "Brasil"
        sportSlug: eventArray[24] as string,            // "Futebol"
        array25: eventArray[25] as unknown[],             // Array desconhecido [25]
        array26: eventArray[26] as unknown[],             // Array desconhecido [26]
        array27: eventArray[27] as unknown[],             // Array desconhecido [27]
        Fixture: eventArray[28] as unknown[],             // Fixture
        colorsInfo: eventArray[29] as unknown[],          // colorsInfo
        marketsTypes: (eventArray[30] as unknown[])?.map((marketType: unknown) => {
          const marketTypeArray = marketType as unknown[];
          return {
            id: marketTypeArray[2] as number,           // ID único do tipo de mercado
            name: marketTypeArray[0] as string,        // Nome do tipo de mercado
            displayName: marketTypeArray[1] as string, // Nome de exibição (geralmente igual ao name)
            category: marketTypeArray[0] as string     // Categoria (derivada do nome)
          };
        }) || [], // "MarketsType",
        array31: eventArray[31] as unknown[],             // Array desconhecido [31]
        array32: eventArray[32] as unknown[],             // Array desconhecido [32]
        array33: eventArray[33] as unknown[],             // Array desconhecido [33]
        array34: eventArray[34] as unknown[],             // Array desconhecido [34]
        array35: eventArray[35] as unknown[],             // Array desconhecido [35]
        array36: eventArray[36] as unknown[],             // Array desconhecido [36]
        array37: eventArray[37] as unknown[]            // Array desconhecido [37]
      }));

      const data: FssbEventDetailsResponse = {
        data: mappedEvents
      };
      
      console.log('🎯 [FSSB API] Detalhes do evento obtidos:', mappedEvents.length, 'eventos');
      
      return data;
    } catch (error) {
      console.error('❌ [FSSB API] Erro ao buscar detalhes do evento:', error);
      throw new Error(`Falha ao buscar detalhes do evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

// Exportar também a classe para casos especiais
export default FssbApiService;

// Exportar instância singleton (após todos os métodos serem definidos)
export const fssbApi = FssbApiService.getInstance();
