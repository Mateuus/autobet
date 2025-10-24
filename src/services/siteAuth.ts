import axios, { AxiosRequestConfig } from 'axios';
import { LoginCredentials, AccessToken, UserProfile } from '@/types';
import { BetAccount } from '@/database/entities/BetAccount';
import { Repository } from 'typeorm';

/**
 * Serviço para autenticação e operações na base do site
 * Separado da plataforma FSSB para evitar confusão
 */
export class SiteAuthService {
  private baseUrl: string;
  private userAgent: string;
  private sessionCookies: string = '';
  private account: BetAccount;
  private repository: Repository<BetAccount>;

  constructor(baseUrl: string, account: BetAccount, repository: Repository<BetAccount>, savedCookies?: string) {
    this.baseUrl = baseUrl;
    this.account = account;
    this.repository = repository;
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

    // Adicionar cookies existentes se disponíveis
    if (this.sessionCookies) {
      //config.headers!['Cookie'] = this.sessionCookies;
    }

    try {
      const response = await axios.request(config);
      
      // Capturar cookies de sessão
      if (response.headers['set-cookie']) {
        const newCookies = response.headers['set-cookie'].join('; ');
        console.log(`🍪 Login capturou ${response.headers['set-cookie'].length} cookies`);
        console.log(`🍪 Cookies antes: ${this.sessionCookies ? this.sessionCookies.split(';').length : 0} cookies`);
        
        // Usar apenas os novos cookies (não combinar para evitar duplicação)
        this.sessionCookies = newCookies;
        
        console.log(`🍪 Total de cookies após login: ${this.sessionCookies.split(';').length}`);
        console.log(`🍪 Primeiros cookies do login: ${this.sessionCookies.substring(0, 200)}...`);
      } else {
        console.log(`⚠️ Login não capturou cookies`);
      }
      
      const loginData = response.data as AccessToken;
      
      // Salvar accessToken no banco de dados
      if (loginData.access_token) {
        this.account.accessToken = loginData.access_token;
        this.account.lastTokenRefresh = new Date();
        
        // Salvar cookies de sessão se disponíveis
        if (this.sessionCookies) {
          this.account.sessionCookies = this.sessionCookies;
        }
        
        // Atualizar no banco usando save para evitar locks
        Object.assign(this.account, {
          accessToken: loginData.access_token,
          lastTokenRefresh: new Date(),
          sessionCookies: this.sessionCookies
        });
        
        // Adicionar timeout para evitar travamentos
        const savePromise = this.repository.save(this.account);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na operação de banco')), 10000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);
      }
      
      return loginData;
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
        'Host': this.baseUrl.replace('https://', ''),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
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
        const newCookies = response.headers['set-cookie'].join('; ');
        // Usar apenas os novos cookies (não combinar para evitar duplicação)
        this.sessionCookies = newCookies;
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
        'Version': 'vz3b-deploy-48a5c65ee07315239ff9b8c502af29d4ae44c5ff-531f751d32a6cfcb460e',
        'Origin': this.baseUrl,
        'Host': this.baseUrl.replace('https://', ''),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      withCredentials: true
    };

    // Adicionar cookies de sessão se disponíveis
    if (this.sessionCookies) {
      config.headers!['Cookie'] = this.sessionCookies;
      console.log(`🍪 Launch usando cookies: ${this.sessionCookies.split(';').length} cookies`);
      console.log(`🔑 Launch usando token: ${userToken.substring(0, 50)}...`);
      console.log(`🍪 Primeiros cookies: ${this.sessionCookies.substring(0, 200)}...`);
    } else {
      console.log(`⚠️ Launch sem cookies disponíveis`);
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
