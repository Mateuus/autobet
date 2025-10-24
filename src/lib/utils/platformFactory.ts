import { BetAccount } from '@/database/entities/BetAccount';
import { BiahostedPlatform } from '@/lib/platforms/BiahostedPlatform';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';
import { BasePlatform } from '@/lib/platforms/BasePlatform';

/**
 * Função utilitária para instanciar a plataforma correta baseada no campo platform da conta
 */
export function getPlatformInstance(account: BetAccount): BasePlatform {
  const platform = account.platform.toLowerCase();
  
  switch (platform) {
    case 'fssb':
      console.log(`🔧 Usando plataforma FSSB para ${account.site}`);
      return new FssbPlatform(account.site, account.siteUrl, account.sessionCookies);
    
    case 'biahosted':
    default:
      console.log(`🔧 Usando plataforma Biahosted para ${account.site}`);
      return new BiahostedPlatform(account.site, account.siteUrl);
  }
}

/**
 * Função utilitária para instanciar plataforma por parâmetros individuais
 */
export function createPlatformInstance(platform: string, site: string, siteUrl: string): BasePlatform {
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'fssb':
      console.log(`🔧 Usando plataforma FSSB para ${site}`);
      return new FssbPlatform(site, siteUrl);
    
    case 'biahosted':
    default:
      console.log(`🔧 Usando plataforma Biahosted para ${site}`);
      return new BiahostedPlatform(site, siteUrl);
  }
}
