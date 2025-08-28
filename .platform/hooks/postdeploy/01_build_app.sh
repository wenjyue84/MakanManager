#!/bin/bash

cd /var/app/current

# Install dependencies
npm ci --production=false

# Build the React application
npm run build

# Install only production dependencies
npm ci --only=production