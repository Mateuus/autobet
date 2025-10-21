import Redis from 'ioredis';

// Tipos para dados armazenados no Redis
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  userId: string;
  email: string;
  loginTime: string;
  lastActivity: string;
  platform?: string;
}

interface MarketData {
  id: string;
  name: string;
  odds: number;
  status: string;
  lastUpdated: string;
}

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

export class RedisManager {
  private static readonly PREFIX = 'AutoBet';

  // Tokens de autenticação
  static async setAccessToken(betAccountId: string, token: string, ttl: number = 172800) {
    await redis.setex(`${this.PREFIX}:auth:access_token:${betAccountId}`, ttl, token);
  }

  static async getAccessToken(betAccountId: string): Promise<string | null> {
    return await redis.get(`${this.PREFIX}:auth:access_token:${betAccountId}`);
  }

  static async setUserToken(betAccountId: string, token: string, ttl: number = 3600) {
    await redis.setex(`${this.PREFIX}:auth:user_token:${betAccountId}`, ttl, token);
  }

  static async getUserToken(betAccountId: string): Promise<string | null> {
    return await redis.get(`${this.PREFIX}:auth:user_token:${betAccountId}`);
  }

  static async setPlatformToken(betAccountId: string, token: string, ttl: number = 3600) {
    await redis.setex(`${this.PREFIX}:auth:platform_token:${betAccountId}`, ttl, token);
  }

  static async getPlatformToken(betAccountId: string): Promise<string | null> {
    return await redis.get(`${this.PREFIX}:auth:platform_token:${betAccountId}`);
  }

  // Cache de dados da conta
  static async setBalance(betAccountId: string, balance: number, ttl: number = 300) {
    await redis.setex(`${this.PREFIX}:account:balance:${betAccountId}`, ttl, balance.toString());
  }

  static async getBalance(betAccountId: string): Promise<number | null> {
    const balance = await redis.get(`${this.PREFIX}:account:balance:${betAccountId}`);
    return balance ? parseFloat(balance) : null;
  }

  // Cache de perfil da conta
  static async setProfile(betAccountId: string, profile: UserProfile, ttl: number = 1800) {
    await redis.setex(`${this.PREFIX}:account:profile:${betAccountId}`, ttl, JSON.stringify(profile));
  }

  static async getProfile(betAccountId: string): Promise<UserProfile | null> {
    const profile = await redis.get(`${this.PREFIX}:account:profile:${betAccountId}`);
    return profile ? JSON.parse(profile) : null;
  }

  // Verificar se tokens estão válidos
  static async areTokensValid(betAccountId: string): Promise<boolean> {
    const accessToken = await redis.get(`${this.PREFIX}:auth:access_token:${betAccountId}`);
    const userToken = await redis.get(`${this.PREFIX}:auth:user_token:${betAccountId}`);
    const platformToken = await redis.get(`${this.PREFIX}:auth:platform_token:${betAccountId}`);
    
    return !!(accessToken && userToken && platformToken);
  }

  // Limpar todos os tokens de uma conta
  static async clearTokens(betAccountId: string) {
    const keys = [
      `${this.PREFIX}:auth:access_token:${betAccountId}`,
      `${this.PREFIX}:auth:user_token:${betAccountId}`,
      `${this.PREFIX}:auth:platform_token:${betAccountId}`,
      `${this.PREFIX}:account:balance:${betAccountId}`,
      `${this.PREFIX}:account:profile:${betAccountId}`
    ];
    
    await redis.del(...keys);
  }

  // Sessões de usuário
  static async setSession(userId: string, sessionData: SessionData, ttl: number = 86400) {
    await redis.setex(`${this.PREFIX}:session:${userId}`, ttl, JSON.stringify(sessionData));
  }

  static async getSession(userId: string): Promise<SessionData | null> {
    const session = await redis.get(`${this.PREFIX}:session:${userId}`);
    return session ? JSON.parse(session) : null;
  }

  static async deleteSession(userId: string) {
    await redis.del(`${this.PREFIX}:session:${userId}`);
  }

  // Cache de mercados/odds
  static async setMarkets(platform: string, markets: MarketData[], ttl: number = 30) {
    await redis.setex(`${this.PREFIX}:markets:live:${platform}`, ttl, JSON.stringify(markets));
  }

  static async getMarkets(platform: string): Promise<MarketData[] | null> {
    const markets = await redis.get(`${this.PREFIX}:markets:live:${platform}`);
    return markets ? JSON.parse(markets) : null;
  }

  // Limpar todo o cache de uma plataforma
  static async clearPlatformCache(platform: string) {
    const pattern = `${this.PREFIX}:*:${platform}`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Limpar todo o cache do AutoBet
  static async clearAllCache() {
    const pattern = `${this.PREFIX}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default redis;
