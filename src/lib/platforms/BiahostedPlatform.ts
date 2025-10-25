import { BasePlatform } from './BasePlatform';
import { LoginCredentials, AccessToken, UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';
import { AxiosRequestConfig } from 'axios';
import { appendFileSync } from 'fs';
import { join } from 'path';

interface LoginPayload {
  email?: string;
  password: string;
  login?: string;
  app_source?: string;
  captcha_token?: string;
}

export class BiahostedPlatform extends BasePlatform {
  private siteName: string;
  private userAgent: string;
  private sessionCookies: string = '';

  constructor(siteName: string, baseUrl: string) {
    super(
      baseUrl,
      'https://sb2betgateway-altenar2.biahosted.com/api',
      siteName
    );
    this.siteName = siteName;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
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
   * Obter cookies de sessão antes do login
   */
  private async getSessionCookies(): Promise<void> {
    try {
      await this.httpClient.get(`${this.baseUrl}/`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });
    } catch {
      // Não falha o login se não conseguir obter cookies
    }
  }

  /**
   * Método auxiliar para fazer requisições HTTP com captura de cookies
   */
  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const requestId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    
    try {
      // Adicionar cookies se disponíveis (para McGames e EstrelaBet)
      if (this.sessionCookies && (this.siteName.toLowerCase() === 'mcgames' || this.siteName.toLowerCase() === 'estrelabet')) {
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
      
      // Capturar cookies da resposta (para McGames e EstrelaBet)
      if (response.headers['set-cookie'] && (this.siteName.toLowerCase() === 'mcgames' || this.siteName.toLowerCase() === 'estrelabet')) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      // Para EstrelaBet, também capturar cookies do cookieHeader na resposta
      if (this.siteName.toLowerCase() === 'estrelabet' && response.data?.data?.cookieHeader) {
        const cookieHeader = response.data.data.cookieHeader;
        // Extrair apenas os valores dos cookies (sem Max-Age, Domain, etc.)
        const cookieValues = cookieHeader.split(',').map((cookie: string) => {
          const parts = cookie.split(';');
          return parts[0].trim();
        }).join('; ');
        
        if (cookieValues) {
          this.sessionCookies = cookieValues;
        }
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

  async login(credentials: LoginCredentials): Promise<AccessToken> {
    // McGames usa configuração específica igual ao Postman
    if (this.siteName.toLowerCase() === 'mcgames') {
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
          'Content-Type': 'application/json'
        },
        data,
        withCredentials: true,
        maxBodyLength: Infinity
      };

      const result = await this.makeRequest<AccessToken>(config);
      return result;
    }

    // EstrelaBet usa configuração específica
    if (this.siteName.toLowerCase() === 'estrelabet') {
      const data = {
        login: credentials.email,
        domain: 'www.estrelabet.bet.br',
        lnSessionId: 'dd8a1dbe-f571-403b-9722-c1540018f8e7', // Session ID fixo
        password: credentials.password
      };

      const config = {
        method: 'post',
        url: `${this.baseUrl}/next/pb/api/login`,
        headers: {
          'Content-Type': 'application/json',
          'Origin': this.baseUrl,
          'Referer': `${this.baseUrl}/`,
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        },
        data,
        withCredentials: true,
        maxBodyLength: Infinity
      };

      const result = await this.makeRequest<{
        data: {
          success: boolean;
          id: string;
          token: string;
          cookieHeader: string;
          user: {
            id: string;
            partnerId: string;
          };
        };
        error: null;
      }>(config);
      
      // Converter resposta do EstrelaBet para formato AccessToken padrão
      return {
        access_token: result.data.token, // EstrelaBet usa 'token' ao invés de 'access_token'
        token_type: 'bearer',
        expires_in: 3600, // 1 hora padrão
        user: {
          id: parseInt(result.data.user.id.replace('EST', '')), // Converter EST2022099960136 para número
          name: credentials.email, // Usar email como nome temporário
          email: credentials.email,
          username: result.data.id,
          token: result.data.token
        }
      };
    }

    // Outros sites usam configuração padrão
    // Primeiro, obter cookies de sessão
    await this.getSessionCookies();
    
    // Payload base comum para outros sites
    const baseData: LoginPayload = {
      email: credentials.email,
      password: credentials.password,
      login: credentials.email
    };

    // Payload específico por site
    let data: LoginPayload = { ...baseData };
    
    switch (this.siteName.toLowerCase()) {
      case 'lotogreen':
        data = {
          ...baseData,
          app_source: 'web'
        };
        break;
      case 'estrelabet':
        data = {
          ...baseData,
          app_source: 'web'
        };
        break;
      case 'jogodeouro':
        data = {
          ...baseData,
          app_source: 'web'
        };
        break;
      default:
        data = baseData;
    }

    const config = {
      method: 'post',
      url: `${this.baseUrl}/api/auth/login`,
      headers: {
        'User-Agent': this.userAgent,
        'Content-Type': 'application/json',
        'Origin': this.baseUrl
      },
      data,
      withCredentials: true,
      maxBodyLength: Infinity
    };
    
    return await this.makeRequest<AccessToken>(config);
  }

  async generateToken(accessToken: string, userToken: string): Promise<UserToken> {
    // McGames usa endpoint diferente
    if (this.siteName.toLowerCase() === 'mcgames') {
      const config = {
        method: 'get',
        url: `${this.baseUrl}/api/alternar/token`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      };

      const response = await this.makeRequest<{ token: string }>(config);
      
      return {
        user_id: '', // Será preenchido dinamicamente
        token: response.token,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
      };
    }

    // EstrelaBet usa endpoint específico
    if (this.siteName.toLowerCase() === 'estrelabet') {
      // Extrair sessionid dos cookies capturados
      let sessionid = '';
      if (this.sessionCookies) {
        const sessionMatch = this.sessionCookies.match(/ci_session=([^;]+)/);
        if (sessionMatch) {
          sessionid = sessionMatch[1];
        }
      }

      const config = {
        method: 'get',
        url: 'https://bff-estrelabet.estrelabet.bet.br/sports/openSportsBook?vendorId=altenar',
        headers: {
          'User-Agent': this.userAgent,
          'SessionId': sessionid
        }
      };

      // Adicionar cookies se disponíveis
      if (this.sessionCookies) {
        (config.headers as Record<string, string>)['Cookie'] = this.sessionCookies;
      }

      const response = await this.makeRequest<{
        data: {
          authToken: string;
          status: string;
          tokenExpiry: string;
          [key: string]: unknown;
        };
      }>(config);
      
      return {
        user_id: '', // Será preenchido dinamicamente
        token: response.data.authToken, // EstrelaBet usa 'authToken' ao invés de 'token'
        expires_at: new Date(parseInt(response.data.tokenExpiry) * 1000).toISOString() // Converter timestamp Unix para ISO
      };
    }

    // Outros sites usam o endpoint padrão
    const data = {
      user_id: '', // Será preenchido dinamicamente
      token: userToken,
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
    };

    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/generate-token`,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data
    };

    return await this.makeRequest<UserToken>(config);
  }

  async signIn(userToken: string): Promise<PlatformToken> {
    const integration = this.integration === 'mcgames' ? 'mcgames2' : this.integration;
    const data = {
      culture: 'pt-BR',
      timezoneOffset: 180,
      integration: integration,
      deviceType: 1,
      numFormat: 'en-GB',
      countryCode: 'BR',
      token: userToken
    };

    const config = {
      method: 'post',
      url: 'https://sb2auth-altenar2.biahosted.com/api/WidgetAuth/SignIn',
      headers: {
        'User-Agent': this.userAgent,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data
    };

    return await this.makeRequest<PlatformToken>(config);
  }

  async placeBet(platformToken: string, betData: BetData): Promise<BetResult> {
    const payload = this.createBetPayload(betData);

    const config = {
      method: 'post',
      url: `${this.apiUrl}/widget/placeWidget`,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': `Bearer ${platformToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: payload
    };

    return await this.makeRequest<BetResult>(config);
  }

  async getBalance(platformToken: string): Promise<number> {
    // McGames usa endpoint específico para buscar saldo
    if (this.siteName.toLowerCase() === 'mcgames') {
      const config = {
        method: 'get',
        url: `${this.baseUrl}/api/users/wallet?withCurrentUser=true`,
        headers: {
          'Authorization': `Bearer ${platformToken}`
        }
      };

      // Adicionar cookies se disponíveis
      if (this.sessionCookies) {
        (config.headers as Record<string, string>)['Cookie'] = this.sessionCookies;
      }

      const response = await this.makeRequest<{
        id: number;
        balance: number;
        credit: number;
        available_value: number;
        user_id: number;
        bonus: number;
        user_profile: {
          wallet: {
            credit: number;
            balance: number;
          };
          _cached: {
            'get-credits': {
              credit: number;
              bonus: number;
            };
          };
        };
      }>(config);

      // McGames retorna o saldo em centavos no credit
      // Prioridade: credit > user_profile.wallet.credit > _cached.get-credits.credit
      return response.credit || 
             response.user_profile?.wallet?.credit || 
             response.user_profile?._cached?.['get-credits']?.credit || 
             0;
    }

    // EstrelaBet usa endpoint específico para buscar saldo
    if (this.siteName.toLowerCase() === 'estrelabet') {
      // Extrair sessionid dos cookies capturados
      let sessionid = '';
      if (this.sessionCookies) {
        const sessionMatch = this.sessionCookies.match(/ci_session=([^;]+)/);
        if (sessionMatch) {
          sessionid = sessionMatch[1];
        }
      }

      const config = {
        method: 'get',
        url: 'https://bff-estrelabet.estrelabet.bet.br/profile/getProfileBalanceCurrency',
        headers: {
          'sessionid': sessionid,
          'User-Agent': this.userAgent
        }
      };

      // Adicionar cookies se disponíveis
      if (this.sessionCookies) {
        (config.headers as Record<string, string>)['Cookie'] = this.sessionCookies;
      }

      const response = await this.makeRequest<{
        data: {
          profile: {
            balanceDetails: {
              cash: number; // EstrelaBet retorna em reais (1.25 = R$ 1,25)
              bonus: number;
              withdrawableBalance: number;
            };
          };
          token: string;
        };
      }>(config);

      // EstrelaBet retorna o saldo em reais, converter para centavos
      const cashInReais = response.data.profile.balanceDetails.cash || 0;
      return Math.round(cashInReais * 100); // Converter reais para centavos
    }

    // Outros sites usam o endpoint padrão
    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/auth/me`,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': `Bearer ${platformToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    const profile = await this.makeRequest<UserProfile>(config);
    return profile.balance || 0;
  }

  async getProfile(platformToken: string): Promise<UserProfile> {
    // McGames usa endpoint diferente para buscar perfil
    if (this.siteName.toLowerCase() === 'mcgames') {
      const config = {
        method: 'get',
        url: `${this.baseUrl}/api/auth/user-profile`,
        headers: {
          'Authorization': `Bearer ${platformToken}`
        }
      };

      // Adicionar cookies se disponíveis
      if (this.sessionCookies) {
        (config.headers as Record<string, string>)['Cookie'] = this.sessionCookies;
      }

      const response = await this.makeRequest<{
        id: number;
        name: string;
        email: string;
        phone: string;
        wallet: {
          credit: number;
          balance: number;
        };
        [key: string]: unknown;
      }>(config);

      // Converter resposta do McGames para formato padrão UserProfile
      return {
        id: response.id.toString(),
        name: response.name,
        email: response.email,
        phone: response.phone,
        birthday: '',
        email_verified_at: null,
        balance: response.wallet?.credit || 0, // Já em centavos
        active: 1,
        status: 'active',
        ftd_paid: 0,
        ftd_active: null,
        created_at: '',
        updated_at: '',
        last_login_at: '',
        last_real_login_at: '',
        gender: 0,
        kyc_verification: 0,
        referrer_id: null,
        identity_verify: 0,
        country: null,
        is_suspended: false,
        is_self_excluded: false,
        address_verify: 0,
        accepted_domain_migration: false,
        pix_type: '',
        document: {
          id: 0,
          number: '',
          user_id: '',
          created_at: '',
          updated_at: ''
        },
        address: {
          id: 0,
          user_id: '',
          street: '',
          city: '',
          state: '',
          neighborhood: '',
          number: '',
          zip_code: '',
          created_at: '',
          updated_at: ''
        },
        commission: null,
        deposit_rollover: {
          id: 0,
          user_id: '',
          total: 0,
          amount: 0
        },
        user_rollover: null,
        settings: [],
        is_email_valid: false,
        is_phone_valid: false
      };
    }

    // Outros sites usam o endpoint padrão
    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/auth/me`,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': `Bearer ${platformToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    return await this.makeRequest<UserProfile>(config);
  }

  /**
   * Obter informações do site
   */
  getSiteInfo() {
    return {
      name: this.siteName,
      url: this.baseUrl,
      integration: this.integration,
      platform: 'biahosted',
      userAgent: this.userAgent
    };
  }

  /**
   * Obter betslip atual (implementação padrão para Biahosted)
   */
  async getBetslip(): Promise<unknown[]> {
    // Biahosted não tem betslip público, retorna array vazio
    console.log(`ℹ️ Biahosted não suporta betslip público para ${this.siteName}`);
    return [];
  }

  /**
   * Limpar betslip atual (implementação padrão para Biahosted)
   */
  async clearBetslip(): Promise<void> {
    // Biahosted não tem betslip público, não há nada para limpar
    console.log(`ℹ️ Biahosted não suporta limpeza de betslip para ${this.siteName}`);
  }

  /**
   * Adicionar seleções ao betslip (implementação padrão para Biahosted)
   */
  async addToBetslip(selections: unknown[]): Promise<unknown[]> {
    // Biahosted não tem betslip público, retorna array vazio
    console.log(`ℹ️ Biahosted não suporta adição ao betslip para ${this.siteName}`);
    console.log(`📝 Tentativa de adicionar ${selections.length} seleções`);
    return [];
  }

  /**
   * Obter configurações específicas do site para login
   */
  getSiteLoginConfig() {
    switch (this.siteName.toLowerCase()) {
      case 'mcgames':
        return {
          requiresAppSource: true,
          requiresCaptchaToken: true,
          loginField: 'login', // Usa 'login' ao invés de 'email'
          additionalFields: ['app_source', 'captcha_token']
        };
      case 'lotogreen':
        return {
          requiresAppSource: true,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: ['app_source']
        };
      case 'estrelabet':
        return {
          requiresAppSource: true,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: ['app_source']
        };
      case 'jogodeouro':
        return {
          requiresAppSource: true,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: ['app_source']
        };
      default:
        return {
          requiresAppSource: false,
          requiresCaptchaToken: false,
          loginField: 'email',
          additionalFields: []
        };
    }
  }
}
