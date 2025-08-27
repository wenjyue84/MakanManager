#!/usr/bin/env node

// Start the integrated development server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Makan Moments development server...');

const server = spawn('npx', ['tsx', 'main-server.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));