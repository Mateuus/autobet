import axios, { AxiosRequestConfig } from 'axios';
import { LoginCredentials, AccessToken, UserProfile } from '@/types';

/**
 * Serviço para autenticação e operações na base do site
 * Separado da plataforma FSSB para evitar confusão
 */
export class SiteAuthService {
  private baseUrl: string;
  private userAgent: string;
  private sessionCookies: string = '';

  constructor(baseUrl: string, savedCookies?: string) {
    this.baseUrl = baseUrl;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
    this.sessionCookies = savedCookies || '';
    
  }

  /**
   * Login na base do site
   */
  async login(credentials: LoginCredentials): Promise<AccessToken> {
    const data = {
      login: credentials.email,
      email: credentials.email,
      password: credentials.password,
      app_source: 'web',
      captcha_token: ''
    };

    const config: AxiosRequestConfig = {
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

    try {
      const response = await axios.request(config);
      
      // Capturar cookies de sessão
      if (response.headers['set-cookie']) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no login do site:', error);
      throw new Error('Erro no login do site');
    }
  }

  /**
   * Obter saldo da conta
   */
  async getBalance(accessToken: string): Promise<number> {
    // Usar a URL da API correta baseada no site
    const apiUrl = this.baseUrl;
      
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${apiUrl}/api/users/wallet?withCurrentUser=true`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': this.baseUrl,
        'Referer': this.baseUrl,
        'Content-Type': 'application/json',
        'Host': this.baseUrl.replace('https://', '')
      },
      withCredentials: true
    };

          // Adicionar cookies se disponíveis
          if (this.sessionCookies) {
            config.headers!['Cookie'] = this.sessionCookies;
          }

    try {
      const response = await axios.request(config);
      
      // Capturar cookies de sessão se houver
      if (response.headers['set-cookie']) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      const data = response.data as { credit: number };
      return data.credit || 0;
    } catch (error) {
      console.error('Erro ao obter saldo da conta:', error);
      
      // Log mais detalhado do erro
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            statusText?: string;
            data?: unknown 
          };
        };
        
        console.error(`Status: ${axiosError.response?.status}`);
        console.error(`Status Text: ${axiosError.response?.statusText}`);
        console.error(`Response Data:`, axiosError.response?.data);
      }
      
      throw new Error('Erro ao verificar saldo da conta');
    }
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile(accessToken: string): Promise<UserProfile> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/api/users/profile`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': this.userAgent,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': this.baseUrl,
        'Referer': this.baseUrl
      },
      withCredentials: true
    };

    // Adicionar cookies se disponíveis
    if (this.sessionCookies) {
      config.headers!['Cookie'] = this.sessionCookies;
    }

    try {
      const response = await axios.request(config);
      
      // Capturar cookies de sessão se houver
      if (response.headers['set-cookie']) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      return response.data as UserProfile;
    } catch (error) {
      console.error('Erro ao obter perfil da conta:', error);
      throw new Error('Erro ao verificar perfil da conta');
    }
  }

  /**
   * Obter cookies de sessão atuais
   */
  getSessionCookies(): string {
    return this.sessionCookies;
  }

  /**
   * Definir cookies de sessão
   */
  setSessionCookies(cookies: string): void {
    this.sessionCookies = cookies;
  }

  /**
   * Fazer launch para obter URL da plataforma FSSB
   */
  async launch(userToken: string, siteName: string): Promise<{ success: boolean; url: string }> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/api/cactus-sportbook/launch`,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'pt-BR,pt;q=0.7',
        'Authorization': `Bearer ${userToken}`,
        'City': 'Praia Grande',
        'Country': 'BR',
        'Country_alpha3': 'BRA',
        'Currency': 'BRL',
        'Jurisdiction': 'BR',
        'Language': 'pt-br',
        'Origin-Domain': siteName,
        'Priority': 'u=1, i',
        'Referer': `https://${siteName}/sports?tab=Early`,
        'Sec-CH-UA': '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-GPC': '1',
        'Tenant': siteName,
        'User-Agent': this.userAgent,
        'Version': 'vz3b-deploy-48a5c65ee07315239ff9b8c502af29d4ae44c5ff-531f751d32a6cfcb460e'
      },
      withCredentials: true
    };

    // Adicionar cookies se disponíveis
    if (this.sessionCookies) {
      config.headers!['Cookie'] = this.sessionCookies;
    }

    try {
      const response = await axios.request(config);
      
      // Capturar cookies de sessão se houver
      if (response.headers['set-cookie']) {
        this.sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      return response.data as { success: boolean; url: string };
    } catch (error) {
      console.error('Erro ao fazer launch:', error);
      throw new Error('Erro ao fazer launch da plataforma');
    }
  }
}
