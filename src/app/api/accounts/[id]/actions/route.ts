import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { BiahostedPlatform } from '@/lib/platforms/BiahostedPlatform';
import { Repository } from 'typeorm';
import { verifyJWTToken } from '@/lib/auth/jwt';

// POST /api/accounts/[id]/actions - Executar ações na conta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json();
    const { action } = body;

    // Aguardar params antes de usar
    const { id } = await params;

    // Inicializar conexão com o banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Buscar a conta específica
    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    const account = await betAccountRepository.findOne({
      where: {
        id: id,
        accountId: userId
      }
    });

    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    const platform = new BiahostedPlatform(account.site, account.siteUrl);

    switch (action) {
      case 'refresh_tokens':
        return await refreshTokens(account, platform, betAccountRepository);
      
      case 'get_balance':
        return await getBalance(account, platform, betAccountRepository);
      
      case 'get_profile':
        return await getProfile(account, platform);
      
      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao executar ação na conta:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Função para renovar tokens
async function refreshTokens(
  account: BetAccount, 
  platform: BiahostedPlatform, 
  repository: Repository<BetAccount>
) {
  try {
    console.log(`🔄 Renovando tokens para conta ${account.id} (${account.site})`);

    // Fazer login novamente para obter novos tokens
    const loginResult = await platform.login({ 
      email: account.email, 
      password: account.password 
    });

    if (!loginResult.access_token) {
      return NextResponse.json({ 
        error: 'Falha no login - credenciais inválidas' 
      }, { status: 400 });
    }

    // Gerar novo token de usuário
    const userToken = await platform.generateToken(
      loginResult.access_token, 
      loginResult.access_token
    );

    console.log(userToken);

    // Fazer sign in para obter platform token
    const platformToken = await platform.signIn(userToken.token);

    console.log(platformToken); //platformToken.accessToken

    // Atualizar tokens no banco
    account.accessToken = loginResult.access_token;
    account.userToken = userToken.token;
    account.platformToken = platformToken.accessToken;
    account.userId = userToken.user_id;
    account.lastTokenRefresh = new Date();

    await repository.save(account);

    console.log(`✅ Tokens renovados com sucesso para ${account.site}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Tokens renovados com sucesso',
        accountId: account.id,
        site: account.site,
        lastTokenRefresh: account.lastTokenRefresh
      }
    });

  } catch (error) {
    console.error(`❌ Erro ao renovar tokens para ${account.site}:`, error);
    return NextResponse.json({ 
      error: 'Erro ao renovar tokens. Verifique as credenciais.' 
    }, { status: 400 });
  }
}

// Função para buscar saldo
async function getBalance(
  account: BetAccount, 
  platform: BiahostedPlatform, 
  repository: Repository<BetAccount>
) {
  try {
    console.log(`💰 Buscando saldo para conta ${account.id} (${account.site})`);  
    
    // Para McGames, fazer login primeiro para obter cookies de sessão
    if (account.site.toLowerCase() === 'mcgames') {
      console.log(`🍪 McGames detectado - fazendo login para obter cookies de sessão`);
      
      try {
        // Fazer login para obter cookies de sessão
        const loginResult = await platform.login({ 
          email: account.email, 
          password: account.password 
        });

        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: 'Falha no login do McGames - credenciais inválidas' 
          }, { status: 400 });
        }

        console.log(`✅ Login do McGames realizado - cookies de sessão obtidos`);
        
        // Usar o access_token do login para buscar saldo
        const balance = await platform.getBalance(loginResult.access_token);

        console.log(`💰 Saldo obtido do McGames: ${balance} centavos`);

        // Atualizar saldo no banco (valor já vem em centavos da API)
        account.balance = balance;
        account.lastBalanceUpdate = new Date();
        await repository.save(account);

        console.log(`✅ Saldo atualizado: R$ ${(balance / 100).toFixed(2)} para ${account.site}`);

        return NextResponse.json({
          success: true,
          data: {
            accountId: account.id,
            site: account.site,
            balance: balance / 100, // Converter centavos para reais
            lastBalanceUpdate: account.lastBalanceUpdate,
            message: 'Login automático realizado para McGames'
          }
        });

      } catch (loginError) {
        console.error(`❌ Erro no login automático do McGames:`, loginError);
        return NextResponse.json({ 
          error: 'Erro no login automático do McGames. Verifique as credenciais.' 
        }, { status: 400 });
      }
    }

    // Para outros sites, usar o fluxo normal
    // Verificar se tem token válido
    if (!account.accessToken) {
      return NextResponse.json({ 
        error: 'Conta sem token válido. Execute refresh_tokens primeiro.' 
      }, { status: 400 });
    }

    // Buscar saldo usando o accessToken do login
    const balance = await platform.getBalance(account.accessToken);

    console.log(balance);

    // Atualizar saldo no banco (valor já vem em centavos da API)
    account.balance = balance;
    account.lastBalanceUpdate = new Date();
    await repository.save(account);

    console.log(`✅ Saldo atualizado: R$ ${(balance / 100).toFixed(2)} para ${account.site}`);

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        site: account.site,
        balance: balance / 100, // Converter centavos para reais
        lastBalanceUpdate: account.lastBalanceUpdate
      }
    });

  } catch (error) {
    console.error(`❌ Erro ao buscar saldo para ${account.site}:`, error);
    
    // Se erro 401, sugerir renovação de tokens
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ 
        error: 'Token expirado. Execute refresh_tokens primeiro.',
        suggestion: 'refresh_tokens'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Erro ao buscar saldo' 
    }, { status: 400 });
  }
}

// Função para buscar perfil completo
async function getProfile(account: BetAccount, platform: BiahostedPlatform) {
  try {
    console.log(`👤 Buscando perfil para conta ${account.id} (${account.site})`);

    // Verificar se tem token válido
    if (!account.accessToken) {
      return NextResponse.json({ 
        error: 'Conta sem token válido. Execute refresh_tokens primeiro.' 
      }, { status: 400 });
    }

    // Buscar perfil usando o accessToken do login
    const profile = await platform.getProfile(account.accessToken);

    console.log(`✅ Perfil obtido para ${account.site}`);

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        site: account.site,
        profile: profile
      }
    });

  } catch (error) {
    console.error(`❌ Erro ao buscar perfil para ${account.site}:`, error);
    
    // Se erro 401, sugerir renovação de tokens
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ 
        error: 'Token expirado. Execute refresh_tokens primeiro.',
        suggestion: 'refresh_tokens'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Erro ao buscar perfil' 
    }, { status: 400 });
  }
}
