import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { BasePlatform } from '@/lib/platforms/BasePlatform';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';
import { getPlatformInstance } from '@/lib/utils/platformFactory';
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

    // Detectar plataforma baseada no site
    const platform = getPlatformInstance(account);

    switch (action) {
      case 'refresh_tokens':
        return await refreshTokens(account, platform, betAccountRepository);
      
      case 'get_balance':
        return await getBalance(account, platform, betAccountRepository);
      
      case 'get_profile':
        return await getProfile(account, platform);
      
      case 'toggle_status':
        return await toggleAccountStatus(account, betAccountRepository);
      
      case 'delete_account':
        return await deleteAccount(account, betAccountRepository);
      
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
  platform: BasePlatform, 
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

    // Preparar dados para atualização
    const updateData: Partial<BetAccount> = {
      lastTokenRefresh: new Date()
    };

    // Para plataformas FSSB, usar apenas o access_token
    if (platform instanceof FssbPlatform) {
      // Atualizar apenas o access token para FSSB
      updateData.accessToken = loginResult.access_token;
      
      // Salvar cookies de sessão para FSSB
      const currentCookies = platform.getSessionCookies();
      if (currentCookies) {
        updateData.sessionCookies = currentCookies;
      }
    } else {
      // Para plataformas Biahosted, usar o fluxo completo
      const userToken = await platform.generateToken(
        loginResult.access_token, 
        loginResult.access_token
      );

      console.log(userToken);

      // Fazer sign in para obter platform token
      const platformToken = await platform.signIn(userToken.token);

      console.log(platformToken); //platformToken.accessToken

      // Atualizar tokens no banco
      updateData.accessToken = loginResult.access_token;
      updateData.userToken = userToken.token;
      updateData.platformToken = platformToken.accessToken;
      updateData.userId = userToken.user_id;
    }

    // Atualizar no banco usando update
    await repository.update(account.id, updateData);

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
  platform: BasePlatform, 
  repository: Repository<BetAccount>
) {
  try {    
    // Para plataforma Biahosted, tentar usar token existente primeiro
    if (account.platform.toLowerCase() === 'biahosted') {
      
      // Primeiro, tentar usar o token existente se disponível
      if (account.accessToken) {
        try {
          const balance = await platform.getBalance(account.accessToken);
          
          // Atualizar saldo no banco (valor já vem em centavos da API)
          account.balance = balance;
          account.lastBalanceUpdate = new Date();
          await repository.save(account);

          return NextResponse.json({
            success: true,
            data: {
              accountId: account.id,
              site: account.site,
              balance: balance / 100, // Converter centavos para reais
              lastBalanceUpdate: account.lastBalanceUpdate,
              message: `Token existente válido para ${account.site}`
            }
          });
          
        } catch {
          console.log(`⚠️ Token expirado para ${account.site}, fazendo login...`);
          // Token expirado, continuar para fazer login
        }
      }
      
      // Se chegou aqui, token não existe ou expirou - fazer login
      console.log(`🍪 Fazendo login para obter novo token para ${account.site}...`);
      
      try {
        // Fazer login para obter cookies de sessão
        const loginResult = await platform.login({ 
          email: account.email, 
          password: account.password 
        });

        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: `Falha no login do ${account.site} - credenciais inválidas` 
          }, { status: 400 });
        }

        console.log(`✅ Login do ${account.site} realizado - novo token obtido`);
        
        // Usar o access_token do login para buscar saldo
        const balance = await platform.getBalance(loginResult.access_token);

        console.log(`💰 Saldo obtido do ${account.site}: ${balance} centavos`);

        // Preparar dados para atualização
        const updateData: Partial<BetAccount> = {
          balance: balance,
          lastBalanceUpdate: new Date()
        };
        
        // Salvar cookies de sessão se disponíveis (para FSSB)
        if (account.platform.toLowerCase() === 'fssb' && platform instanceof FssbPlatform) {
          const currentCookies = platform.getSessionCookies();
          if (currentCookies) {
            updateData.sessionCookies = currentCookies;
            console.log(`🍪 Cookies salvos para ${account.site}: ${currentCookies.substring(0, 50)}...`);
          }
        }
        
        // Atualizar no banco usando update
        await repository.update(account.id, updateData);

        console.log(`✅ Saldo atualizado: R$ ${(balance / 100).toFixed(2)} para ${account.site}`);

        return NextResponse.json({
          success: true,
          data: {
            accountId: account.id,
            site: account.site,
            balance: balance / 100, // Converter centavos para reais
            lastBalanceUpdate: account.lastBalanceUpdate,
            message: `Novo token obtido para ${account.site}`
          }
        });

      } catch (loginError) {
        console.error(`❌ Erro no login do ${account.site}:`, loginError);
        return NextResponse.json({ 
          error: `Erro no login do ${account.site}. Verifique as credenciais.` 
        }, { status: 400 });
      }
    }

    // Para plataforma FSSB, tentar usar token existente primeiro
    if (account.platform.toLowerCase() === 'fssb') {
      // Primeiro, tentar usar o token existente se disponível
      if (account.accessToken) {
        try {
          const balance = await platform.getBalance(account.accessToken);
          
          // Atualizar saldo no banco (valor já vem em centavos da API)
          account.balance = balance;
          account.lastBalanceUpdate = new Date();
          await repository.save(account);

          return NextResponse.json({
            success: true,
            data: {
              accountId: account.id,
              site: account.site,
              balance: balance / 100, // Converter centavos para reais
              lastBalanceUpdate: account.lastBalanceUpdate,
              message: `Token existente válido para ${account.site}`
            }
          });
          
        } catch {
          console.log(`⚠️ Token expirado para ${account.site}, fazendo login...`);
          // Token expirado, continuar para fazer login
        }
      }
      
      // Se chegou aqui, token não existe ou expirou - fazer login
      console.log(`🍪 Fazendo login para obter novo token para ${account.site}...`);
      
      try {
        // Fazer login para obter novo token
        const loginResult = await platform.login({
          email: account.email,
          password: account.password
        });

        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: 'Falha no login - credenciais inválidas' 
          }, { status: 400 });
        }

        // Para FSSB, usar apenas o access_token (não tem generateToken)
        const balance = await platform.getBalance(loginResult.access_token);

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
            message: `Novo token obtido para ${account.site}`
          }
        });

      } catch (loginError) {
        console.error(`❌ Erro no login do ${account.site}:`, loginError);
        return NextResponse.json({ 
          error: `Erro no login do ${account.site}. Verifique as credenciais.` 
        }, { status: 400 });
      }
    }

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
async function getProfile(account: BetAccount, platform: BasePlatform) {
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

// Função para ativar/desativar conta
async function toggleAccountStatus(
  account: BetAccount, 
  repository: Repository<BetAccount>
) {
  try {
    console.log(`🔄 Alternando status da conta ${account.id} (${account.site})`);
    
    // Alternar o status atual
    const newStatus = !account.isActive;
    
    // Atualizar no banco
    account.isActive = newStatus;
    await repository.save(account);

    const statusText = newStatus ? 'ativada' : 'desativada';
    console.log(`✅ Conta ${account.site} ${statusText} com sucesso`);

    return NextResponse.json({
      success: true,
      data: {
        message: `Conta ${statusText} com sucesso`,
        accountId: account.id,
        site: account.site,
        isActive: newStatus,
        status: newStatus ? 'Ativo' : 'Inativo'
      }
    });

  } catch (error) {
    console.error(`❌ Erro ao alternar status da conta ${account.site}:`, error);
    return NextResponse.json({ 
      error: 'Erro ao alterar status da conta' 
    }, { status: 400 });
  }
}

// Função para excluir conta
async function deleteAccount(
  account: BetAccount, 
  repository: Repository<BetAccount>
) {
  try {
    console.log(`🗑️ Excluindo conta ${account.id} (${account.site})`);
    
    // Excluir a conta do banco
    await repository.remove(account);

    console.log(`✅ Conta ${account.site} excluída com sucesso`);

    return NextResponse.json({
      success: true,
      data: {
        message: `Conta ${account.site} excluída com sucesso`,
        accountId: account.id,
        site: account.site,
        deleted: true
      }
    });

  } catch (error) {
    console.error(`❌ Erro ao excluir conta ${account.site}:`, error);
    return NextResponse.json({ 
      error: 'Erro ao excluir conta' 
    }, { status: 400 });
  }
}

