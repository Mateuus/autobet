import { BasePlatform } from './BasePlatform';
import { LoginCredentials, AccessToken, UserToken, PlatformToken, BetData, BetResult, UserProfile } from '@/types';

export class BiahostedPlatform extends BasePlatform {
  private siteName: string;

  constructor(siteName: string, baseUrl: string) {
    super(
      baseUrl,
      'https://sb2betgateway-altenar2.biahosted.com/api',
      siteName
    );
    this.siteName = siteName;
  }

  async login(credentials: LoginCredentials): Promise<AccessToken> {
    const data = {
      email: credentials.email,
      password: credentials.password,
      login: credentials.email
    };

    const config = {
      method: 'post',
      url: `${this.baseUrl}/api/auth/login`,
      data
    };

    return await this.makeRequest<AccessToken>(config);
  }

  async generateToken(accessToken: string, userToken: string): Promise<UserToken> {
    const data = {
      user_id: '', // Será preenchido dinamicamente
      token: userToken,
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
    };

    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/generate-token`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
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
        'Authorization': `Bearer ${platformToken}`
      },
      data: payload
    };

    return await this.makeRequest<BetResult>(config);
  }

  async getBalance(platformToken: string): Promise<number> {
    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/auth/me`,
      headers: {
        'Authorization': `Bearer ${platformToken}`
      }
    };

    const profile = await this.makeRequest<UserProfile>(config);
    return profile.balance || 0;
  }

  async getProfile(platformToken: string): Promise<UserProfile> {
    const config = {
      method: 'get',
      url: `${this.baseUrl}/api/auth/me`,
      headers: {
        'Authorization': `Bearer ${platformToken}`
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
      platform: 'biahosted'
    };
  }
}
