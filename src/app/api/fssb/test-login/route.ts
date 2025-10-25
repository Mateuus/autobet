import { NextRequest, NextResponse } from 'next/server';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';
import { SiteAuthService } from '@/services/siteAuth';
import { LoginCredentials } from '@/types';
import { BetAccount } from '@/database/entities/BetAccount';
import { AppDataSource } from '@/database/data-source';

export async function POST(request: NextRequest) {
  try {    
    const body = await request.json();
    console.log(body);
    const { siteName, credentials }: { siteName: string; credentials: LoginCredentials } = body;

    // Validar dados de entrada
    if (!siteName) {
      return NextResponse.json(
        { success: false, error: 'Site name é obrigatório' },
        { status: 400 }
      );
    }

    if (!credentials?.email || !credentials?.password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Determinar a URL base baseada no site
    let baseUrl: string;
    switch (siteName.toLowerCase()) {
      case 'bet7k':
        baseUrl = 'https://7k.bet.br';
        break;
      case 'pixbet':
        baseUrl = 'https://pix.bet.br';
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Site não suportado: ${siteName}` },
          { status: 400 }
        );
    }

    // Criar instância da plataforma
    const platform = new FssbPlatform(siteName, baseUrl);

    // Inicializar conexão com o banco se necessário
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const betAccountRepository = AppDataSource.getRepository(BetAccount);

    // Criar conta temporária para o SiteAuthService
    const tempAccount = new BetAccount();
    tempAccount.site = siteName;
    tempAccount.siteUrl = baseUrl;
    tempAccount.email = credentials.email;
    tempAccount.password = credentials.password;

    // Criar instância do SiteAuthService
    const siteAuthService = new SiteAuthService(baseUrl, tempAccount, betAccountRepository);

    // Obter informações do site para debug
    const siteInfo = platform.getSiteInfo();
    const loginConfig = platform.getSiteLoginConfig();

    console.log('\n🧪 ===== TESTING LOGIN WITH SITEAUTHSERVICE =====');
    console.log(`🎯 Site: ${siteName}`);
    console.log(`📧 Email: ${credentials.email}`);
    console.log(`🔑 Password: ${'*'.repeat(credentials.password.length)}`);
    console.log(`📍 Site Info:`, JSON.stringify(siteInfo, null, 2));
    console.log(`⚙️ Login Config:`, JSON.stringify(loginConfig, null, 2));
    console.log('===============================================\n');

    // Tentar fazer login usando SiteAuthService
    console.log('🔄 Iniciando processo de login via SiteAuthService...');
    const loginResult = await siteAuthService.login(credentials);
    
    console.log('\n✅ ===== LOGIN SUCCESS =====');
    console.log('🎉 Login realizado com sucesso via SiteAuthService!');
    console.log('📊 Resultado:', JSON.stringify(loginResult, null, 2));
    console.log('===========================\n');

    // Testar obtenção de saldo usando o SiteAuthService
    console.log('💰 Testando obtenção de saldo via SiteAuthService...');
    const balance = await siteAuthService.getBalance(loginResult.access_token);
    console.log('💰 Saldo obtido:', balance);

    // Testar obtenção de cookies de sessão
    const sessionCookies = siteAuthService.getSessionCookies();
    console.log('🍪 Cookies de sessão:', sessionCookies ? 'Disponíveis' : 'Não disponíveis');

    return NextResponse.json({
      success: true,
      data: {
        loginResult,
        balance,
        sessionCookies: sessionCookies ? 'Disponíveis' : 'Não disponíveis',
        siteInfo,
        loginConfig,
        timestamp: new Date().toISOString()
      },
      message: `Login realizado com sucesso via SiteAuthService para ${siteName}`
    });

  } catch (error: unknown) {
    console.log('\n❌ ===== LOGIN ERROR =====');
    console.error('💥 Erro no teste de login FSSB:', error);
    console.log('==========================\n');

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obter informações dos sites suportados
export async function GET() {
  const supportedSites = [
    {
      name: 'bet7k',
      displayName: 'Bet7K',
      baseUrl: 'https://7k.bet.br',
      platformUrl: 'https://prod20350-kbet-152319626.fssb.io/api',
      description: 'Site de apostas Bet7K'
    },
    {
      name: 'pixbet',
      displayName: 'PixBet',
      baseUrl: 'https://pix.bet.br',
      platformUrl: 'https://prod20383.fssb.io/api',
      description: 'Site de apostas PixBet'
    }
  ];

  return NextResponse.json({
    success: true,
    data: {
      supportedSites,
      totalSites: supportedSites.length,
      platform: 'fssb',
      timestamp: new Date().toISOString()
    },
    message: 'Sites suportados pela plataforma FSSB'
  });
}
