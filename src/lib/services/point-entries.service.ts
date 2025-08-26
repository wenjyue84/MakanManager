import { query } from '../database';
import { PointEntry } from '../types';

export class PointEntriesService {
  async create(entry: Omit<PointEntry, 'id' | 'createdAt'>): Promise<PointEntry> {
    const result = await query(
      `INSERT INTO point_entries (user_id, points, reason) VALUES ($1,$2,$3) RETURNING id, user_id as "userId", points, reason, created_at as "createdAt"`,
      [entry.userId, entry.points, entry.reason]
    );
    return result.rows[0];
  }
}

export default PointEntriesService;
