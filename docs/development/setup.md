# Development Environment Setup Guide

## Prerequisites

Before setting up the MakanManager development environment, ensure you have the following installed:

### Required Software
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm 9+** - Usually comes with Node.js
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **PostgreSQL 14+** - [Download from postgresql.org](https://www.postgresql.org/)

### Optional Software
- **VS Code** - Recommended code editor
- **Postman** - API testing tool
- **pgAdmin** - PostgreSQL administration tool
- **Docker** - For containerized development

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/MakanManager.git
cd MakanManager
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

#### Create Environment Files
```bash
# Copy environment template files
cp .env.example .env
cp client/.env.example client/.env
cp backend/.env.example backend/.env
```

#### Configure Environment Variables
```bash
# Root .env
NODE_ENV=development
PORT=3000

# Client .env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MakanManager

# Backend .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=makanmanager_dev
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

## Database Setup

### 1. PostgreSQL Installation
- Install PostgreSQL 14+ on your system
- Create a new database user and database
- Ensure the database service is running

### 2. Database Configuration
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE makanmanager_dev;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE makanmanager_dev TO your_username;
\q
```

### 3. Run Database Migrations
```bash
# Navigate to backend directory
cd backend

# Run migrations
npm run db:migrate

# Seed initial data (if available)
npm run db:seed
```

## Development Server Setup

### 1. Backend Server
```bash
# Start backend development server
cd backend
npm run dev

# The server will start on http://localhost:3000
```

### 2. Frontend Development Server
```bash
# Start frontend development server
cd client
npm run dev

# The frontend will start on http://localhost:5173
```

### 3. Concurrent Development (Recommended)
```bash
# From root directory, start both servers
npm run dev

# This will start both frontend and backend concurrently
```

## Development Workflow

### 1. Code Structure
```
MakanManager/
├── client/                 # Frontend React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                # Backend Node.js application
│   ├── src/
│   ├── routes/
│   └── package.json
├── shared/                 # Shared types and utilities
├── docs/                   # Project documentation
└── package.json            # Root package.json for scripts
```

### 2. Available Scripts
```bash
# Root scripts
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run test         # Run tests for both applications
npm run lint         # Lint both applications
npm run format       # Format code with Prettier

# Frontend scripts (from client/ directory)
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code

# Backend scripts (from backend/ directory)
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
```

## Development Tools Configuration

### 1. VS Code Extensions
Install these recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier - Code formatter**
- **PostgreSQL**

### 2. VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

### 3. ESLint Configuration
Ensure ESLint is configured for both frontend and backend:
```bash
# Frontend ESLint
cd client
npm run lint

# Backend ESLint
cd ../backend
npm run lint
```

## Testing Setup

### 1. Frontend Testing
```bash
cd client
npm run test          # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### 2. Backend Testing
```bash
cd backend
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
```

## Database Development

### 1. Database Schema Changes
```bash
# Create new migration
npm run db:create-migration --name migration_name

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback
```

### 2. Database Seeding
```bash
# Seed development data
npm run db:seed

# Reset database and seed
npm run db:reset
```

## Troubleshooting Common Issues

### 1. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### 2. Database Connection Issues
- Ensure PostgreSQL service is running
- Check database credentials in `.env` file
- Verify database exists and user has permissions

### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Production Build

### 1. Build Applications
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../backend
npm run build
```

### 2. Start Production Server
```bash
# Start production server
cd backend
npm start
```

## Additional Resources

### 1. Documentation
- [Project README](../README.md)
- [Architecture Documentation](../project/architecture.md)
- [API Documentation](api-docs.md)
- [Database Schema](database-schema.md)

### 2. External Resources
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### 3. Getting Help
- Check the [troubleshooting guide](../troubleshooting/fix.md)
- Review [common issues](../troubleshooting/common-issues.md)
- Check GitHub issues for known problems

---

*This setup guide should be updated as the development environment evolves.*
