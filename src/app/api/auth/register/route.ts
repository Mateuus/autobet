import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '@/database/data-source';
import { Account } from '@/database/entities/Account';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de senha
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Garantir que o banco está conectado
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Verificar se o email já existe
    const accountRepository = AppDataSource.getRepository(Account);
    const existingUser = await accountRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar novo usuário
    const newUser = accountRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      isActive: true,
    });

    // Salvar no banco de dados
    const savedUser = await accountRepository.save(newUser);

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: savedUser.id, 
        email: savedUser.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        token,
      },
      message: 'Conta criada com sucesso'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
