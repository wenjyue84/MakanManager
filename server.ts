import express from 'express';
import { query } from './src/lib/database';
import { Task, User } from './src/lib/types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const app = express();
app.use(express.json());

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
    phone: row.phone,
    startDate: row.start_date,
    emergencyContact: row.emergency_contact,
    photo: row.photo,
    station: row.station,
    points: Number(row.points) || 0,
    weeklyPoints: Number(row.weekly_points) || 0,
    monthlyPoints: Number(row.monthly_points) || 0,
  };
}

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

app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = `SELECT id, name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points FROM users`;
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

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await query(`SELECT id, name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points FROM users WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body as Omit<User, 'id'>;
    const result = await query(
      `INSERT INTO users (name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points`,
      [u.name, u.email, u.password, u.roles, u.avatar, u.phone, u.startDate, u.emergencyContact, u.photo, u.station, u.points, u.weeklyPoints, u.monthlyPoints]
    );
    res.status(201).json(mapUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = req.body as Partial<User>;
    const fields: string[] = [];
    const values: any[] = [];
    let param = 1;
    for (const [key, value] of Object.entries(updates)) {
      const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      fields.push(`${column} = $${param++}`);
      values.push(value);
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${param} RETURNING id, name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points`;
    const result = await query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/points', async (req, res) => {
  try {
    const { pointsToAdd } = req.body as { pointsToAdd: number };
    const result = await query(
      `UPDATE users SET points = points + $2, weekly_points = weekly_points + $2, monthly_points = monthly_points + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, password, roles, avatar, phone, start_date, emergency_contact, photo, station, points, weekly_points, monthly_points`,
      [req.params.id, pointsToAdd]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(mapUser(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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

app.get('/api/reports/top-performers.csv', async (_req, res) => {
  try {
    const result = await query(
      `SELECT name, points FROM users ORDER BY points DESC LIMIT 10`
    );
    const lines = ['Name,Points', ...result.rows.map((r: any) => `${r.name},${r.points}`)];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="top-performers.csv"');
    res.send(lines.join('\n'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/spending.csv', async (req, res) => {
  try {
    const { month, year } = req.query as any;
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const result = await query(
      `SELECT item_name, category, total_price, purchase_date
         FROM purchases
        WHERE purchase_date >= $1 AND purchase_date < $2
        ORDER BY purchase_date`,
      [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
    );
    const header = 'Item,Category,TotalPrice,PurchaseDate';
    const rows = result.rows.map(
      (r: any) => `${r.item_name},${r.category || ''},${r.total_price},${r.purchase_date}`
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="spending.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/monthly.pdf', async (req, res) => {
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
         FROM tasks
        WHERE completed_at >= $1 AND completed_at < $2`,
      [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
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

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Monthly Report - ${m}/${y}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Metric', 'Value']],
      body: [
        ['Tasks On-Time %', `${tasksOnTimePercent.toFixed(2)}%`],
        ['Spending', spending.toFixed(2)],
        ['Budget', budgetAmount.toFixed(2)],
        ['Budget Utilization', `${budgetUtilization.toFixed(2)}%`],
      ],
    });
    const pdfData = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly-report.pdf"');
    res.send(Buffer.from(pdfData));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
