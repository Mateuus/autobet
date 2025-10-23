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

export interface FssbEvent {
  id: string;                    // "766498955642302464" - ID do evento
  leagueId: string;              // "677879777860075520" - ID da liga
  leagueName: string;            // "Brasileirão Série A" - Nome da liga
  sportId: string;               // "1" - ID do esporte
  sportName: string;             // "Futebol" - Nome do esporte
  countryId: string;             // "29" - ID do país
  countryCode: string;           // "BR" - Código do país
  countryName: string;           // "Brasil" - Nome do país
  teams: FssbTeam[];             // Array de times
  providerId: number;            // 1602 - ID do provedor
  name: string;                  // "Atlético MG vs Ceará" - Nome do evento
  startTime: string;             // "2025-10-25T19:00:00.000Z" - Data/hora de início
  status: string[];              // Status do evento
  isLive: boolean;               // false - Se está ao vivo
  isSuspended: boolean;          // false - Se está suspenso
  gameStatus: FssbGameStatus;    // Status do jogo
  isPostponed: boolean;          // true - Se foi adiado
  lastUpdate: string;            // "" - Última atualização
  markets: unknown[];            // Mercados de apostas
  providerEventId: string;       // "638967881930679868" - ID do evento no provedor
  slug: string;                  // "Atlético-MG-vs-Ceará" - Slug para URL
  leagueSlug: string;            // "Brasileirão-Série-A" - Slug da liga
}

export interface FssbEventsResponse {
  data: FssbEvent[];
}

export interface LeagueEventsParams {
  leagueId: string;
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
        isSuspended: eventArray[14] as boolean,         // false
        gameStatus: eventArray[15] as FssbGameStatus,   // Status do jogo
        isPostponed: eventArray[16] as boolean,         // true
        lastUpdate: eventArray[17] as string,           // ""
        markets: eventArray[18] as unknown[],           // Mercados
        providerEventId: eventArray[19] as string,      // "638967881930679868"
        slug: eventArray[20] as string,                 // "Atlético-MG-vs-Ceará"
        leagueSlug: eventArray[21] as string            // "Brasileirão-Série-A"
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
}

// Exportar também a classe para casos especiais
export default FssbApiService;

// Exportar instância singleton (após todos os métodos serem definidos)
export const fssbApi = FssbApiService.getInstance();
