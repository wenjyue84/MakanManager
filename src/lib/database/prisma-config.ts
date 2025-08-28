import { PrismaClient } from '@prisma/client';

// Database configuration
const databaseUrl = process.env.DATABASE_URL || 'postgresql://makan_user:makan_password@localhost:5432/makan_moments';

// Prisma client configuration
const prismaClientConfig = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// Create Prisma client instance
export const prisma = new PrismaClient(prismaClientConfig);

// Database connection status
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Environment variables validation
export const validateDatabaseConfig = (): void => {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('Using default database configuration');
  }
};

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  validateDatabaseConfig();
  
  try {
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      console.log('🚀 Database initialized successfully');
    } else {
      console.error('💥 Failed to initialize database');
    }
  } catch (error) {
    console.error('💥 Database initialization error:', error);
  }
};
