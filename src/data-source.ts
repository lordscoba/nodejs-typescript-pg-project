import dotenv from 'dotenv';
import path from 'path';
import { DataSource } from 'typeorm';
import { Organisation } from './entity/organisation.entities';
import { User } from './entity/user.entities';

// Configure dotenv to load the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Organisation],
  subscribers: [],
  migrations: [User, Organisation],
  // migrationsTableName: 'custom_migration_table',
});
