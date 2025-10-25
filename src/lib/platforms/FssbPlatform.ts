import { BasePlatform } from './BasePlatform';
import { 
  UserToken, 
  PlatformToken, 
  BetData, 
  BetResult, 
  UserProfile,
  FssbBetslipRequest,
  FssbBetslipResponse,
  FssbBetsRequest,
  FssbBetsResponse,
  FssbBetError
} from '@/types';

// Interface estendida para BetData com campos específicos do FSSB
interface FssbBetData extends BetData {
  platform?: string;
  fssbSelections?: FssbBetslipRequest[];
}
import axios, { AxiosRequestConfig } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { appendFileSync } from 'fs';
import { join } from 'path';

export class FssbPlatform extends BasePlatform {
  private siteName: string;
  private userAgent: string;
  private sessionCookies: string = '';
  private platformUrl: string;
  private savedCookies: string = ''; // Cookies salvos do banco de dados
  private customerId: number | null = null; // Customer ID extraído da página
  private cookieJar: CookieJar; // Cookie jar para gerenciar cookies automaticamente

  constructor(siteName: string, baseUrl: string, savedCookies?: string) {
    // Determinar a URL da plataforma baseada no site
    const platformUrl = FssbPlatform.getPlatformUrl(siteName);
    
    super(
      baseUrl,
      platformUrl,
      siteName
    );
    this.siteName = siteName;
    this.platformUrl = platformUrl;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
    this.savedCookies = savedCookies || '';
    
    // Criar cookie jar e configurar axios com suporte a cookies
    this.cookieJar = new CookieJar();
    this.httpClient = wrapper(axios.create({ 
      jar: this.cookieJar,
      withCredentials: true 
    }));
  }

  /**
   * Obter URL da plataforma baseada no site
   */
  private static getPlatformUrl(siteName: string): string {
    switch (siteName.toLowerCase()) {
      case 'bet7k':
        return 'https://prod20350-kbet-152319626.fssb.io';
      case 'pixbet':
        return 'https://prod20383.fssb.io';
      default:
        throw new Error(`Site não suportado: ${siteName}`);
    }
  }

  /**
   * Salvar log em arquivo .txt
   */
  private saveLogToFile(message: string, data?: unknown) {
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      
      if (data) {
        // Função para limpar objetos com referências circulares
        const cleanData = this.cleanCircularReferences(data);
        const dataString = typeof cleanData === 'string' ? cleanData : JSON.stringify(cleanData, null, 2);
        const fullMessage = `${logMessage}${dataString}\n${'='.repeat(80)}\n\n`;
        
        const logPath = join(process.cwd(), 'logs', `${this.siteName}_debug.log`);
        appendFileSync(logPath, fullMessage, 'utf8');
      } else {
        const logPath = join(process.cwd(), 'logs', `${this.siteName}_debug.log`);
        appendFileSync(logPath, logMessage, 'utf8');
      }
    } catch (error) {
      console.error('Erro ao salvar log:', error);
    }
  }

  /**
   * Limpar referências circulares de objetos para serialização JSON
   */
  private cleanCircularReferences(obj: unknown, seen = new WeakSet()): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular Reference]';
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanCircularReferences(item, seen));
    }

    const cleaned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Pular propriedades que podem causar problemas
        if (key === 'request' || key === 'response' || key === 'config') {
          cleaned[key] = '[Complex Object]';
        } else {
          cleaned[key] = this.cleanCircularReferences((obj as Record<string, unknown>)[key], seen);
        }
      }
    }

    return cleaned;
  }

  /**
   * Método auxiliar para fazer requisições HTTP com captura de cookies
   */
  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const requestId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    try {
      // Com cookie jar, não precisamos gerenciar cookies manualmente
      // O axios-cookiejar-support faz isso automaticamente
      
      // Capturar cookies detalhados antes da requisição
      const cookiesBeforeRequest = this.cookieJar.getCookiesSync(config.url as string);
      const cookieStringBeforeRequest = cookiesBeforeRequest.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
      
      console.log(`🍪 [${requestId}] Cookies antes da requisição ${config.method} ${config.url}:`);
      console.log(`📋 Cookie Jar (${cookiesBeforeRequest.length} cookies):`, cookieStringBeforeRequest);
      
      // Log detalhado da requisição
      const requestLog = {
        requestId,
        timestamp,
        siteName: this.siteName,
        integration: this.integration,
        url: config.url,
        method: config.method,
        headers: config.headers,
        body: config.data,
        cookieJarCookies: cookiesBeforeRequest,
        cookieJarCookiesString: cookieStringBeforeRequest,
        withCredentials: config.withCredentials,
        maxBodyLength: config.maxBodyLength
      };
      
      this.saveLogToFile(`🚀 [${requestId}] REQUISIÇÃO - ${this.integration}`, requestLog);
      
      const response = await this.httpClient.request(config);
      
      // Capturar cookies após a resposta
      const cookiesAfterResponse = this.cookieJar.getCookiesSync(config.url as string);
      const cookieStringAfterResponse = cookiesAfterResponse.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
      
      console.log(`🍪 [${requestId}] Cookies após a resposta ${config.method} ${config.url}:`);
      console.log(`📋 Cookie Jar (${cookiesAfterResponse.length} cookies):`, cookieStringAfterResponse);
      
      // Log detalhado da resposta
      const responseLog = {
        requestId,
        timestamp: new Date().toISOString(),
        siteName: this.siteName,
        integration: this.integration,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        cookies: response.headers['set-cookie'],
        cookieJarCookies: cookiesAfterResponse,
        cookieJarCookiesString: cookieStringAfterResponse,
        responseTime: Date.now() - new Date(timestamp).getTime()
      };
      
      this.saveLogToFile(`✅ [${requestId}] RESPOSTA - ${this.integration}`, responseLog);
      
      return response.data;
    } catch (error: unknown) {
      const errorLog = {
        requestId,
        timestamp: new Date().toISOString(),
        siteName: this.siteName,
        integration: this.integration,
        url: config.url,
        method: config.method,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        axiosError: null as Record<string, unknown> | null
      };
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            statusText?: string;
            headers?: unknown; 
            data?: unknown 
          };
          request?: unknown;
          code?: string;
        };
        
        errorLog.axiosError = {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          headers: axiosError.response?.headers,
          data: axiosError.response?.data,
          code: axiosError.code
        };
      }
      
      this.saveLogToFile(`❌ [${requestId}] ERRO - ${this.integration}`, errorLog);
      
      throw error;
    }
  }

  /**
   * Login é feito na base do site, não na plataforma FSSB
   */
  async login(): Promise<never> {
    throw new Error('Login deve ser feito através do SiteAuthService');
  }

  /**
   * Etapa 2: Gerar token de usuário
   */
  async generateToken(): Promise<UserToken> {
    // TODO: Implementar geração de token específica do FSBB
    throw new Error('Método generateToken não implementado para FSBB');
  }

  /**
   * SignIn na plataforma de apostas (capturar cookies do link)
   */
  async signIn(platformUrl: string): Promise<PlatformToken & { platformCustomerId?: number }> {
    try {
      //console.log(`🍪 Capturando cookies da plataforma: ${platformUrl}`);

      // Fazer GET na URL da plataforma para capturar cookies
      const [platformCookies, platformCustomerId] = await this.getPlatformCookies(platformUrl);

      // Retornar o token da plataforma (cookies capturados) e customerId
      return {
        accessToken: platformCookies || platformUrl, // Fallback para URL se não conseguir cookies
        currency: 'BRL',
        isUserLocked: false,
        isAgency: false,
        currencySign: 'R$',
        currencyId: 1,
        currencyDisplay: 2,
        encryptedPlayerId: '',
        regDate: new Date().toISOString(),
        platformCustomerId: platformCustomerId || undefined
      };

    } catch (error) {
      console.error('Erro ao capturar cookies da plataforma FSSB:', error);
      throw new Error('Erro ao capturar cookies da plataforma');
    }
  }

  /**
   * Extrair customerId do HTML usando múltiplos padrões
   */
  private extractCustomerIdFromHtml(htmlContent: string): number | null {
    const patterns = [
      // Padrão original
      /'customerId':(\d+)/,
      // Padrão dentro de window.APP_USER_DATA
      /window\.APP_USER_DATA.*?'customerId':(\d+)/,
      // Padrão mais genérico
      /customerId['"]\s*:\s*(\d+)/,
      // Padrão com aspas duplas
      /"customerId":(\d+)/,
      // Padrão com espaços
      /customerId\s*:\s*(\d+)/
    ];

    for (const pattern of patterns) {
      const match = htmlContent.match(pattern);
      if (match) {
        const customerId = parseInt(match[1]);
        this.saveLogToFile(`🆔 Customer ID extraído`, { 
          customerId,
          pattern: pattern.toString(),
          match: match[0]
        });
        return customerId;
      }
    }

    // Se nenhum padrão funcionou, salvar debug
    this.saveLogToFile(`⚠️ Customer ID não encontrado`, {
      htmlLength: htmlContent.length,
      htmlSnippet: htmlContent.substring(0, 1000)
    });

    return null;
  }

  /**
   * Função específica para capturar cookies da URL da plataforma FSSB
   */
  private async getPlatformCookies(platformUrl: string): Promise<[string | null, number | null]> {
    try {
      const response = await this.httpClient.get(platformUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-CH-UA': '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'cross-site',
          'Sec-Fetch-User': '?1',
          'Sec-GPC': '1',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': this.userAgent
        },
        maxRedirects: 5,
        timeout: 10000,
        responseType: 'text',
        responseEncoding: 'utf8'
      });

      // Extrair customerId do HTML
      const htmlContent = response.data;
      this.customerId = this.extractCustomerIdFromHtml(htmlContent);

      // Obter cookies do cookie jar
      const cookies = this.cookieJar.getCookiesSync(platformUrl);
      const cookieString = cookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
      
      // Salvar cookies na instância
      this.sessionCookies = cookieString;

      // Retornar cookies e customerId
      return [cookieString, this.customerId];

    } catch (error) {
      console.error('Erro ao capturar cookies da plataforma:', error);
      return [null, null];
    }
  }

  /**
   * Obter betslip atual
   */
  async getBetslip(): Promise<FssbBetslipResponse[]> {
    const config = {
      method: 'GET',
      url: `${this.platformUrl}/api/betslip/betslip?initial=true`,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': this.platformUrl,
        'Referer': this.platformUrl
      }
    };

    try {
      const data = await this.makeRequest<FssbBetslipResponse[]>(config);
      return data;
    } catch (error) {
      console.error('Erro ao obter betslip:', error);
      throw new Error('Erro ao obter betslip');
    }
  }

  /**
   * Limpar betslip (enviar array vazio)
   */
  async clearBetslip(): Promise<void> {
    const config = {
      method: 'POST',
      url: `${this.platformUrl}/api/betslip/betslip`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: []
    };

    try {
      await this.makeRequest(config);
      console.log(`✅ Betslip limpo com sucesso`);
    } catch (error) {
      console.error('Erro ao limpar betslip:', error);
      
      // Log detalhado do erro para debug
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            statusText?: string;
            data?: unknown 
          };
        };
        
        console.error(`📥 Status: ${axiosError.response?.status}`);
        console.error(`📥 Status Text: ${axiosError.response?.statusText}`);
        console.error(`📥 Response Data:`, axiosError.response?.data);
      }
      
      throw new Error('Erro ao limpar betslip');
    }
  }

  /**
   * Adicionar seleções ao betslip
   */
  async addToBetslip(selections: unknown[]): Promise<FssbBetslipResponse[]> {
    const config = {
      method: 'POST',
      url: `${this.platformUrl}/api/betslip/betslip`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.getSessionCookies(),
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': this.platformUrl,
        'Referer': this.platformUrl
      },
      data: selections,
      withCredentials: true
    };

    try {
      const data = await this.makeRequest<FssbBetslipResponse[]>(config);
      return data;
    } catch (error) {
      console.error('Erro ao adicionar ao betslip:', error);
      throw new Error('Erro ao adicionar seleções ao betslip');
    }
  }

  /**
   * Fazer a aposta final
   */
  async placeBets(betsRequest: FssbBetsRequest[]): Promise<FssbBetsResponse | unknown> {
    // Capturar cookies antes da requisição
    const cookiesBeforeRequest = this.cookieJar.getCookiesSync(this.platformUrl);
    const cookieStringBeforeRequest = cookiesBeforeRequest.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
    
    // Extrair cookies específicos
    const authorizationCookie = this.getAuthorizationCookie();
    const sessionCookie = this.getSessionCookie();
    
    console.log(`🍪 Cookies antes da requisição placeBets:`);
    console.log(`📋 Cookie Jar (${cookiesBeforeRequest.length} cookies):`, cookieStringBeforeRequest);
    console.log(`📋 Session Cookies:`, this.sessionCookies);
    console.log(`🔑 Authorization Cookie:`, authorizationCookie);
    console.log(`🔑 Session Cookie:`, sessionCookie);
    
    // Listar todos os cookies para debug
    this.listAllCookies();
    
    const config = {
      method: 'POST',
      url: `${this.platformUrl}/api/betslip/bets`,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Ct-Request-Id': this.generateRequestId(),
        'Origin': this.platformUrl,
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Referer': `${this.platformUrl}/br-pt/spbk`,
        'Time-Area': '1',
        'User-Agent': this.userAgent,
        'Accept-Encoding': 'gzip, deflate, br',
        // Adicionar cookies específicos se existirem
        ...(authorizationCookie && { 'Authorization': authorizationCookie }),
        ...(sessionCookie && { 'Session': sessionCookie })
      },
      data: betsRequest,
      withCredentials: true
    };

    try {
      const data = await this.makeRequest<FssbBetsResponse | unknown>(config);
      
      // Capturar cookies após a requisição
      const cookiesAfterRequest = this.cookieJar.getCookiesSync(this.platformUrl);
      const cookieStringAfterRequest = cookiesAfterRequest.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
      
      console.log(`🍪 Cookies após a requisição placeBets:`);
      console.log(`📋 Cookie Jar (${cookiesAfterRequest.length} cookies):`, cookieStringAfterRequest);
      
      return data;
    } catch (error: unknown) {
      console.error('Erro ao fazer aposta:', error);
      
      // Tratamento detalhado de erro
      if (error && typeof error === 'object' && 'response' in error) {
        // Erro com resposta do servidor
        const axiosError = error as { response: { status: number; statusText: string; data: unknown } };
        const status = axiosError.response.status;
        const statusText = axiosError.response.statusText;
        const responseData = axiosError.response.data;
        
        console.error(`❌ Erro HTTP ${status}: ${statusText}`);
        console.error(`📋 Response Body:`, JSON.stringify(responseData, null, 2));
        
        // Criar objeto de erro estruturado
        const structuredError = {
          success: false,
          error: `HTTP ${status}: ${statusText}`,
          details: responseData,
          statusCode: status,
          statusText: statusText,
          timestamp: new Date().toISOString()
        };
        
        return structuredError;
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Erro de rede (sem resposta)
        console.error('❌ Erro de rede - sem resposta do servidor');
        console.error('📋 Request config:', JSON.stringify((error as unknown as { config: unknown }).config, null, 2));
        
        const structuredError = {
          success: false,
          error: 'Erro de rede - sem resposta do servidor',
          details: {
            message: (error as unknown as { message: string }).message,
            code: (error as unknown as { code: string }).code,
            config: (error as unknown as { config: unknown }).config
          },
          statusCode: 0,
          statusText: 'Network Error',
          timestamp: new Date().toISOString()
        };
        
        return structuredError;
      } else {
        // Outros erros
        console.error('❌ Erro desconhecido:', error);
        
        const structuredError = {
          success: false,
          error: (error as { message: string })?.message || 'Erro desconhecido',
          details: {
            message: (error as { message: string })?.message,
            stack: (error as { stack: string })?.stack
          },
          statusCode: 0,
          statusText: 'Unknown Error',
          timestamp: new Date().toISOString()
        };
        
        return structuredError;
      }
    }
  }

  /**
   * Gerar ID único para requisição
   */
  generateRequestId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Construir objeto de aposta baseado nos dados do betslip
   */
  buildBetsRequest(
    betslipData: FssbBetslipResponse[], 
    stakes: number[]
  ): FssbBetsRequest[] {
    return betslipData.map((item, index) => {
      const selection = item.market.Changeset.Selection;
      const event = item.event.Changeset;
      const stake = stakes[index] || stakes[0]; // Usar stake específico ou o primeiro como fallback
      
      return {
        betName: "single bet",
        type: "single",
        count: stake.toString(),
        selectionsMapped: [{
          id: selection._id,
          trueOdds: selection.TrueOdds,
          displayOdds: selection.DisplayOdds,
          ...(selection.Points !== undefined && { points: selection.Points }), // Só incluir se existir
          marketId: selection.MarketId,
          eventId: selection.EventId,
          timestamp: item.timestamp,
          intervalTiming: item.intervalTiming,
          promotionIds: []
        }],
        trueOdds: selection.TrueOdds,
        displayOdds: selection.DisplayOdds,
        clientOdds: selection.DisplayOdds.Decimal,
        comboSize: 0,
        isLive: event.IsLive,
        numberOfLines: 1,
        maxStake: selection.Settings.MaxWin / selection.TrueOdds,
        minStake: selection.Settings.MinBet,
        numberOfBets: 1,
        oddStyleID: "1",
        sportID: parseInt(selection.SportId),
        feRequestTime: new Date().toISOString(),
        metaData: {
          device: "desktop",
          isTablet: false,
          bettingView: "EU Modern View",
          balancePriority: 1,
          fullURL: `${this.platformUrl}/br-pt/spbk/${event.SportName}/${event.UrlRegionName}/${event.UrlLeagueName}/${event.UrlEventName}/${event._id}`,
          userAgent: this.userAgent,
          shareBetSlipCode: "",
          refererDomain: "undefined",
          highMarginConfig: {
            enableTestCustomer: false,
            enableOperatorContribution: false,
            numberOfSelections: 2,
            marketTypeIds: [
              "QA60", "ML1", "OU257", "HC2220", "HC270", "QA144", "OU201", "QA158", "OU1446",
              "QA61", "QA62", "QA291", "ML656", "HC628", "OU677", "OU641", "QA658", "QA687",
              "QA633", "ML623", "QA646", "QA626", "QA644"
            ]
          },
          siteOption: true,
          featuredSelections: []
        },
        selectionsNames: [{
          id: selection._id,
          selectionName: selection.Name
        }],
        selectionsPlaced: [selection._id],
        stake: stake.toString(),
        potentialReturns: Math.round(stake * selection.TrueOdds * 100) / 100,
        freeBet: {
          id: 0,
          amount: 0,
          gainDecimal: 0,
          isRiskFreeBet: false
        },
        JackpotContribution: {},
        calculationSettings: {
          useNewCalculationSettings: true,
          oddsRoundingMode: 0,
          gainRoundingMode: 1,
          roundCombinationOdds: false
        },
        fotd: this.customerId ? this.customerId + new Date().getDate() : 162225011,
        tags: [],
        solution: "1"
      };
    });
  }

  /**
   * Etapa 4: Fazer a aposta
   */
  async placeBet(platformToken: string, betData: BetData): Promise<BetResult> {
    try {
      // Extrair dados da aposta - verificar se vem do formato FSSB ou Biahosted
      let selections: FssbBetslipRequest[];
      let stake: number;
      
      const fssbBetData = betData as FssbBetData;
      
      if (fssbBetData.platform === 'fssb' && fssbBetData.fssbSelections) {
        // Formato FSSB direto
        selections = fssbBetData.fssbSelections;
        stake = betData.stakes[0] || 0.1;
        console.log(`🎯 Usando formato FSSB direto: ${selections.length} seleções`);
      } else {
        // Formato Biahosted (conversão)
        selections = betData.betMarkets.map(market => 
          market.odds.map(odd => ({
            selectionId: odd.id.toString(),
            viewKey: 1,
            isCrossBet: false,
            isAddedToBetslip: false,
            isDynamicMarket: false,
            isBetBuilderBet: false
          }))
        ).flat();
        stake = betData.stakes[0] || 0.1;
        console.log(`🎯 Convertendo formato Biahosted para FSSB: ${selections.length} seleções`);
      }

      this.saveLogToFile(`🎯 Iniciando processo de aposta`, {
        selections,
        stake,
        platformToken: platformToken.substring(0, 50) + '...'
      });

      // 1. Verificar se há apostas no betslip
      const currentBetslip = await this.getBetslip();
      
      if (currentBetslip.length > 0) {
        this.saveLogToFile(`🧹 Limpando betslip existente`, { count: currentBetslip.length });
        await this.clearBetslip();
      }

      // 2. Adicionar seleções ao betslip
      this.saveLogToFile(`➕ Adicionando seleções ao betslip`, { selections });
      const betslipData = await this.addToBetslip(selections) as FssbBetslipResponse[];

      if (betslipData.length === 0) {
        throw new Error('Nenhuma seleção foi adicionada ao betslip');
      }

      // 3. Construir requisição de aposta
      const stakes = betData.stakes || [stake]; // Usar array de stakes ou fallback para stake único
      const betsRequest = this.buildBetsRequest(betslipData, stakes);
      
      this.saveLogToFile(`📝 Construindo requisição de aposta`, {
        betsCount: betsRequest.length,
        totalStake: stake,
        potentialReturns: betsRequest.reduce((sum, bet) => sum + bet.potentialReturns, 0),
        customerId: this.customerId,
        fotd: betsRequest[0]?.fotd,
        fotdCalculation: this.customerId ? `${this.customerId} + ${new Date().getDate()} = ${this.customerId + new Date().getDate()}` : 'fallback: 162225011'
      });

      // 4. Fazer a aposta
      const betResult = await this.placeBets(betsRequest);

      // Verificar se houve erro na aposta
      if ('error' in (betResult as object)) {
        const error = betResult as FssbBetError;
        this.saveLogToFile(`❌ Erro na aposta`, error);
        
        return {
          bets: [],
          error: `Aposta rejeitada: ${error.error.declineReasons.map(r => r.name).join(', ')}`
        };
      }

      const successResult = betResult as FssbBetsResponse;
      
      this.saveLogToFile(`✅ Aposta realizada com sucesso`, {
        ticketId: successResult.SQLTicketID,
        status: successResult.status,
        potentialReturns: successResult.potentialReturns,
        betsCount: successResult.bets.length
      });

      // Converter resposta FSSB para formato padrão
      return {
        bets: successResult.bets.map(bet => ({
          id: bet.id,
          type: bet.type === 'single' ? 1 : 2,
          status: successResult.status === 'Open' ? 1 : 0,
          unitStake: bet.stake,
          totalStake: bet.stake,
          finalStake: bet.stake,
          openStake: bet.stake,
          totalWin: bet.potentialReturns,
          createdDate: new Date().toISOString(),
          combLength: bet.comboSize,
          linesCount: bet.numberOfLines,
          currency: 'BRL',
          selections: bet.selections.map(selection => ({
            id: parseInt(selection._id),
            status: 1,
            price: parseFloat(selection.ClientOdds),
            priceType: 1,
            name: selection.Name,
            spec: selection.BetslipLine,
            marketName: selection.market.Name,
            marketTypeId: 1,
            isLive: selection.event.IsLive,
            isBetBuilder: false,
            isBanker: false,
            isVirtual: false,
            dbId: parseInt(selection._id),
            eventId: parseInt(selection.event._id),
            eventName: selection.event.EventName,
            eventDate: selection.event.StartEventDate,
            isLiveOrVirtual: selection.event.IsLive,
            sportTypeId: parseInt(selection.event.SportId),
            sportId: parseInt(selection.event.SportId),
            champId: parseInt(selection.event.LeagueId),
            catId: 1,
            marketId: parseInt(selection.market._id),
            selectionTypeId: selection.Side
          })),
          remainingTotalWin: bet.potentialReturns,
          cashOutValue: 0,
          partialCashOut: 0,
          bonus: 0,
          bonusPart: 0,
          initBonusPart: 0,
          bonusPartPercent: 0,
          bonusInsurance: 0,
          isCancelAllowed: true,
          totalOdds: bet.trueOdds
        }))
      };

    } catch (error) {
      this.saveLogToFile(`💥 Erro no processo de aposta`, error);
      throw error;
    }
  }

  /**
   * GetBalance é feito na base do site, não na plataforma FSSB
   */
  async getBalance(): Promise<never> {
    throw new Error('GetBalance deve ser feito através do SiteAuthService');
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile(platformToken: string): Promise<UserProfile> {
    const config = {
      method: 'GET',
      url: `${this.baseUrl}/api/users/profile`,
      headers: {
        'Authorization': `Bearer ${platformToken}`,
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': this.baseUrl,
        'Referer': this.baseUrl
      },
      withCredentials: true
    };

    try {
      const data = await this.makeRequest<UserProfile>(config);
      return data;
    } catch (error) {
      console.error('Erro ao obter perfil da conta FSSB:', error);
      throw new Error('Erro ao verificar perfil da conta');
    }
  }

  /**
   * Obter cookies de sessão atuais
   */
  getSessionCookies(): string {
    return this.sessionCookies || this.savedCookies;
  }

  /**
   * Extrair cookie específico do cookie jar
   */
  private getCookieValue(cookieName: string): string | null {
    const cookies = this.cookieJar.getCookiesSync(this.platformUrl);
    const cookie = cookies.find(c => c.key === cookieName);
    return cookie ? cookie.value : null;
  }

  /**
   * Obter cookie de Authorization
   */
  getAuthorizationCookie(): string | null {
    return this.getCookieValue('Authorization') || 
           this.getCookieValue('authorization') || 
           this.getCookieValue('auth') ||
           this.getCookieValue('token');
  }

  /**
   * Obter cookie de Session
   */
  getSessionCookie(): string | null {
    return this.getCookieValue('Session') || 
           this.getCookieValue('session') || 
           this.getCookieValue('sessionId') ||
           this.getCookieValue('JSESSIONID');
  }

  /**
   * Listar todos os cookies disponíveis para debug
   */
  listAllCookies(): void {
    const cookies = this.cookieJar.getCookiesSync(this.platformUrl);
    console.log(`🍪 Todos os cookies disponíveis (${cookies.length}):`);
    cookies.forEach((cookie, index) => {
      console.log(`  ${index + 1}. ${cookie.key} = ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
    });
  }

  /**
   * Definir cookies de sessão
   */
  setSessionCookies(cookies: string): void {
    this.sessionCookies = cookies;
  }

  /**
   * Receber cookies de sessão do SiteAuthService
   * Esta função é chamada após o login ser feito através do SiteAuthService
   */
  receiveSessionCookies(sessionCookies: string): void {
    console.log(`🍪 Recebendo cookies de sessão do SiteAuthService para ${this.siteName}`);
    console.log(`📝 Cookies recebidos: ${sessionCookies ? sessionCookies.substring(0, 100) + '...' : 'Nenhum'}`);
    
    this.sessionCookies = sessionCookies;
    
    // Log para debug
    this.saveLogToFile(`🍪 Cookies de sessão recebidos do SiteAuthService`, {
      siteName: this.siteName,
      cookiesLength: sessionCookies.length,
      cookiesPreview: sessionCookies.substring(0, 200),
      hasCookies: !!sessionCookies
    });
  }

  /**
   * Obter customer ID atual
   */
  getCustomerId(): number | null {
    return this.customerId;
  }

  /**
   * Definir customer ID
   */
  setCustomerId(customerId: number): void {
    this.customerId = customerId;
  }

  /**
   * Obter informações do site
   */
  getSiteInfo() {
    return {
      name: this.siteName,
      url: this.baseUrl,
      platformUrl: this.platformUrl,
      integration: this.integration,
      platform: 'fssb',
      userAgent: this.userAgent,
      customerId: this.customerId
    };
  }

  /**
   * Obter configurações específicas do site para login
   */
  getSiteLoginConfig() {
    switch (this.siteName.toLowerCase()) {
      case 'bet7k':
        return {
          requiresAppSource: false,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: [],
          siteUrl: 'https://7k.bet.br/',
          platformUrl: 'https://prod20350-kbet-152319626.fssb.io/api'
        };
      case 'pixbet':
        return {
          requiresAppSource: false,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: [],
          siteUrl: 'https://pix.bet.br/',
          platformUrl: 'https://prod20383.fssb.io/api'
        };
      default:
        return {
          requiresAppSource: false,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: [],
          siteUrl: this.baseUrl,
          platformUrl: this.platformUrl
        };
    }
  }
}
