import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AppDataSource } from './src/database/data-source';

// Exportar a configuração do DataSource para uso com TypeORM CLI
export default AppDataSource;
