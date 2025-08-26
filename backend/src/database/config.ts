import { Pool, PoolConfig } from 'pg';

export interface DatabaseConfig extends PoolConfig {
  database: string;
  host: string;
  port: number;
  user: string;
  password: string;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'makan_moments',
  user: process.env.DB_USER || 'makan_user',
  password: process.env.DB_PASSWORD || 'makan_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export default config;