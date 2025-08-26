import { query } from '../database';
import { Reminder } from '../types';

export class RemindersService {
  async getByTask(taskId: string): Promise<Reminder[]> {
    const result = await query(
      `SELECT id, task_id as "taskId", remind_at as "remindAt", message, created_at as "createdAt"
       FROM task_reminders
       WHERE task_id = $1
       ORDER BY remind_at ASC`,
      [taskId]
    );
    return result.rows as Reminder[];
  }

  async create(taskId: string, data: { remindAt: string; message?: string }): Promise<Reminder> {
    const remindAtDate = new Date(data.remindAt);
    const hour = remindAtDate.getHours();
    if (hour >= 22 || hour < 8) {
      throw new Error('Reminders cannot be scheduled during quiet hours');
    }
    const result = await query(
      `INSERT INTO task_reminders (task_id, remind_at, message)
       VALUES ($1, $2, $3)
       RETURNING id, task_id as "taskId", remind_at as "remindAt", message, created_at as "createdAt"`,
      [taskId, data.remindAt, data.message]
    );
    return result.rows[0] as Reminder;
  }
}

export const remindersService = new RemindersService();
export default RemindersService;
