# MakanManager Database Setup Guide

## Overview
This guide will help you set up the PostgreSQL database for the MakanManager project and connect it to your React application.

## Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed
- Basic knowledge of database management

## Quick Setup (Recommended)

### 1. Automatic Setup
Run the automated setup script:
```bash
npm run db:setup
```

This script will:
- Create a `.env` file with database configuration
- Install Prisma client if needed
- Generate Prisma client
- Test database connection
- Push database schema
- Seed initial data

### 2. Manual Setup
If you prefer manual setup or encounter issues:

#### Step 1: Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE makan_moments;
CREATE USER makan_user WITH PASSWORD 'makan_password';
GRANT ALL PRIVILEGES ON DATABASE makan_moments TO makan_user;
\q
```

#### Step 2: Configure Environment
Create a `.env` file in your project root:
```env
DATABASE_URL="postgresql://makan_user:makan_password@localhost:5432/makan_moments"
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Step 3: Install Dependencies
```bash
npm install
```

#### Step 4: Generate Prisma Client
```bash
npm run db:generate
```

#### Step 5: Push Database Schema
```bash
npm run db:push
```

#### Step 6: Seed Database
```bash
npm run db:seed
```

## Database Configuration

### Default Connection Details
- **Host:** localhost
- **Port:** 5432
- **Database:** makan_moments
- **User:** makan_user
- **Password:** makan_password

### Custom Configuration
You can modify the database connection by updating the `.env` file:

```env
# Individual environment variables
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password

# Or use connection string
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Database Schema

The database includes the following main models:

### Users
- Authentication and role management
- Staff information and permissions
- Department and station assignments

### Tasks
- Task creation and assignment
- Status tracking and workflow
- Points system integration
- Due dates and priorities

### Task Events
- Audit trail for task changes
- User action tracking
- Historical data preservation

### Points System
- Task completion rewards
- Disciplinary point deductions
- Skill-based bonuses
- Leaderboard calculations

## Management Commands

### Development
```bash
# Start development server
npm run dev

# View database in browser
npm run db:studio

# Reset database (careful!)
npm run db:migrate reset
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
- Ensure PostgreSQL is running
- Check if port 5432 is available
- Verify firewall settings

#### 2. Authentication Failed
- Check username/password in `.env`
- Verify user permissions in PostgreSQL
- Ensure database exists

#### 3. Prisma Client Not Generated
```bash
npm run db:generate
```

#### 4. Schema Push Failed
```bash
# Reset database (WARNING: loses all data)
npm run db:migrate reset

# Or push schema
npm run db:push
```

### Debug Mode
Enable detailed logging by setting in `.env`:
```env
NODE_ENV=development
```

### Database Studio
View and manage your database through Prisma Studio:
```bash
npm run db:studio
```
This opens a web interface at http://localhost:5555

## Sample Data

After seeding, you'll have:

### Demo Users
- **Owner:** owner / admin123
- **Manager:** manager / manager123  
- **Staff:** chef1 / staff123

### Sample Tasks
- Kitchen cleaning tasks
- Menu display updates
- Inventory management
- Customer service tasks

### Skills and Points
- Coffee brewing (50 points)
- Tom Yam preparation (75 points)
- Curry Mee base (60 points)

## Security Notes

### Production Environment
- Change default passwords
- Use strong JWT secrets
- Restrict database access
- Enable SSL connections
- Regular backups

### Development Environment
- Default credentials are fine
- Local database access only
- No external connections

## Next Steps

1. **Test the Application**
   - Start development server: `npm run dev`
   - Login with demo credentials
   - Create and manage tasks

2. **Customize Data**
   - Modify seed data in `prisma/seed.ts`
   - Add your own users and tasks
   - Customize point values

3. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Enable SSL and security features

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify database connection
3. Review Prisma documentation
4. Check the troubleshooting section above

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MakanManager Project Documentation](./README.md)
