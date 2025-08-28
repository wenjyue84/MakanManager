// Role-based access control middleware
// Uses in-memory sessions and users stored on app.locals

const rolePermissions = {
  owner: ['view_users', 'manage_users', 'manage_issues', 'view_reports'],
  manager: ['manage_issues', 'view_reports'],
  'head-of-kitchen': ['manage_issues'],
  staff: [],
};

function authenticate(req, res, next) {
  const header = req.headers['x-session-id'] || req.headers['authorization'];
  const sessionId = header && header.startsWith('Bearer ')
    ? header.slice(7)
    : header;

  if (!sessionId) {
    return res.status(401).json({ message: 'No session provided' });
  }

  const sessions = req.app.locals.sessions;
  const users = req.app.locals.users;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: 'Invalid session' });
  }

  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: 'Invalid session' });
  }

  // Refresh session TTL
  session.expiresAt = Date.now() + req.app.locals.sessionTTL;
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some((r) => roles.includes(r))) {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    const userRoles = req.user ? req.user.roles : [];
    const hasPermission = userRoles.some((role) =>
      (rolePermissions[role] || []).includes(permission)
    );
    if (!hasPermission) {
      return res.status(403).json({ message: 'Insufficient permission' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
  rolePermissions,
};

