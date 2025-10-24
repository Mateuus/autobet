import { NextResponse } from 'next/server';

// GET /api/platforms - Obter plataformas disponíveis e suas casas de apostas
export async function GET() {
  try {
    const platforms = [
      {
        id: 'biahosted',
        name: 'BiaHosted',
        description: 'Plataforma BiaHosted para casas como McGames, LotoGreen, etc.',
        features: {
          supportsUserToken: true,
          supportsPlatformToken: true,
          supportsBalanceCheck: true,
          supportsBetting: true,
          requiresSiteUrl: true
        },
        sites: [
          {
            id: 'mcgames',
            name: 'McGames',
            displayName: 'McGames',
            baseUrl: 'https://mcgames.com.br',
            description: 'Casa de apostas McGames',
            requiresSiteUrl: true
          },
          {
            id: 'lotogreen',
            name: 'LotoGreen',
            displayName: 'LotoGreen',
            baseUrl: 'https://lotogreen.com.br',
            description: 'Casa de apostas LotoGreen',
            requiresSiteUrl: true
          },
          {
            id: 'estrelabet',
            name: 'EstrelaBet',
            displayName: 'EstrelaBet',
            baseUrl: 'https://www.estrelabet.bet.br',
            description: 'Casa de apostas EstrelaBet',
            requiresSiteUrl: true
          }
        ]
      },
      {
        id: 'fssb',
        name: 'FSSB (FSSIO)',
        description: 'Plataforma FSSB para casas como Bet7K, PixBet, etc.',
        features: {
          supportsUserToken: false,
          supportsPlatformToken: false,
          supportsBalanceCheck: false,
          supportsBetting: false,
          requiresSiteUrl: false
        },
        sites: [
          {
            id: 'bet7k',
            name: 'Bet7K',
            displayName: 'Bet7K',
            baseUrl: 'https://7k.bet.br',
            platformUrl: 'https://prod20350-kbet-152319626.fssb.io/api',
            description: 'Casa de apostas Bet7K',
            requiresSiteUrl: false
          },
          {
            id: 'pixbet',
            name: 'PixBet',
            displayName: 'PixBet',
            baseUrl: 'https://pix.bet.br',
            platformUrl: 'https://prod20383.fssb.io/api',
            description: 'Casa de apostas PixBet',
            requiresSiteUrl: false
          }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        platforms,
        totalPlatforms: platforms.length,
        timestamp: new Date().toISOString()
      },
      message: 'Plataformas e casas de apostas disponíveis'
    });

  } catch (error) {
    console.error('Erro ao buscar plataformas:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
