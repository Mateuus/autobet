import { BasePlatform } from './BasePlatform';
import { LoginCredentials, AccessToken, UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';
import { AxiosRequestConfig } from 'axios';

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
   * Obter cookies de sessão antes do login
   */
  private async getSessionCookies(): Promise<void> {
    try {
      await this.httpClient.get(`${this.baseUrl}/`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });
    } catch (error) {
      console.log('Erro ao obter cookies de sessão:', error);
      // Não falha o login se não conseguir obter cookies
    }
  }

  /**
   * Método auxiliar para fazer requisições HTTP com captura de cookies
   */
  protected async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      // Adicionar cookies se disponíveis (especialmente para McGames)
      if (this.sessionCookies && this.siteName.toLowerCase() === 'mcgames') {
        config.headers = {
          ...config.headers,
          'Cookie': this.sessionCookies
        };
      }

      /*
      console.log(`🚀 Requisição para ${this.integration}:`);
      console.log(`📤 URL: ${config.url}`);
      console.log(`📤 Method: ${config.method}`);
      console.log(`📤 Headers:`, JSON.stringify(config.headers, null, 2));
      console.log(`📤 Body:`, JSON.stringify(config.data, null, 2));
      */
      
      const response = await this.httpClient.request(config);
      
      // Capturar cookies da resposta (especialmente para McGames)
      if (response.headers['set-cookie'] && this.siteName.toLowerCase() === 'mcgames') {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
        //console.log(`🍪 Cookies capturados: ${this.sessionCookies}`);
      }
      
      /*
      console.log(`✅ Resposta de ${this.integration}:`);
      console.log(`📥 Status: ${response.status}`);
      console.log(`📥 Headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`📥 Body:`, JSON.stringify(response.data, null, 2));
      */
      
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ Erro na requisição para ${this.integration}:`);
      if (error && typeof error === 'object' && 'response' in error) {
        /*
        const axiosError = error as { response?: { status?: number; headers?: unknown; data?: unknown } };
        console.error(`📥 Status: ${axiosError.response?.status}`);
        console.error(`📥 Headers:`, JSON.stringify(axiosError.response?.headers, null, 2));
        console.error(`📥 Body:`, JSON.stringify(axiosError.response?.data, null, 2));
        */
      }
      console.error(`❌ Erro:`, error instanceof Error ? error.message : 'Erro desconhecido');
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

      //console.log('McGames login config:', config);
      const result = await this.makeRequest<AccessToken>(config);
      //console.log('McGames login result:', result);
      return result;
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

      //console.log('McGames generateToken config:', config);

      const response = await this.makeRequest<{ token: string }>(config);
      //console.log('McGames generateToken response:', response);
      
      return {
        user_id: '', // Será preenchido dinamicamente
        token: response.token,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
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
    const data = {
      culture: 'pt-BR',
      timezoneOffset: 180,
      integration: this.integration,
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
