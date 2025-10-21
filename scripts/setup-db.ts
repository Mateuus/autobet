import 'reflect-metadata';
import { AppDataSource } from '../src/lib/database';
import { Account } from '../src/database/entities/Account';
import bcrypt from 'bcryptjs';

async function runMigrations() {
  try {
    console.log('🔄 Executando migrations...');
    
    await AppDataSource.initialize();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Executar migrations
    await AppDataSource.runMigrations();
    console.log('✅ Migrations executadas com sucesso');

    // Verificar se já existe um usuário de teste
    const accountRepository = AppDataSource.getRepository(Account);
    const existingUser = await accountRepository.findOne({ where: { email: 'teste@teste.com' } });

    if (!existingUser) {
      console.log('🔄 Criando usuário de teste...');
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash('123456', 12);

      // Criar usuário de teste
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

    console.log('🎉 Setup do banco concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error);
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Verifique se o MySQL está rodando');
    console.log('2. Confirme as credenciais no arquivo .env');
    console.log('3. Crie o banco de dados "autobet" no MySQL');
    console.log('4. Verifique se o usuário tem permissões adequadas');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
