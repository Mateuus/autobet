import { BasePlatform } from './BasePlatform';
import { UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';
import axios, { AxiosRequestConfig } from 'axios';
import { appendFileSync } from 'fs';
import { join } from 'path';

export class FssbPlatform extends BasePlatform {
  private siteName: string;
  private userAgent: string;
  private sessionCookies: string = '';
  private platformUrl: string;
  private savedCookies: string = ''; // Cookies salvos do banco de dados

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
      } else if (this.savedCookies) {
        // Usar cookies salvos do banco se não há cookies de sessão atuais
        config.headers = {
          ...config.headers,
          'Cookie': this.savedCookies
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
   * Login é feito na base do site, não na plataforma FSSB
   */
  async login(): Promise<never> {
    throw new Error('Login deve ser feito através do SiteAuthService');
  }

  /**
   * Etapa 2: Gerar token de usuário
   */
  async generateToken(accessToken: string, userToken: string): Promise<UserToken> {
    // TODO: Implementar geração de token específica do FSBB
    throw new Error('Método generateToken não implementado para FSBB');
  }

  /**
   * SignIn na plataforma de apostas (capturar cookies do link)
   */
  async signIn(platformUrl: string): Promise<PlatformToken> {
    try {
      console.log(`🍪 Capturando cookies da plataforma: ${platformUrl}`);

      // Fazer GET na URL da plataforma para capturar cookies
      const platformCookies = await this.getPlatformCookies(platformUrl);

      console.log(`✅ Cookies da plataforma capturados: ${platformCookies ? 'Sim' : 'Não'}`);

      // Retornar o token da plataforma (cookies capturados)
      return {
        accessToken: platformCookies || platformUrl, // Fallback para URL se não conseguir cookies
        currency: 'BRL',
        isUserLocked: false,
        isAgency: false,
        currencySign: 'R$',
        currencyId: 1,
        currencyDisplay: 2,
        encryptedPlayerId: '',
        regDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao capturar cookies da plataforma FSSB:', error);
      throw new Error('Erro ao capturar cookies da plataforma');
    }
  }

  /**
   * Função específica para capturar cookies da URL da plataforma FSSB
   */
  private async getPlatformCookies(platformUrl: string): Promise<string | null> {
    try {
      console.log(`🍪 Capturando cookies da plataforma: ${platformUrl}`);

      const response = await axios.get(platformUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
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
        timeout: 10000
      });

      // Capturar cookies do header Set-Cookie
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        const cookies = setCookieHeaders.join('; ');
        console.log(`✅ Cookies capturados com sucesso: ${cookies.substring(0, 100)}...`);
        
        // Salvar cookies na instância
        this.sessionCookies = cookies;
        
        return cookies;
      }

      console.log('⚠️ Nenhum cookie encontrado na resposta');
      return null;

    } catch (error) {
      console.error('Erro ao capturar cookies da plataforma:', error);
      return null;
    }
  }

  /**
   * Etapa 4: Fazer a aposta
   */
  async placeBet(platformToken: string, betData: BetData): Promise<BetResult> {
    // TODO: Implementar placeBet específico do FSBB
    throw new Error('Método placeBet não implementado para FSBB');
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
   * Definir cookies de sessão
   */
  setSessionCookies(cookies: string): void {
    this.sessionCookies = cookies;
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
