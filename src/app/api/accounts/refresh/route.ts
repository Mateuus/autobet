import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/lib/auth/jwt';
import { BiahostedPlatform } from '@/lib/platforms/BiahostedPlatform';
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
        const platform = new BiahostedPlatform(account.site, account.siteUrl);
        
        // Para McGames e EstrelaBet, fazer login primeiro para obter cookies de sessão
        if (account.site.toLowerCase() === 'mcgames' || account.site.toLowerCase() === 'estrelabet') {
          console.log(`🍪 ${account.site} detectado - fazendo login para obter cookies de sessão`);
          
          try {
            // Fazer login para obter cookies de sessão
            const loginResult = await platform.login({ 
              email: account.email, 
              password: account.password 
            });

            if (!loginResult.access_token) {
              throw new Error(`Falha no login do ${account.site} - credenciais inválidas`);
            }

            console.log(`✅ Login do ${account.site} realizado - cookies de sessão obtidos`);
            
            // Usar o access_token do login para buscar saldo
            const balance = await platform.getBalance(loginResult.access_token);

            console.log(`💰 Saldo obtido do ${account.site}: ${balance} centavos`);

            // Atualizar conta no banco
            await betAccountRepository.update(account.id, {
              accessToken: loginResult.access_token,
              balance: balance,
              lastBalanceUpdate: new Date(),
              lastTokenRefresh: new Date()
            });

            return {
              id: account.id,
              name: account.site,
              success: true,
              balance: balance,
              message: `Login automático realizado para ${account.site}`
            };

          } catch (loginError) {
            console.error(`❌ Erro no login automático do ${account.site}:`, loginError);
            throw new Error(`Erro no login automático do ${account.site}. Verifique as credenciais.`);
          }
        }

        // Para outros sites, usar o fluxo normal
        // Fazer login para obter novo token
        const loginResult = await platform.login({
          email: account.email,
          password: account.password
        });

        if (!loginResult.access_token) {
          throw new Error('Falha no login - credenciais inválidas');
        }

        // Gerar novo token de usuário
        const userToken = await platform.generateToken(loginResult.access_token, loginResult.access_token);

        // Obter saldo atualizado
        const balance = await platform.getBalance(loginResult.access_token);

        // Atualizar conta no banco
        await betAccountRepository.update(account.id, {
          accessToken: loginResult.access_token,
          userToken: userToken.token,
          balance: balance,
          lastBalanceUpdate: new Date(),
          lastTokenRefresh: new Date()
        });

        return {
          id: account.id,
          name: account.site,
          success: true,
          balance: balance,
          message: 'Conta atualizada com sucesso'
        };
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
