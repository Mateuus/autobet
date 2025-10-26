import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from "typeorm";
import { Account } from './entities/Account';
import { BetAccount } from './entities/BetAccount';
import { BetBilhete } from '@/entities/BetBilhete';
import { BetBetting } from '@/entities/BetBetting';

// Configuração das variáveis de ambiente
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

// Define o nome do banco de dados com base no ambiente
const databaseName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: port,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: databaseName || 'autobet',
    synchronize: process.env.NODE_ENV !== 'production', // Apenas em desenvolvimento
    logging: false,//process.env.NODE_ENV === 'development',
    entities: [Account, BetAccount, BetBilhete, BetBetting],
    subscribers: [],
    migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
    timezone: 'Z',
    charset: 'utf8mb4',
})