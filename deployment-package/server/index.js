const express = require('express');
const crypto = require('crypto');
const { authenticate, requireRole, requirePermission } = require('./middleware/rbac');

const app = express();
app.use(express.json());

// Helper functions for password hashing
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
}

function sanitizeUser(user) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

function createUser(user) {
  const { salt, hash } = hashPassword('password123');
  return { ...user, salt, passwordHash: hash };
}

// In-memory user store. In production this would be a database.
const users = [
  createUser({
    id: '1',
    name: 'Jay',
    email: 'jay@makanmanager.com',
    roles: ['owner'],
    avatar: '👨‍💼',
    phone: '+60123456789',
    startDate: '2020-01-15',
    emergencyContact: '+60123456790',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 2500,
    weeklyPoints: 350,
    monthlyPoints: 1200,
  }),
  createUser({
    id: '2',
    name: 'Simon',
    email: 'simon@makanmanager.com',
    roles: ['manager'],
    avatar: '👨‍💻',
    phone: '+60123456791',
    startDate: '2020-03-10',
    emergencyContact: '+60123456792',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 2200,
    weeklyPoints: 320,
    monthlyPoints: 1100,
  }),
  createUser({
    id: '3',
    name: 'Lily',
    email: 'lily@makanmanager.com',
    roles: ['head-of-kitchen'],
    avatar: '👩‍🍳',
    phone: '+60123456793',
    startDate: '2020-05-20',
    emergencyContact: '+60123456794',
    photo:
      'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
    station: 'kitchen',
    points: 2100,
    weeklyPoints: 300,
    monthlyPoints: 1050,
  }),
];

// Session management
const sessions = new Map();
const SESSION_TTL = 15 * 60 * 1000; // 15 minutes

app.locals.sessions = sessions;
app.locals.users = users;
app.locals.sessionTTL = SESSION_TTL;

// Login endpoint – verifies credentials and returns a session ID
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const hash = crypto
    .pbkdf2Sync(password, user.salt, 10000, 64, 'sha512')
    .toString('hex');
  if (hash !== user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const sessionId = crypto.randomBytes(30).toString('hex');
  sessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + SESSION_TTL });

  res.json({ sessionId, user: sanitizeUser(user) });
});

// Refresh endpoint – validates session and extends its TTL
app.post('/api/auth/refresh', (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: 'Invalid session' });
  }

  session.expiresAt = Date.now() + SESSION_TTL;
  const user = users.find((u) => u.id === session.userId);
  res.json({ user: sanitizeUser(user) });
});

// Logout endpoint – invalidates the session
app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  sessions.delete(sessionId);
  res.json({ success: true });
});

// Example protected route requiring authentication and role check
app.get('/api/users', authenticate, requireRole('owner', 'manager'), (req, res) => {
  res.json(users.map(sanitizeUser));
});

// Example permission-protected route
app.get('/api/reports', authenticate, requirePermission('view_reports'), (req, res) => {
  res.json({ reports: [] });
});

// Staff Meals API endpoints
// In-memory storage for staff meals (in production this would be a database)
const staffMeals = [
  {
    id: '1',
    date: '2024-01-15',
    time: '12:00',
    mealType: 'lunch',
    dishName: 'Chicken Fried Rice',
    cookedBy: '3', // Lily (head-of-kitchen)
    eaters: ['1', '2', '3'], // Jay, Simon, Lily
    approximateCost: 25.50,
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Quick lunch using leftover rice and vegetables',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '18:00',
    mealType: 'dinner',
    dishName: 'Beef Noodle Soup',
    cookedBy: '2', // Simon (manager)
    eaters: ['1', '2', '3'], // Jay, Simon, Lily
    approximateCost: 30.00,
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    notes: 'Warm soup for dinner',
    createdAt: '2024-01-15T18:00:00Z'
  }
];

// Get all staff meals
app.get('/api/staff-meals', (req, res) => {
  res.json(staffMeals);
});

// Create a new staff meal
app.post('/api/staff-meals', (req, res) => {
  const newMeal = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  staffMeals.push(newMeal);
  res.status(201).json(newMeal);
});

// Delete a staff meal
app.delete('/api/staff-meals/:id', (req, res) => {
  const { id } = req.params;
  const index = staffMeals.findIndex(meal => meal.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Meal not found' });
  }
  staffMeals.splice(index, 1);
  res.json({ success: true });
});

// Start server only if this file is run directly
if (require.main === module) {
  const path = require('path');
  const fs = require('fs');

  // Check for build directories (Vite uses 'dist', some other tools use 'build')
  const distPath = path.join(__dirname, '../dist');
  const buildPath = path.join(__dirname, '../build');
  let staticPath = distPath;
  let indexPath = path.join(distPath, 'index.html');

  // Use build directory if dist doesn't exist
  if (!fs.existsSync(distPath) && fs.existsSync(buildPath)) {
    staticPath = buildPath;
    indexPath = path.join(buildPath, 'index.html');
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      staticPath: staticPath
    });
  });

  // Serve static files from build directory
  app.use(express.static(staticPath));

  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).json({ 
          error: 'Application not built yet',
          message: 'Please run "npm run build" first'
        });
      }
    });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Serving static files from: ${staticPath}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

module.exports = app;

