<<<<<<< HEAD
import express from 'express';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { query } from '../src/lib/database';
import { issuesService } from '../src/lib/services/issues.service';

const app = express();
app.use(express.json());

// Retrieve all issues
app.get('/issues', async (_req, res) => {
  try {
    const items = await issuesService.getAllIssues();
    res.json(items);
  } catch (error) {
    console.error('get issues error', error);
    res.status(500).json({ error: 'Failed to load issues' });
  }
});

// Create a new issue
app.post('/issues', async (req, res) => {
  try {
    const issue = await issuesService.createIssue(req.body);
    res.status(201).json(issue);
  } catch (error) {
    console.error('create issue error', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Apply points to an issue
app.post('/issues/:id/apply-points', async (req, res) => {
  const id = req.params.id;
  const { managerExtra = 0, ownerExtra = 0, newStatus, appliedBy } = req.body;
  try {
    const issue = await issuesService.applyPoints(id, {
      managerExtra: Number(managerExtra),
      ownerExtra: Number(ownerExtra),
      newStatus,
      appliedBy,
    });
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('apply-points error', error);
    res.status(500).json({ error: 'Failed to apply points' });
  }
});

// Create follow-up task from an issue
app.post('/issues/:id/create-task', async (req, res) => {
  const id = req.params.id;
  const { assignerId, assigneeId, dueDate, dueTime } = req.body || {};
  try {
    const task = await issuesService.createTaskFromIssue(id, {
      assignerId,
      assigneeId,
      dueDate,
      dueTime,
    });
    if (!task) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('create-task error', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Reports endpoints

// KPI metrics including task completion and budget utilization
app.get('/reports/metrics', async (req, res) => {
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
  } catch (error: any) {
    console.error('metrics report error', error);
    res.status(500).json({ error: error.message });
  }
});

// CSV export for top performers
app.get('/reports/top-performers.csv', async (_req, res) => {
  try {
    const result = await query(
      `SELECT name, points FROM users ORDER BY points DESC LIMIT 10`
    );
    const lines = ['Name,Points', ...result.rows.map((r: any) => `${r.name},${r.points}`)];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="top-performers.csv"');
    res.send(lines.join('\n'));
  } catch (error: any) {
    console.error('top performers report error', error);
    res.status(500).json({ error: error.message });
  }
});

// CSV export for spending
app.get('/reports/spending.csv', async (req, res) => {
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
  } catch (error: any) {
    console.error('spending report error', error);
    res.status(500).json({ error: error.message });
  }
});

// Monthly PDF summary
app.get('/reports/monthly.pdf', async (req, res) => {
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
  } catch (error: any) {
    console.error('monthly report error', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
=======
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
>>>>>>> 21921cb460ed0d092f321d35df67bd036357f61b
