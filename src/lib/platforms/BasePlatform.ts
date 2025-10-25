import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { LoginCredentials, AccessToken, UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';

export abstract class BasePlatform {
  protected baseUrl: string;
  protected apiUrl: string;
  protected integration: string;
  protected httpClient: AxiosInstance;

  constructor(baseUrl: string, apiUrl: string, integration: string) {
    this.baseUrl = baseUrl;
    this.apiUrl = apiUrl;
    this.integration = integration;
    
    this.httpClient = axios.create({
      timeout: 30000,
      withCredentials: true,
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    });
  }

  /**
   * Etapa 1: Login na plataforma
   */
  abstract login(credentials: LoginCredentials): Promise<AccessToken>;

  /**
   * Etapa 2: Gerar token de usuário
   */
  abstract generateToken(accessToken: string, userToken: string): Promise<UserToken>;

  /**
   * Etapa 3: SignIn na plataforma de apostas
   */
  abstract signIn(userToken: string): Promise<PlatformToken>;

  /**
   * Etapa 4: Fazer a aposta
   */
  abstract placeBet(platformToken: string, betData: BetData): Promise<BetResult>;

  /**
   * Verificar saldo da conta
   */
  abstract getBalance(platformToken: string): Promise<number>;

  /**
   * Obter perfil do usuário
   */
  abstract getProfile(platformToken: string): Promise<UserProfile>;

  /**
   * Obter betslip atual (apenas para plataformas que suportam)
   */
  abstract getBetslip(): Promise<unknown[]>;

  /**
   * Limpar betslip atual (apenas para plataformas que suportam)
   */
  abstract clearBetslip(): Promise<void>;

  /**
   * Adicionar seleções ao betslip (apenas para plataformas que suportam)
   */
  abstract addToBetslip(selections: unknown[]): Promise<unknown[]>;

  /**
   * Método auxiliar para fazer requisições HTTP
   */
  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      console.log(`🚀 Requisição para ${this.integration}:`);
      console.log(`📤 URL: ${config.url}`);
      console.log(`📤 Method: ${config.method}`);
      console.log(`📤 Headers:`, JSON.stringify(config.headers, null, 2));
      console.log(`📤 Body:`, JSON.stringify(config.data, null, 2));
      
      const response = await this.httpClient.request(config);
      
      console.log(`✅ Resposta de ${this.integration}:`);
      console.log(`📥 Status: ${response.status}`);
      console.log(`📥 Headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`📥 Body:`, JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ Erro na requisição para ${this.integration}:`);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; headers?: unknown; data?: unknown } };
        console.error(`📥 Status: ${axiosError.response?.status}`);
        console.error(`📥 Headers:`, JSON.stringify(axiosError.response?.headers, null, 2));
        console.error(`📥 Body:`, JSON.stringify(axiosError.response?.data, null, 2));
      }
      console.error(`❌ Erro:`, error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    }
  }

  /**
   * Método auxiliar para criar payload de aposta
   */
  protected createBetPayload(betData: BetData): Record<string, unknown> {
    return {
      culture: betData.culture || 'pt-BR',
      timezoneOffset: betData.timezoneOffset || 180,
      integration: betData.integration || this.integration,
      deviceType: betData.deviceType || 1,
      numFormat: betData.numFormat || 'en-GB',
      countryCode: betData.countryCode || 'BR',
      betType: betData.betType || 0,
      isAutoCharge: betData.isAutoCharge || false,
      stakes: betData.stakes || [1],
      oddsChangeAction: betData.oddsChangeAction || 0,
      betMarkets: betData.betMarkets || [],
      eachWays: betData.eachWays || [false],
      requestId: betData.requestId || this.generateRequestId(),
      confirmedByClient: betData.confirmedByClient || false,
      device: betData.device || 0
    };
  }

  /**
   * Gerar ID único para requisições
   */
  protected generateRequestId(): string {
    return 'AutoBet-' + Math.random().toString(36).substr(2, 9);
  }
}
