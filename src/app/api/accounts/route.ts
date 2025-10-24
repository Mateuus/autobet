import { NextRequest, NextResponse } from 'next/server';
import { createPlatformInstance } from '@/lib/utils/platformFactory';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { verifyJWTToken } from '@/lib/auth/jwt';
import { Account } from '@/database/entities/Account';

// GET /api/accounts - Listar contas do usuário
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 });
    }

    // Verificar JWT e extrair userId
    const userId = verifyJWTToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }
    
    // Inicializar conexão com o banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Buscar usuário pelo ID do JWT
    const accountRepository = AppDataSource.getRepository(Account);
    const user = await accountRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar contas de apostas do usuário
    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    const betAccounts = await betAccountRepository.find({
      where: { accountId: user.id },
      order: { createdAt: 'DESC' }
    });

    // Retornar contas com saldos do banco (sem buscar automaticamente)
    const accountsWithBalance = betAccounts.map(account => ({
      id: account.id,
      name: account.site,
      platform: account.platform,
      email: account.email,
      password: account.password,
      balance: account.balance,
      status: account.isActive ? 'Ativo' : 'Inativo',
      lastUpdate: account.updatedAt.toISOString(),
      baseUrl: account.siteUrl,
      isVisible: true
    }));

    return NextResponse.json({
      success: true,
      data: accountsWithBalance
    });

  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST /api/accounts - Criar nova conta
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 });
    }

    // Verificar JWT e extrair userId
    const userId = verifyJWTToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }
    
    // Inicializar conexão com o banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Buscar usuário pelo ID do JWT
    const accountRepository = AppDataSource.getRepository(Account);
    const user = await accountRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { platform, site, name, email, password, siteUrl } = body;

    // Validar dados obrigatórios
    if (!platform || !site || !name || !email || !password) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios não fornecidos' 
      }, { status: 400 });
    }

    // Validar plataforma suportada
    if (!['biahosted', 'fssb'].includes(platform)) {
      return NextResponse.json({ 
        error: 'Plataforma não suportada. Use: biahosted ou fssb' 
      }, { status: 400 });
    }

    // Validar site específico por plataforma
    const validSites = {
      biahosted: ['mcgames', 'lotogreen', 'estrelabet'],
      fssb: ['bet7k', 'pixbet']
    };

    if (!validSites[platform as keyof typeof validSites]?.includes(site)) {
      return NextResponse.json({ 
        error: `Site '${site}' não é válido para a plataforma '${platform}'` 
      }, { status: 400 });
    }

    // Validar siteUrl apenas para biahosted
    if (platform === 'biahosted' && !siteUrl) {
      return NextResponse.json({ 
        error: 'URL do site é obrigatória para plataforma BiaHosted' 
      }, { status: 400 });
    }

    // Verificar se já existe uma conta com este email para este site específico
    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    const existingAccount = await betAccountRepository.findOne({
      where: {
        accountId: user.id,
        site: site,        // ✅ Verificar site específico
        email: email       // ✅ Verificar email específico
      }
    });

    if (existingAccount) {
      return NextResponse.json({ 
        error: `Já existe uma conta do ${site} com este email` 
      }, { status: 400 });
    }

    // Testar login na plataforma para validar credenciais
    try {
      let platformInstance;
      let loginResult;
      let userToken;
      let platformToken;

      if (platform === 'biahosted') {
        // Plataforma BiaHosted (McGames, LotoGreen, etc.)
        platformInstance = createPlatformInstance(platform, site, siteUrl);
        loginResult = await platformInstance.login({ email, password });
        
        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: 'Credenciais inválidas' 
          }, { status: 400 });
        }

        // Gerar token de usuário
        const loginData = loginResult as unknown as Record<string, unknown>;
        const userData = loginData.user as Record<string, unknown> | undefined;
        const userTokenValue = userData?.token as string || loginResult.access_token;
        userToken = await platformInstance.generateToken(loginResult.access_token, userTokenValue);
        
        // Fazer sign in na plataforma
        platformToken = await platformInstance.signIn(userToken.token);

      } else if (platform === 'fssb') {
        // Plataforma FSSB (Bet7K, PixBet, etc.)
        platformInstance = createPlatformInstance(platform, site, siteUrl);
        loginResult = await platformInstance.login({ email, password });
        
        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: 'Credenciais inválidas' 
          }, { status: 400 });
        }

        // Para FSSB, não precisamos de userToken e platformToken por enquanto
        // (métodos ainda não implementados)
        userToken = { token: loginResult.access_token, user_id: 'temp' };
        platformToken = { accessToken: loginResult.access_token };
      } else {
        return NextResponse.json({ 
          error: 'Plataforma não reconhecida' 
        }, { status: 400 });
      }

      // Buscar saldo atual da conta
      let currentBalance = 0;
      try {
        if (platform === 'biahosted') {
          currentBalance = await platformInstance.getBalance(platformToken.accessToken);
        } else if (platform === 'fssb') {
          currentBalance = await platformInstance.getBalance(platformToken.accessToken);
        }
      } catch (balanceError) {
        console.warn('Erro ao buscar saldo inicial, usando 0:', balanceError);
        currentBalance = 0;
      }

      // Criar nova conta no banco de dados
      const newBetAccount = new BetAccount();
      newBetAccount.platform = platform; // 'biahosted' ou 'fssb'
      newBetAccount.site = site; // 'mcgames', 'bet7k', etc.
      newBetAccount.email = email;
      newBetAccount.password = password; // Em produção, você deveria hash a senha
      // Definir siteUrl baseado na plataforma
      if (platform === 'biahosted') {
        newBetAccount.siteUrl = siteUrl;
      } else if (platform === 'fssb') {
        // Para FSSB, usar a URL base do site
        newBetAccount.siteUrl = siteUrl;
      }
      newBetAccount.balance = currentBalance;
      
      // Obter userId baseado na plataforma
      if (platform === 'biahosted') {
        // Para BiaHosted, usar o user.id do loginResult
        const loginDataForUserId = loginResult as unknown as Record<string, unknown>;
        const userDataForUserId = loginDataForUserId.user as Record<string, unknown> | undefined;
        const userIdFromLogin = userDataForUserId?.id as number | undefined;
        newBetAccount.userId = userIdFromLogin?.toString() || userToken.user_id;
      } else if (platform === 'fssb') {
        // Para FSSB, usar o user.id do loginResult se disponível
        const loginDataForUserId = loginResult as unknown as Record<string, unknown>;
        const userDataForUserId = loginDataForUserId.user as Record<string, unknown> | undefined;
        const userIdFromLogin = userDataForUserId?.id as number | undefined;
        newBetAccount.userId = userIdFromLogin?.toString() || 'temp';
      }
      
      newBetAccount.accessToken = loginResult.access_token;
      newBetAccount.userToken = userToken.token;
      newBetAccount.platformToken = platformToken.accessToken;
      newBetAccount.isActive = true;
      newBetAccount.accountId = user.id;
      newBetAccount.lastBalanceUpdate = new Date();
      newBetAccount.lastTokenRefresh = new Date();

      const savedAccount = await betAccountRepository.save(newBetAccount);

      return NextResponse.json({
        success: true,
        data: {
          id: savedAccount.id,
          name: savedAccount.site,
          platform: savedAccount.platform,
          email: savedAccount.email,
          balance: savedAccount.balance,
          status: 'Ativo'
        }
      });

    } catch (platformError) {
      console.error('Erro ao conectar com a plataforma:', platformError);
      return NextResponse.json({ 
        error: 'Erro ao conectar com a plataforma. Verifique suas credenciais.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
