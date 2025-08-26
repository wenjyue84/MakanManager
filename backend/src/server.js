const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Staff endpoints
app.get('/api/staff', async (req, res) => {
  const staff = await prisma.staff.findMany();
  res.json(staff);
});

app.post('/api/staff', async (req, res) => {
  const staff = await prisma.staff.create({ data: req.body });
  res.status(201).json(staff);
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

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
