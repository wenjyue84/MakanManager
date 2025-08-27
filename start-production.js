#!/usr/bin/env node

// Production server startup script for Cloud Run deployment
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Makan Moments in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the production server
const server = spawn('node', ['prod-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Production server process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.kill('SIGINT');
});