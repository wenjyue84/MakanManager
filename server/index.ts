import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication middleware
interface AuthRequest extends express.Request {
  user?: {
    id: string;
    username: string;
    roles: string[];
    purchasingPerm: boolean;
  };
}

const authenticateToken = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, roles: true, purchasingPerm: true, status: true }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based access control middleware
const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const isManagement = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const managementRoles = ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'];
  const isManagementUser = req.user.roles.some(role => managementRoles.includes(role));
  
  if (!isManagementUser) {
    return res.status(403).json({ error: 'Management access required' });
  }

  next();
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        name: true,
        roles: true,
        purchasingPerm: true,
        status: true,
        station: true,
        startDate: true,
        emergencyContact: true,
        photoUrl: true
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        name: true,
        roles: true,
        purchasingPerm: true,
        status: true,
        station: true,
        startDate: true,
        emergencyContact: true,
        photoUrl: true,
        email: true,
        phone: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task routes
app.get('/api/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, station, assigneeId, assignerId } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (station && station !== 'all') where.station = station;
    if (assigneeId && assigneeId !== 'all') where.assigneeId = assigneeId;
    if (assignerId && assignerId !== 'all') where.assignerId = assignerId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', authenticateToken, requireRole(['owner', 'manager', 'head-of-kitchen', 'front-desk-manager']), async (req: AuthRequest, res) => {
  try {
    const { title, description, station, points, dueAt, proofType, allowMultiplier, assigneeId } = req.body;

    if (!title || !description || !station || !dueAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        station,
        points: points || 50,
        dueAt: new Date(dueAt),
        status: 'open',
        assignerId: req.user!.id,
        assigneeId: assigneeId || null,
        proofType: proofType || 'none',
        allowMultiplier: allowMultiplier !== false
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        actorId: req.user!.id,
        type: 'Create',
        meta: { title, description, station, points }
      }
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assigner: true, assignee: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user!.roles.includes('owner') || 
                   task.assignerId === req.user!.id || 
                   task.assigneeId === req.user!.id;

    if (!canEdit) {
      return res.status(403).json({ error: 'Insufficient permissions to edit this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Edit',
        meta: updateData
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/claim', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assigner: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is not available for claiming' });
    }

    // Owner can only claim tasks created by Owner
    if (req.user!.roles.includes('owner') && !task.assigner.roles.includes('owner')) {
      return res.status(403).json({ error: 'Owner can only claim tasks created by Owner' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'in-progress',
        assigneeId: req.user!.id
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Claim',
        meta: { previousStatus: 'open' }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Claim task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/submit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { proofData } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assigner: true, assignee: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assigneeId !== req.user!.id) {
      return res.status(403).json({ error: 'Only assignee can submit task' });
    }

    if (task.status !== 'in-progress') {
      return res.status(400).json({ error: 'Task must be in progress to submit' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'pending-review',
        proofData: proofData || null
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Submit',
        meta: { proofType: task.proofType }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/approve', authenticateToken, isManagement, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { multiplier, adjustment, reason } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assigner: true, assignee: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'pending-review') {
      return res.status(400).json({ error: 'Task must be pending review to approve' });
    }

    // Check daily budget
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPoints = await prisma.pointEntry.aggregate({
      where: {
        approvedById: req.user!.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: { value: true }
    });

    const settings = await prisma.settings.findFirst();
    const dailyBudget = settings?.dailyBudgetDefault || 500;
    const usedBudget = Math.abs(todayPoints._sum.value || 0);
    const remainingBudget = dailyBudget - usedBudget;

    const finalPoints = Math.round(task.points * (multiplier || 1) + (adjustment || 0));
    const pointsToAward = finalPoints - task.points;

    if (pointsToAward > remainingBudget) {
      return res.status(400).json({ 
        error: 'Insufficient daily budget',
        remainingBudget,
        requiredBudget: pointsToAward
      });
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'done'
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create point entry
    if (finalPoints !== task.points) {
      await prisma.pointEntry.create({
        data: {
          userId: task.assigneeId!,
          source: 'Task',
          taskId: id,
          value: finalPoints - task.points,
          multiplier: multiplier || 1,
          adjustment: adjustment || 0,
          reason: reason || 'Task completion',
          approvedById: req.user!.id
        }
      });
    }

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Approve',
        meta: { 
          finalPoints, 
          multiplier, 
          adjustment, 
          reason,
          remainingBudget: remainingBudget - pointsToAward
        }
      }
    });

    res.json({ 
      task: updatedTask, 
      pointsAwarded: finalPoints - task.points,
      remainingBudget: remainingBudget - pointsToAward
    });
  } catch (error) {
    console.error('Approve task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/reject', authenticateToken, isManagement, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assigner: true, assignee: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'pending-review') {
      return res.status(400).json({ error: 'Task must be pending review to reject' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'in-progress'
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Reject',
        meta: { reason }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Reject task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/hold', authenticateToken, isManagement, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'done') {
      return res.status(400).json({ error: 'Completed tasks cannot be put on hold' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'on-hold'
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Hold',
        meta: { reason }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Hold task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks/:id/resume', authenticateToken, isManagement, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'on-hold') {
      return res.status(400).json({ error: 'Task must be on hold to resume' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: task.assigneeId ? 'in-progress' : 'open'
      },
      include: {
        assigner: {
          select: { id: true, name: true, username: true }
        },
        assignee: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: id,
        actorId: req.user!.id,
        type: 'Resume',
        meta: { previousStatus: 'on-hold' }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Resume task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard routes
app.get('/api/leaderboard', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { range = 'monthly', role, station } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    if (range === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (range === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }
    // 'alltime' doesn't need date filter

    const where: any = {};
    if (role && role !== 'all') {
      where.roles = { has: role as string };
    }

    const users = await prisma.user.findMany({
      where: {
        ...where,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        username: true,
        roles: true,
        station: true,
        pointEntries: {
          where: {
            createdAt: dateFilter
          },
          select: {
            value: true
          }
        }
      }
    });

    const leaderboard = users
      .map(user => ({
        ...user,
        totalPoints: user.pointEntries.reduce((sum, entry) => sum + entry.value, 0)
      }))
      .filter(user => user.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    res.json({ leaderboard, range, role, station });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
