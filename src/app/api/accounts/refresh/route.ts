import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/lib/auth/jwt';
import { getPlatformInstance } from '@/lib/utils/platformFactory';
import { FssbPlatform } from '@/lib/platforms/FssbPlatform';
import { SiteAuthService } from '@/services/siteAuth';
import { AppDataSource } from '@/database/data-source';
import { BetAccount } from '@/database/entities/BetAccount';

interface UpdateResult {
  id: string;
  name: string;
  success: boolean;
  balance?: number;
  message?: string;
  error?: string;
}

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

    // Buscar todas as contas de apostas ativas do usuário
    const betAccountRepository = AppDataSource.getRepository(BetAccount);
    const accounts = await betAccountRepository.find({
      where: {
        accountId: userId,
        isActive: true
      }
    });

    if (accounts.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhuma conta ativa encontrada' 
      }, { status: 404 });
    }

    // Atualizar todas as contas em paralelo
    const updatePromises = accounts.map(async (account: BetAccount) => {
      try {
        const platform = getPlatformInstance(account);
        
        // Para plataforma Biahosted, tentar usar token existente primeiro
        if (account.platform.toLowerCase() === 'biahosted') {          
          // Primeiro, tentar usar o token existente se disponível
          if (account.accessToken) {
            try {
              const balance = await platform.getBalance(account.accessToken);
              
              // Atualizar conta no banco
              await betAccountRepository.update(account.id, {
                balance: balance,
                lastBalanceUpdate: new Date()
              });

              return {
                id: account.id,
                name: account.site,
                success: true,
                balance: balance,
                message: `Token existente válido para ${account.site}`
              };
              
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
              throw new Error(`Falha no login do ${account.site} - credenciais inválidas`);
            }

            console.log(`✅ Login do ${account.site} realizado - novo token obtido`);
            
            // Usar o access_token do login para buscar saldo
            const balance = await platform.getBalance(loginResult.access_token);

            console.log(`💰 Saldo obtido do ${account.site}: ${balance} centavos`);

            // Preparar dados para atualização
            const updateData: Partial<BetAccount> = {
              accessToken: loginResult.access_token,
              balance: balance,
              lastBalanceUpdate: new Date(),
              lastTokenRefresh: new Date()
            };
            
            // Salvar cookies de sessão se disponíveis (para FSSB)
            if (account.platform.toLowerCase() === 'fssb' && platform instanceof FssbPlatform) {
              const currentCookies = platform.getSessionCookies();
              if (currentCookies) {
                updateData.sessionCookies = currentCookies;
              }
            }
            
            // Atualizar conta no banco
            await betAccountRepository.update(account.id, updateData);

            return {
              id: account.id,
              name: account.site,
              success: true,
              balance: balance,
              message: `Novo token obtido para ${account.site}`
            };

          } catch (loginError) {
            console.error(`❌ Erro no login do ${account.site}:`, loginError);
            throw new Error(`Erro no login do ${account.site}. Verifique as credenciais.`);
          }
        }

        // Para plataforma FSSB, usar SiteAuthService para login
        if (account.platform.toLowerCase() === 'fssb') {          
          // Primeiro, tentar usar o token existente se disponível
          if (account.accessToken) {
            try {
              const balance = await platform.getBalance(account.accessToken);              
              // Atualizar conta no banco
              await betAccountRepository.update(account.id, {
                balance: balance,
                lastBalanceUpdate: new Date()
              });

              return {
                id: account.id,
                name: account.site,
                success: true,
                balance: balance,
                message: `Token existente válido para ${account.site}`
              };
              
            } catch {
              console.log(`⚠️ Token expirado para ${account.site}, fazendo login...`);
              // Token expirado, continuar para fazer login
            }
          }
          
          // Se chegou aqui, token não existe ou expirou - fazer login usando SiteAuthService
          console.log(`🍪 Fazendo login usando SiteAuthService para obter novo token para ${account.site}...`);
          
          try {
            // Criar instância do SiteAuthService para fazer login no site
            const siteAuthService = new SiteAuthService(
              account.siteUrl,
              account,
              betAccountRepository,
              account.sessionCookies
            );

            // Fazer login usando SiteAuthService
            const loginResult = await siteAuthService.login({
              email: account.email,
              password: account.password
            });

            if (!loginResult.access_token) {
              throw new Error('Falha no login - credenciais inválidas');
            }

            console.log(`✅ Login do ${account.site} realizado via SiteAuthService - novo token obtido`);

            // Usar o access_token do SiteAuthService para buscar saldo via plataforma
            const balance = await siteAuthService.getBalance(loginResult.access_token);

            console.log(`💰 Saldo obtido do ${account.site}: ${balance} centavos`);

            // Preparar dados para atualização
            const updateData: Partial<BetAccount> = {
              accessToken: loginResult.access_token,
              balance: balance,
              lastBalanceUpdate: new Date(),
              lastTokenRefresh: new Date()
            };
            
            // Salvar cookies de sessão do SiteAuthService se disponíveis
            const currentCookies = siteAuthService.getSessionCookies();
            if (currentCookies) {
              updateData.sessionCookies = currentCookies;
            }

            // Atualizar conta no banco
            await betAccountRepository.update(account.id, updateData);

            return {
              id: account.id,
              name: account.site,
              success: true,
              balance: balance,
              message: `Novo token obtido via SiteAuthService para ${account.site}`
            };

          } catch (loginError) {
            console.error(`❌ Erro no login do ${account.site}:`, loginError);
            throw new Error(`Erro no login do ${account.site}. Verifique as credenciais.`);
          }
        }

        // Se chegou aqui, plataforma não reconhecida
        throw new Error(`Plataforma não suportada: ${account.platform}`);
      } catch (error) {
        console.error(`Erro ao atualizar conta ${account.site}:`, error);
        return {
          id: account.id,
          name: account.site,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    });

    // Aguardar todas as atualizações
    const results = await Promise.all(updatePromises);

    // Contar sucessos e falhas
    const successful = results.filter((r: UpdateResult) => r.success).length;
    const failed = results.filter((r: UpdateResult) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Atualização concluída: ${successful} sucessos, ${failed} falhas`,
      data: {
        total: accounts.length,
        successful,
        failed,
        results
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar contas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
