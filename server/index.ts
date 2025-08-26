import express from 'express';
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

export default app;
