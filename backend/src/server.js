const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// simple role checker
function canEdit(req, staffId) {
  const roleHeader = req.headers['x-role'] || '';
  const currentUser = req.headers['x-user-id'];
  const roles = roleHeader.split(',');
  if (roles.includes('owner') || roles.includes('manager')) return true;
  return currentUser === staffId;
}

// Staff endpoints
app.get('/api/staff', async (req, res) => {
  const staff = await prisma.staff.findMany();
  res.json(staff);
});

app.post('/api/staff', async (req, res) => {
  const staff = await prisma.staff.create({ data: req.body });
  res.status(201).json(staff);
});

// Update staff profile
app.put('/api/staff/:id', async (req, res) => {
  if (!canEdit(req, req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(staff);
});

// Document upload
app.post('/api/staff/:id/documents', async (req, res) => {
  if (!canEdit(req, req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const doc = await prisma.document.create({
    data: {
      staffId: req.params.id,
      fileName: req.body.fileName,
      url: req.body.url,
    },
  });
  res.status(201).json(doc);
});

// Document delete
app.delete('/api/staff/:id/documents/:docId', async (req, res) => {
  if (!canEdit(req, req.params.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await prisma.document.delete({ where: { id: req.params.docId } });
  res.status(204).end();
});

// Task endpoints
app.get('/api/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const task = await prisma.task.create({ data: req.body });
  res.status(201).json(task);
});

// Skills endpoints
app.get('/api/skills', async (req, res) => {
  const skills = await prisma.skill.findMany();
  res.json(skills);
});

app.post('/api/skills', async (req, res) => {
  const skill = await prisma.skill.create({ data: req.body });
  res.status(201).json(skill);
});

// User skills
app.post('/api/user-skills', async (req, res) => {
  const userSkill = await prisma.userSkill.create({ data: req.body });
  res.status(201).json(userSkill);
});

// Verify user skill and award points once
app.post('/api/user-skills/:id/verify', async (req, res) => {
  const us = await prisma.userSkill.findUnique({ where: { id: req.params.id } });
  if (!us) return res.status(404).json({ error: 'Not found' });
  if (us.verified) return res.json(us);
  const updated = await prisma.userSkill.update({
    where: { id: req.params.id },
    data: { verified: true, pointsAwarded: true },
  });
  // award points if first time
  if (!us.pointsAwarded) {
    await prisma.staff.update({
      where: { id: us.staffId },
      data: { points: { increment: 10 } },
    });
  }
  res.json(updated);
});

// Catch-all route to serve React app for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
