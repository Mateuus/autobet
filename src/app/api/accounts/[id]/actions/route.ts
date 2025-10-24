import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';
import { BasePlatform } from '@/lib/platforms/BasePlatform';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';
import { getPlatformInstance } from '@/lib/utils/platformFactory';
import { SiteAuthService } from '@/services/siteAuth';
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
    const siteAuth = new SiteAuthService(account.siteUrl, account.sessionCookies);

    switch (action) {
      case 'refresh_tokens':
        return await refreshTokens(account, platform, siteAuth, betAccountRepository);
      
      case 'get_balance':
        return await getBalance(account, platform, siteAuth, betAccountRepository);
      
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
  siteAuth: SiteAuthService,
  repository: Repository<BetAccount>
) {
  try {

    // Fazer login na base do site para obter novos tokens
    const loginResult = await siteAuth.login({ 
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

    // Para plataformas FSSB, usar o fluxo completo com launch + signIn
    if (platform instanceof FssbPlatform) {
      // Atualizar access token para FSSB
      updateData.accessToken = loginResult.access_token;
      
      // Fazer launch para obter URL da plataforma
      const launchResponse = await siteAuth.launch(loginResult.access_token, account.site);
      
      if (!launchResponse.success) {
        throw new Error('Falha no launch da plataforma');
      }
      
      // Fazer signIn para capturar cookies da plataforma
      const platformToken = await platform.signIn(launchResponse.url);
      
      // Salvar cookies da plataforma no platformToken
      updateData.platformToken = platformToken.accessToken;
      
      // Salvar cookies de sessão do site
      const currentCookies = siteAuth.getSessionCookies();
      if (currentCookies) {
        updateData.sessionCookies = currentCookies;
      }
    } else {
      // Para plataformas Biahosted, usar o fluxo completo
      const userToken = await platform.generateToken(
        loginResult.access_token, 
        loginResult.access_token
      );

      // Fazer sign in para obter platform token
      const platformToken = await platform.signIn(userToken.token);

      // Atualizar tokens no banco
      updateData.accessToken = loginResult.access_token;
      updateData.userToken = userToken.token;
      updateData.platformToken = platformToken.accessToken;
      updateData.userId = userToken.user_id;
    }

    // Atualizar no banco usando save para evitar locks
    Object.assign(account, updateData);
    
    // Adicionar timeout para evitar travamentos
    const savePromise = repository.save(account);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na operação de banco')), 10000)
    );
    
    await Promise.race([savePromise, timeoutPromise]);

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
    console.error(`Erro ao renovar tokens para ${account.site}:`, error);
    return NextResponse.json({ 
      error: 'Erro ao renovar tokens. Verifique as credenciais.' 
    }, { status: 400 });
  }
}

// Função para buscar saldo
async function getBalance(
  account: BetAccount, 
  platform: BasePlatform,
  siteAuth: SiteAuthService,
  repository: Repository<BetAccount>
) {
  try {    
    // Para plataforma Biahosted, tentar usar token existente primeiro
    if (account.platform.toLowerCase() === 'biahosted') {
      
      // Primeiro, tentar usar o token existente se disponível
      if (account.accessToken) {
        try {
          // Carregar cookies de sessão se disponíveis
          if (account.sessionCookies) {
            siteAuth.setSessionCookies(account.sessionCookies);
          }
          
          const balance = await siteAuth.getBalance(account.accessToken);
          
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
          // Token expirado, continuar para fazer login
        }
      }
      
      // Se chegou aqui, token não existe ou expirou - fazer login
      
      try {
        // Fazer login para obter cookies de sessão
        const loginResult = await siteAuth.login({ 
          email: account.email, 
          password: account.password 
        });

        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: `Falha no login do ${account.site} - credenciais inválidas` 
          }, { status: 400 });
        }

        // Usar o access_token do login para buscar saldo
        const balance = await siteAuth.getBalance(loginResult.access_token);

        // Preparar dados para atualização
        const updateData: Partial<BetAccount> = {
          balance: balance,
          lastBalanceUpdate: new Date()
        };
        
        // Salvar cookies de sessão do site
        const currentCookies = siteAuth.getSessionCookies();
        if (currentCookies) {
          updateData.sessionCookies = currentCookies;
        }
        
        // Atualizar no banco usando save para evitar locks
        Object.assign(account, updateData);
        
        // Adicionar timeout para evitar travamentos
        const savePromise = repository.save(account);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na operação de banco')), 10000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);

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
        console.error(`Erro no login do ${account.site}:`, loginError);
        return NextResponse.json({ 
          error: `Erro ao conectar com ${account.site}. Verifique as credenciais.` 
        }, { status: 400 });
      }
    }

    // Para plataforma FSSB, tentar usar token existente primeiro
    if (account.platform.toLowerCase() === 'fssb') {
      // Primeiro, tentar usar o token existente se disponível
      if (account.accessToken && account.sessionCookies) {
        // Verificar se o token não é muito antigo (mais de 1 hora)
        const tokenAge = account.lastTokenRefresh ? 
          (Date.now() - new Date(account.lastTokenRefresh).getTime()) / (1000 * 60 * 60) : 999;
        
        if (tokenAge < 1) {
          try {
            // Carregar cookies de sessão do site
            if (account.sessionCookies) {
              siteAuth.setSessionCookies(account.sessionCookies);
            }
            
            const balance = await siteAuth.getBalance(account.accessToken);
            
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
                // Token expirado, continuar para fazer login
          }
        } else {
          // Token muito antigo, continuar para fazer login
        }
      }
      
      // Se chegou aqui, token não existe ou expirou - fazer login
      
      try {
        // Fazer login para obter novo token
        const loginResult = await siteAuth.login({
          email: account.email,
          password: account.password
        });

        if (!loginResult.access_token) {
          return NextResponse.json({ 
            error: 'Falha no login - credenciais inválidas' 
          }, { status: 400 });
        }

        // Para FSSB, usar apenas o access_token (não tem generateToken)
        const balance = await siteAuth.getBalance(loginResult.access_token);

        // Preparar dados para atualização
        const updateData: Partial<BetAccount> = {
          balance: balance,
          lastBalanceUpdate: new Date(),
          accessToken: loginResult.access_token
        };

        // Salvar cookies de sessão do login
        const currentCookies = siteAuth.getSessionCookies();
        if (currentCookies) {
          updateData.sessionCookies = currentCookies;
        }

        // Atualizar no banco usando save para evitar locks
        Object.assign(account, updateData);
        
        // Adicionar timeout para evitar travamentos
        const savePromise = repository.save(account);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na operação de banco')), 10000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);

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
        console.error(`Erro no login do ${account.site}:`, loginError);
        return NextResponse.json({ 
          error: `Erro ao conectar com ${account.site}. Verifique as credenciais.` 
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error(`Erro ao buscar saldo para ${account.site}:`, error);
    
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
    // Verificar se tem token válido
    if (!account.accessToken) {
      return NextResponse.json({ 
        error: 'Conta sem token válido. Execute refresh_tokens primeiro.' 
      }, { status: 400 });
    }

    // Buscar perfil usando o accessToken do login
    const profile = await platform.getProfile(account.accessToken);

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        site: account.site,
        profile: profile
      }
    });

  } catch (error) {
    console.error(`Erro ao buscar perfil para ${account.site}:`, error);
    
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
    // Alternar o status atual
    const newStatus = !account.isActive;
    
    // Atualizar no banco
    account.isActive = newStatus;
    await repository.save(account);

    const statusText = newStatus ? 'ativada' : 'desativada';

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
    console.error(`Erro ao alternar status da conta ${account.site}:`, error);
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
    // Excluir a conta do banco
    await repository.remove(account);

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
    console.error(`Erro ao excluir conta ${account.site}:`, error);
    return NextResponse.json({ 
      error: 'Erro ao excluir conta' 
    }, { status: 400 });
  }
}

