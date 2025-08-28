# MakanManager Setup Guide

## 🚀 Quick Start

This guide will help you set up the core features of MakanManager following the PRD specifications.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🗄️ Database Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/makan_manager"
JWT_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

## 🔧 Backend Setup

### 1. Start the Backend Server
```bash
# Development mode with auto-reload
npm run backend:dev

# Or production mode
npm run backend:start
```

The backend will run on `http://localhost:3001`

### 2. Verify Backend
```bash
curl http://localhost:3001/api/health
```

## 🎨 Frontend Setup

### 1. Start the Frontend
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Default Login Credentials

After running the seed script, you can use these credentials:

| Role | Username | Password |
|------|----------|----------|
| **Owner** | `owner` | `admin123` |
| **Manager** | `manager` | `manager123` |
| **Head of Kitchen** | `hok` | `hok123` |
| **Staff** | `chef1` | `staff123` |
| **Staff** | `cashier1` | `staff123` |
| **Staff** | `waiter1` | `staff123` |

## 🏗️ Core Features Implemented

### ✅ Backend Infrastructure
- **Database Schema**: Complete Prisma schema matching PRD requirements
- **Authentication**: JWT-based auth with role-based access control
- **Task Management**: Full CRUD operations with proper workflow
- **Points System**: Task approval with multipliers and adjustments
- **API Endpoints**: RESTful API following PRD specifications

### ✅ Frontend Components
- **Authentication**: Login form with protected routes
- **Task Management**: Task list with filtering and CRUD operations
- **Role-Based Access**: Different views based on user roles
- **API Integration**: Frontend connected to real backend

### ✅ Database
- **Initial Data**: Users, skills, disciplinary types, and sample tasks
- **Relationships**: Proper foreign key relationships between models
- **Indexes**: Performance optimizations for common queries

## 🔄 Task Workflow

The system implements the exact workflow specified in the PRD:

1. **Open** → Task created, available for claiming
2. **In Progress** → Task claimed by staff member
3. **Pending Review** → Task submitted with proof
4. **Done** → Task approved by management
5. **On Hold** → Task paused (can be resumed)
6. **Overdue** → Task past due date (returns to assigner)

## 📊 Points System

- **Base Points**: Default 50 points per task
- **Multipliers**: 0.5x to 3.0x based on performance
- **Adjustments**: ± points for exceptional work
- **Daily Budget**: Management users have 500 point daily budget
- **Audit Trail**: All point changes are logged

## 🚧 Next Steps

### Phase 1 (Immediate)
- [ ] Test all CRUD operations
- [ ] Verify authentication flow
- [ ] Test role-based access control

### Phase 2 (Short-term)
- [ ] Implement remaining API endpoints
- [ ] Add file upload functionality
- [ ] Enhance UI components

### Phase 3 (Medium-term)
- [ ] Add recurring tasks
- [ ] Implement notifications
- [ ] Add reporting features

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Prisma Errors**
   - Run `npm run db:generate` after schema changes
   - Check database schema matches Prisma schema

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser localStorage

4. **CORS Errors**
   - Verify FRONTEND_URL in .env
   - Check backend is running on correct port

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure database is properly seeded
- Check network tab for API errors

## 📚 Additional Resources

- [PRD Documentation](./docs/project/PRD.md)
- [Database Schema](./prisma/schema.prisma)
- [API Documentation](./docs/api/README.md)

## 🎯 Development Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio

# Backend development
npm run backend:dev    # Start backend with auto-reload
npm run backend:build  # Build backend
npm run backend:start  # Start production backend

# Frontend development
npm run dev            # Start frontend dev server
npm run build          # Build frontend
npm run start          # Start production frontend
```

---

**Happy Coding! 🚀**

For questions or issues, check the troubleshooting section or refer to the PRD documentation.
