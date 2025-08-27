const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint for deployment
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Makan Moments Staff Points & Tasks PWA is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Import and use the existing API routes
let apiApp;
try {
  // Try to import the compiled TypeScript server
  apiApp = require('./server/index.js');
} catch (error) {
  console.log('Using root server for API routes');
  // Fallback to importing the API routes from the root server.ts if available
  try {
    // For now, we'll add the basic API routes inline since we can't easily import TS files
    const { Pool } = require('pg');
    
    // Database setup
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Basic API routes that are essential for the app
    app.get('/api/health', (req, res) => {
      res.json({ status: 'API healthy' });
    });

    // Add a basic user endpoint for testing
    app.get('/api/users', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM users LIMIT 10');
        res.json(result.rows);
      } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database connection failed' });
      }
    });

    console.log('Basic API routes configured');
  } catch (dbError) {
    console.error('Could not set up API routes:', dbError);
    
    // Minimal API endpoints for testing
    app.get('/api/*', (req, res) => {
      res.status(503).json({ 
        error: 'API temporarily unavailable',
        message: 'Server is starting up'
      });
    });
  }
}

// If we successfully imported the API app, use it
if (apiApp && typeof apiApp.use === 'function') {
  app.use('/api', apiApp);
} else if (apiApp && typeof apiApp === 'object' && apiApp.default) {
  app.use('/api', apiApp.default);
}

// Handle React Router - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'build', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server on port 5000 as required by deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
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