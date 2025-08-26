import { query } from '../database';
import { Task, TaskStatus, Station } from '../types';

export class TasksService {
  async getAllTasks(): Promise<Task[]> {
    const result = await query(`
      SELECT 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
      FROM tasks
      ORDER BY created_at DESC
    `);
    
    return result.rows.map(this.mapRowToTask);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const result = await query(`
      SELECT 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
      FROM tasks
      WHERE id = $1
    `, [id]);

    return result.rows.length > 0 ? this.mapRowToTask(result.rows[0]) : null;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays'>): Promise<Task> {
    const result = await query(`
      INSERT INTO tasks (
        title, description, station, status, due_date, due_time,
        base_points, final_points, multiplier, adjustment,
        assigner_id, assignee_id, proof_type, proof_data, repeat_schedule,
        tags, attachments
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
    `, [
      taskData.title,
      taskData.description,
      taskData.station,
      taskData.status || 'open',
      taskData.dueDate,
      taskData.dueTime,
      taskData.basePoints || 10,
      taskData.finalPoints,
      taskData.multiplier,
      taskData.adjustment,
      taskData.assignerId,
      taskData.assigneeId,
      taskData.proofType || 'none',
      JSON.stringify(taskData.proofData),
      taskData.repeat,
      taskData.tags || [],
      taskData.attachments || []
    ]);

    return this.mapRowToTask(result.rows[0]);
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (taskData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(taskData.title);
    }
    if (taskData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(taskData.description);
    }
    if (taskData.station !== undefined) {
      fields.push(`station = $${paramCount++}`);
      values.push(taskData.station);
    }
    if (taskData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(taskData.status);
    }
    if (taskData.dueDate !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(taskData.dueDate);
    }
    if (taskData.dueTime !== undefined) {
      fields.push(`due_time = $${paramCount++}`);
      values.push(taskData.dueTime);
    }
    if (taskData.basePoints !== undefined) {
      fields.push(`base_points = $${paramCount++}`);
      values.push(taskData.basePoints);
    }
    if (taskData.finalPoints !== undefined) {
      fields.push(`final_points = $${paramCount++}`);
      values.push(taskData.finalPoints);
    }
    if (taskData.multiplier !== undefined) {
      fields.push(`multiplier = $${paramCount++}`);
      values.push(taskData.multiplier);
    }
    if (taskData.adjustment !== undefined) {
      fields.push(`adjustment = $${paramCount++}`);
      values.push(taskData.adjustment);
    }
    if (taskData.assigneeId !== undefined) {
      fields.push(`assignee_id = $${paramCount++}`);
      values.push(taskData.assigneeId);
    }
    if (taskData.tags !== undefined) {
      fields.push(`tags = $${paramCount++}`);
      values.push(taskData.tags);
    }
    if (taskData.attachments !== undefined) {
      fields.push(`attachments = $${paramCount++}`);
      values.push(taskData.attachments);
    }
    if (taskData.proofData !== undefined) {
      fields.push(`proof_data = $${paramCount++}`);
      values.push(JSON.stringify(taskData.proofData));
    }
    if (taskData.rejectionReason !== undefined) {
      fields.push(`rejection_reason = $${paramCount++}`);
      values.push(taskData.rejectionReason);
    }
    if (taskData.completedAt !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(taskData.completedAt);
    }
    if (taskData.approvedAt !== undefined) {
      fields.push(`approved_at = $${paramCount++}`);
      values.push(taskData.approvedAt);
    }

    if (fields.length === 0) {
      return this.getTaskById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE tasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
    `, values);

    return result.rows.length > 0 ? this.mapRowToTask(result.rows[0]) : null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await query('DELETE FROM tasks WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const result = await query(`
      SELECT 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
      FROM tasks
      WHERE status = $1
      ORDER BY due_date ASC, due_time ASC
    `, [status]);

    return result.rows.map(this.mapRowToTask);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const result = await query(`
      SELECT 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
      FROM tasks
      WHERE assignee_id = $1
      ORDER BY created_at DESC
    `, [assigneeId]);

    return result.rows.map(this.mapRowToTask);
  }

  async getTasksByStation(station: Station): Promise<Task[]> {
    const result = await query(`
      SELECT 
        id,
        title,
        description,
        station,
        status,
        due_date as "dueDate",
        due_time as "dueTime",
        base_points as "basePoints",
        final_points as "finalPoints",
        multiplier,
        adjustment,
        assigner_id as "assignerId",
        assignee_id as "assigneeId",
        proof_type as "proofType",
        proof_data as "proofData",
        repeat_schedule as "repeat",
        overdue_days as "overdueDays",
        rejection_reason as "rejectionReason",
        tags,
        attachments,
        created_at as "createdAt",
        completed_at as "completedAt",
        approved_at as "approvedAt"
      FROM tasks
      WHERE station = $1
      ORDER BY due_date ASC, due_time ASC
    `, [station]);

    return result.rows.map(this.mapRowToTask);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      station: row.station,
      status: row.status,
      dueDate: row.dueDate,
      dueTime: row.dueTime,
      basePoints: parseInt(row.basePoints) || 0,
      finalPoints: row.finalPoints ? parseInt(row.finalPoints) : undefined,
      multiplier: row.multiplier ? parseFloat(row.multiplier) : undefined,
      adjustment: row.adjustment ? parseInt(row.adjustment) : undefined,
      assignerId: row.assignerId,
      assigneeId: row.assigneeId,
      proofType: row.proofType,
      proofData: row.proofData ? JSON.parse(row.proofData) : undefined,
      repeat: row.repeat,
      overdueDays: parseInt(row.overdueDays) || 0,
      rejectionReason: row.rejectionReason,
      tags: row.tags || [],
      attachments: row.attachments || [],
      createdAt: row.createdAt,
      completedAt: row.completedAt,
      approvedAt: row.approvedAt
    };
  }
}

export const tasksService = new TasksService();