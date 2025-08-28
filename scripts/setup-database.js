#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MakanManager Database...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://makan_user:makan_password@localhost:5432/makan_moments"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Check if Prisma is installed
try {
  require('@prisma/client');
  console.log('✅ Prisma client is installed');
} catch (error) {
  console.log('📦 Installing Prisma client...');
  try {
    execSync('npm install @prisma/client', { stdio: 'inherit' });
    console.log('✅ Prisma client installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Prisma client:', installError.message);
    process.exit(1);
  }
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Test database connection by trying to push schema
console.log('\n🔌 Testing database connection and pushing schema...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database connection successful and schema pushed');
  
  // Seed database
  console.log('\n🌱 Seeding database...');
  try {
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
    console.log('   You can run seeding manually with: npm run db:seed');
  }
  
  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start your development server: npm run dev');
  console.log('   2. Open http://localhost:3000 in your browser');
  console.log('   3. Login with demo credentials:');
  console.log('      - Owner: owner / admin123');
  console.log('      - Manager: manager / manager123');
  console.log('      - Staff: chef1 / staff123');
  console.log('\n🔧 Database management commands:');
  console.log('   - View database: npx prisma studio');
  console.log('   - Reset database: npx prisma migrate reset');
  console.log('   - Generate migrations: npx prisma migrate dev');
  
} catch (error) {
  console.error('❌ Database connection or schema push failed:', error.message);
  console.log('\n📋 Please ensure your PostgreSQL database is running and accessible');
  console.log('   Default connection details:');
  console.log('   - Host: localhost');
  console.log('   - Port: 5432');
  console.log('   - Database: makan_moments');
  console.log('   - User: makan_user');
  console.log('   - Password: makan_password');
  console.log('\n   You can modify these in your .env file');
  process.exit(1);
}
