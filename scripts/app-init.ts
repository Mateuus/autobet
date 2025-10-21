#!/usr/bin/env node

/**
 * Script de inicialização global do AutoBet App
 * 
 * Este script é executado antes do Next.js iniciar e:
 * 1. Carrega as variáveis de ambiente
 * 2. Inicializa a conexão com o banco de dados
 * 3. Executa migrations se necessário
 * 4. Cria dados de teste se não existirem
 */

import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import { Account } from '../src/database/entities/Account';
import bcrypt from 'bcryptjs';

// Configurações
const SKIP_DB_INIT = process.env.SKIP_DB_INIT === 'true';

/**
 * Inicializa a conexão com o banco de dados
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Inicializando conexão com o banco de dados...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Banco de dados conectado com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    console.log('ℹ️ A aplicação continuará funcionando com dados mock');
    throw error;
  }
}

/**
 * Executa migrations se necessário
 */
async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Verificando migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations executadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  }
}

/**
 * Cria dados de teste se não existirem
 */
async function createTestData(): Promise<void> {
  try {
    const accountRepository = AppDataSource.getRepository(Account);
    const existingUser = await accountRepository.findOne({ 
      where: { email: 'teste@teste.com' } 
    });

    if (!existingUser) {
      console.log('🔄 Criando usuário de teste...');
      
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const testAccount = accountRepository.create({
        email: 'teste@teste.com',
        password: hashedPassword,
        name: 'Usuário Teste',
        isActive: true,
      });

      await accountRepository.save(testAccount);
      console.log('✅ Usuário de teste criado com sucesso');
      console.log('📧 Email: teste@teste.com');
      console.log('🔑 Senha: 123456');
    } else {
      console.log('ℹ️ Usuário de teste já existe');
    }
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    throw error;
  }
}

/**
 * Função principal de inicialização
 */
async function initializeApp(): Promise<void> {
  console.log('🚀 Iniciando AutoBet App...');
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar se deve pular a inicialização do banco
  if (SKIP_DB_INIT) {
    console.log('⏭️ Pulando inicialização do banco de dados (SKIP_DB_INIT=true)');
    return;
  }

  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Executar migrations
    await runMigrations();
    
    // Criar dados de teste
    await createTestData();
    
    console.log('🎉 Inicialização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error);
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Verifique se o MySQL está rodando');
    console.log('2. Confirme as credenciais no arquivo .env');
    console.log('3. Crie o banco de dados "autobet" no MySQL');
    console.log('4. Para pular a inicialização do banco, use: SKIP_DB_INIT=true');
    console.log('\n🔧 A aplicação continuará funcionando com dados mock!');
  }
}

/**
 * Função para limpar recursos
 */
async function cleanup(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('🔌 Conexão com banco de dados encerrada');
  }
}

// Executar inicialização se chamado diretamente
if (require.main === module) {
  initializeApp()
    .then(() => {
      console.log('✅ Script de inicialização concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script de inicialização:', error);
      process.exit(1);
    });
}

// Exportar funções para uso em outros módulos
export { 
  initializeApp, 
  initializeDatabase, 
  runMigrations, 
  createTestData, 
  cleanup 
};
