import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AppDataSource } from '@/database/data-source';
import { Account } from '@/database/entities/Account';

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Garantir que o banco está conectado
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Buscar dados do usuário no banco de dados
    const accountRepository = AppDataSource.getRepository(Account);
    const userData = await accountRepository.findOne({ 
      where: { id: user.userId } 
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!userData.isActive) {
      return NextResponse.json(
        { success: false, error: 'Conta desativada' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          isActive: userData.isActive,
          lastLoginAt: userData.lastLoginAt,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      },
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
