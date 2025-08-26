const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// In-memory user store. In a real application this would be a database.
const users = [
  {
    id: '1',
    name: 'Jay',
    email: 'jay@makanmanager.com',
    password: 'password123',
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
  },
  {
    id: '2',
    name: 'Simon',
    email: 'simon@makanmanager.com',
    password: 'password123',
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
  },
  {
    id: '3',
    name: 'Lily',
    email: 'lily@makanmanager.com',
    password: 'password123',
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
  },
];

// Secrets for JWT signing. In production, keep these in environment variables.
const JWT_SECRET = 'secret';
const REFRESH_SECRET = 'refreshSecret';
let refreshTokens = [];

// Login endpoint – verifies credentials and returns tokens.
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken, user });
});

// Refresh endpoint – validates refresh token and issues a new access token.
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken, user });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout endpoint – invalidates the provided refresh token.
app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  res.json({ success: true });
});

// Start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));
}

module.exports = app;

