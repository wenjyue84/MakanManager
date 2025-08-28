import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { query } from '../src/lib/database';
import { Task, User } from '../src/lib/types';

const MANAGEMENT_DAILY_BUDGET = 500;

function mapTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    station: row.station,
    status: row.status,
    dueDate: row.due_date,
    dueTime: row.due_time,
    basePoints: Number(row.base_points) || 0,
    finalPoints: row.final_points ? Number(row.final_points) : undefined,
    multiplier: row.multiplier ? Number(row.multiplier) : undefined,
    adjustment: row.adjustment ? Number(row.adjustment) : undefined,
    assignerId: row.assigner_id,
    assigneeId: row.assignee_id,
    proofType: row.proof_type,
    proofData: row.proof_data ? JSON.parse(row.proof_data) : undefined,
    repeat: row.repeat_schedule,
    overdueDays: Number(row.overdue_days) || 0,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    approvedAt: row.approved_at,
  };
}

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    roles: row.roles,
    avatar: row.avatar,
    gender: row.gender || 'male',
    phone: row.phone,
    startDate: row.start_date,
    emergencyContact: row.emergency_contact ? JSON.parse(row.emergency_contact) : { name: '', phone: '' },
    status: row.status || 'active',
    photo: row.photo,
    station: row.station,
    documents: row.documents ? JSON.parse(row.documents) : [],
    points: Number(row.points) || 0,
    weeklyPoints: Number(row.weekly_points) || 0,
    monthlyPoints: Number(row.monthly_points) || 0,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Tasks API
  app.get('/api/tasks', async (req, res) => {
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let param = 1;
      const { status, assigneeId, station } = req.query;
      if (status) { conditions.push(`status = $${param++}`); values.push(status); }
      if (assigneeId) { conditions.push(`assignee_id = $${param++}`); values.push(assigneeId); }
      if (station) { conditions.push(`station = $${param++}`); values.push(station); }
      let sql = `SELECT id, title, description, station, status, due_date, due_time, base_points, final_points, multiplier, adjustment, assigner_id, assignee_id, proof_type, proof_data, repeat_schedule, overdue_days, rejection_reason, created_at, completed_at, approved_at FROM tasks`;
      if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, values);
      res.json(result.rows.map(mapTask));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const result = await query(`SELECT id, title, description, station, status, due_date, due_time, base_points, final_points, multiplier, adjustment, assigner_id, assignee_id, proof_type, proof_data, repeat_schedule, overdue_days, rejection_reason, created_at, completed_at, approved_at FROM tasks WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(mapTask(result.rows[0]));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const t = req.body as Omit<Task, 'id' | 'overdueDays' | 'createdAt'>;
      const result = await query(
        `INSERT INTO tasks (title, description, station, status, due_date, due_time, base_points, final_points, multiplier, adjustment, assigner_id, assignee_id, proof_type, proof_data, repeat_schedule)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING id, title, description, station, status, due_date, due_time, base_points, final_points, multiplier, adjustment, assigner_id, assignee_id, proof_type, proof_data, repeat_schedule, overdue_days, rejection_reason, created_at, completed_at, approved_at`,
        [t.title, t.description, t.station, t.status, t.dueDate, t.dueTime, t.basePoints, t.finalPoints, t.multiplier, t.adjustment, t.assignerId, t.assigneeId, t.proofType, JSON.stringify(t.proofData), t.repeat]
      );
      res.status(201).json(mapTask(result.rows[0]));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const updates = req.body as Partial<Task>;
      const fields: string[] = [];
      const values: any[] = [];
      let param = 1;
      for (const [key, value] of Object.entries(updates)) {
        const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
        fields.push(`${column} = $${param++}`);
        values.push(key === 'proofData' ? JSON.stringify(value) : value);
      }
      if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
      values.push(req.params.id);
      const sql = `UPDATE tasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${param} RETURNING id, title, description, station, status, due_date, due_time, base_points, final_points, multiplier, adjustment, assigner_id, assignee_id, proof_type, proof_data, repeat_schedule, overdue_days, rejection_reason, created_at, completed_at, approved_at`;
      const result = await query(sql, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(mapTask(result.rows[0]));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const result = await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      const { role } = req.query;
      let sql = `SELECT id, name, email, password, roles, avatar, gender, phone, start_date, emergency_contact, status, photo, station, documents, points, weekly_points, monthly_points FROM users`;
      const values: any[] = [];
      if (role) {
        sql += ' WHERE $1 = ANY(roles)';
        values.push(role);
      }
      sql += ' ORDER BY points DESC';
      const result = await query(sql, values);
      res.json(result.rows.map(mapUser));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reports API
  app.get('/api/reports/metrics', async (req, res) => {
    try {
      const { month, year, budget } = req.query as any;
      const now = new Date();
      const m = month ? parseInt(month, 10) : now.getMonth() + 1;
      const y = year ? parseInt(year, 10) : now.getFullYear();
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      const budgetAmount = budget ? Number(budget) : 10000;

      const taskResult = await query(
        `SELECT COUNT(*) FILTER (WHERE status = 'done') AS total_done,
                COUNT(*) FILTER (WHERE status = 'done' AND completed_at <= due_date) AS on_time
         FROM tasks`
      );
      const totalDone = Number(taskResult.rows[0].total_done) || 0;
      const onTime = Number(taskResult.rows[0].on_time) || 0;
      const tasksOnTimePercent = totalDone > 0 ? (onTime / totalDone) * 100 : 0;

      const spendResult = await query(
        `SELECT COALESCE(SUM(total_price),0) AS spending
           FROM purchases
          WHERE purchase_date >= $1 AND purchase_date < $2`,
        [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
      );
      const spending = Number(spendResult.rows[0].spending) || 0;
      const budgetUtilization = budgetAmount > 0 ? (spending / budgetAmount) * 100 : 0;

      res.json({ tasksOnTimePercent, spending, budget: budgetAmount, budgetUtilization });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
