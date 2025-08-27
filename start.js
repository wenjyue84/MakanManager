#!/usr/bin/env node

// Simple start script for deployment
// This ensures the server starts correctly on port 5000

const app = require('./server/index.js');
const PORT = process.env.PORT || 5000;

// The server/index.js already handles starting the server
// when called as main module, so this just imports it
console.log(`Starting server on port ${PORT}`);