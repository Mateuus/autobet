import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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
    // Verificar autenticação
    const authResult = verifyToken(request);
    if (!authResult) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }

    const userId = authResult.userId;

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
        
        // Fazer login para obter novo token
        const loginResult = await platform.login({
          email: account.email,
          password: account.password
        });

        // Gerar novo token de usuário
        const userToken = await platform.generateToken(loginResult.access_token, account.userToken || '');

        // Obter saldo atualizado
        const balance = await platform.getBalance(userToken.token);

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
