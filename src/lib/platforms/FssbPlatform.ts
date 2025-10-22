import { BasePlatform } from './BasePlatform';
import { LoginCredentials, AccessToken, UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';
import { AxiosRequestConfig } from 'axios';
import { appendFileSync } from 'fs';
import { join } from 'path';

export class FssbPlatform extends BasePlatform {
  private siteName: string;
  private userAgent: string;
  private sessionCookies: string = '';
  private platformUrl: string;

  constructor(siteName: string, baseUrl: string) {
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
  }

  /**
   * Obter URL da plataforma baseada no site
   */
  private static getPlatformUrl(siteName: string): string {
    switch (siteName.toLowerCase()) {
      case 'bet7k':
        return 'https://prod20350-kbet-152319626.fssb.io/api';
      case 'pixbet':
        return 'https://prod20383.fssb.io/api';
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
      // Adicionar cookies se disponíveis
      if (this.sessionCookies) {
        config.headers = {
          ...config.headers,
          'Cookie': this.sessionCookies
        };
      }

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
        sessionCookies: this.sessionCookies,
        withCredentials: config.withCredentials,
        maxBodyLength: config.maxBodyLength
      };
      
      this.saveLogToFile(`🚀 [${requestId}] REQUISIÇÃO - ${this.integration}`, requestLog);
      
      const response = await this.httpClient.request(config);
      
      // Capturar cookies da resposta
      if (response.headers['set-cookie']) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
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
        sessionCookies: this.sessionCookies,
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
   * Etapa 1: Login na plataforma FSBB
   */
  async login(credentials: LoginCredentials): Promise<AccessToken> {
    const data = {
      login: credentials.email,
      email: credentials.email,
      password: credentials.password,
      app_source: 'web',
      captcha_token: ''
    };

    const config = {
      method: 'post',
      url: `${this.baseUrl}/api/auth/login`,
      headers: {
        'Origin': this.baseUrl,
        'User-Agent': this.userAgent,
        'Content-Type': 'application/json'
      },
      data,
      withCredentials: true,
      maxBodyLength: Infinity
    };

    const result = await this.makeRequest<AccessToken>(config);
    return result;
  }

  /**
   * Etapa 2: Gerar token de usuário
   */
  async generateToken(accessToken: string, userToken: string): Promise<UserToken> {
    // TODO: Implementar geração de token específica do FSBB
    throw new Error('Método generateToken não implementado para FSBB');
  }

  /**
   * Etapa 3: SignIn na plataforma de apostas
   */
  async signIn(userToken: string): Promise<PlatformToken> {
    // TODO: Implementar signIn específico do FSBB
    throw new Error('Método signIn não implementado para FSBB');
  }

  /**
   * Etapa 4: Fazer a aposta
   */
  async placeBet(platformToken: string, betData: BetData): Promise<BetResult> {
    // TODO: Implementar placeBet específico do FSBB
    throw new Error('Método placeBet não implementado para FSBB');
  }

  /**
   * Verificar saldo da conta
   */
  async getBalance(platformToken: string): Promise<number> {
    // TODO: Implementar getBalance específico do FSBB
    throw new Error('Método getBalance não implementado para FSBB');
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile(platformToken: string): Promise<UserProfile> {
    // TODO: Implementar getProfile específico do FSBB
    throw new Error('Método getProfile não implementado para FSBB');
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
      userAgent: this.userAgent
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
