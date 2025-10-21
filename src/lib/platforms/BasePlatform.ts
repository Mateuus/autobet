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
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
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
   * Método auxiliar para fazer requisições HTTP
   */
  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.httpClient.request(config);
      return response.data;
    } catch (error: unknown) {
      console.error(`Erro na requisição para ${this.integration}:`, error instanceof Error ? error.message : 'Erro desconhecido');
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
      integration: this.integration,
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
