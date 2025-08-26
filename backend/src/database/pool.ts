import { Pool } from 'pg';
import config from './config';

class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool(config);
    
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    this.pool.on('connect', () => {
      console.log('🐘 Connected to PostgreSQL database');
    });
  }

  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  public async getClient() {
    return this.pool.connect();
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default DatabasePool;