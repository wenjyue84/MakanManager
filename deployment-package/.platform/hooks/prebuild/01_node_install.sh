#!/bin/bash

# Install Node.js 18 if not already installed
if ! node -v | grep -q "v18"; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Ensure npm is updated
npm install -g npm@latest