export const BIAHOSTED_SITES = {
  lotogreen: {
    name: 'Lotogreen',
    url: 'https://lotogreen.bet.br',
    integration: 'lotogreen',
    platform: 'biahosted' as const
  },
  mcgames: {
    name: 'McGames',
    url: 'https://mcgames.bet.br',
    integration: 'mcgames',
    platform: 'biahosted' as const
  },
  estrelabet: {
    name: 'EstrelaBet',
    url: 'https://estrelabet.bet.br',
    integration: 'estrelabet',
    platform: 'biahosted' as const
  },
  jogodeouro: {
    name: 'Jogo de Ouro',
    url: 'https://jogodeouro.bet.br',
    integration: 'jogodeouro',
    platform: 'biahosted' as const
  }
} as const;

export type BiahostedSite = keyof typeof BIAHOSTED_SITES;

export const SUPPORTED_PLATFORMS = {
  biahosted: {
    name: 'Biahosted',
    sites: Object.keys(BIAHOSTED_SITES) as BiahostedSite[],
    apiUrl: 'https://sb2betgateway-altenar2.biahosted.com/api',
    authUrl: 'https://sb2auth-altenar2.biahosted.com/api'
  }
} as const;

export type SupportedPlatform = keyof typeof SUPPORTED_PLATFORMS;
