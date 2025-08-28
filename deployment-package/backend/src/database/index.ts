import DatabasePool from './pool';

const db = DatabasePool.getInstance();

export const query = (text: string, params?: any[]) => db.query(text, params);
export const getClient = () => db.getClient();
export const pool = db.getPool();

export default db;