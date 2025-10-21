import { BasePlatform } from './BasePlatform';
import { BiahostedPlatform } from './BiahostedPlatform';

export class PlatformFactory {
  static create(siteName: string): BasePlatform {
    switch (siteName.toLowerCase()) {
      case 'lotogreen':
        return new BiahostedPlatform('lotogreen', 'https://lotogreen.bet.br');
      
      case 'mcgames':
        return new BiahostedPlatform('mcgames', 'https://mcgames.bet.br');
      
      case 'estrelabet':
        return new BiahostedPlatform('estrelabet', 'https://estrelabet.bet.br');
      
      case 'jogodeouro':
        return new BiahostedPlatform('jogodeouro', 'https://jogodeouro.bet.br');
      
      default:
        throw new Error(`Site ${siteName} not supported`);
    }
  }

  static getSupportedSites(): string[] {
    return ['lotogreen', 'mcgames', 'estrelabet', 'jogodeouro'];
  }

  static isValidSite(siteName: string): boolean {
    return this.getSupportedSites().includes(siteName.toLowerCase());
  }

  static getSiteConfig(siteName: string): { name: string; url: string; integration: string } {
    const configs = {
      lotogreen: { name: 'lotogreen', url: 'https://lotogreen.bet.br', integration: 'lotogreen' },
      mcgames: { name: 'mcgames', url: 'https://mcgames.bet.br', integration: 'mcgames' },
      estrelabet: { name: 'estrelabet', url: 'https://estrelabet.bet.br', integration: 'estrelabet' },
      jogodeouro: { name: 'jogodeouro', url: 'https://jogodeouro.bet.br', integration: 'jogodeouro' }
    };

    const config = configs[siteName.toLowerCase() as keyof typeof configs];
    if (!config) {
      throw new Error(`Site ${siteName} not supported`);
    }

    return config;
  }
}
