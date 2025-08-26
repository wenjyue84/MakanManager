import { query } from '../database';

export interface PointEntry {
  id: string;
  managerId: string;
  targetUserId: string;
  sourceType: 'task' | 'discipline';
  sourceId?: string;
  points: number;
  createdAt: string;
}

export class PointsService {
  /**
   * Get total points a manager has allocated/deducted today.
   * Used for daily budget calculations.
   */
  async getManagerDailyUsage(managerId: string, date: Date = new Date()): Promise<number> {
    const result = await query(
      `SELECT COALESCE(SUM(ABS(points)), 0) AS used
       FROM point_entries
       WHERE manager_id = $1 AND created_at::date = $2::date`,
      [managerId, date.toISOString()]
    );
    return parseInt(result.rows[0]?.used ?? '0', 10);
  }

  /**
   * Insert a point entry after verifying the manager has sufficient daily budget.
   * Throws an error if the budget would be exceeded.
   */
  async addEntry(entry: Omit<PointEntry, 'id' | 'createdAt'>, dailyLimit: number): Promise<PointEntry> {
    const used = await this.getManagerDailyUsage(entry.managerId);
    const cost = Math.abs(entry.points);
    if (used + cost > dailyLimit) {
      throw new Error('Daily budget exceeded');
    }
    const result = await query(
      `INSERT INTO point_entries (manager_id, target_user_id, source_type, source_id, points)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, manager_id as "managerId", target_user_id as "targetUserId",
                 source_type as "sourceType", source_id as "sourceId",
                 points, created_at as "createdAt"`,
      [entry.managerId, entry.targetUserId, entry.sourceType, entry.sourceId, entry.points]
    );
    return result.rows[0];
  }

  /**
   * Convenience helper to compute remaining budget for a manager.
   */
  async getRemainingBudget(managerId: string, dailyLimit: number, date: Date = new Date()): Promise<number> {
    const used = await this.getManagerDailyUsage(managerId, date);
    const remaining = dailyLimit - used;
    return remaining > 0 ? remaining : 0;
  }
}

export default new PointsService();
