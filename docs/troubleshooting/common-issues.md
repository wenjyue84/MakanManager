# Common Issues and Solutions

## Frontend Issues

### 1. Build Errors

#### Vite Build Fails
**Problem**: Vite build process fails with compilation errors
**Solution**:
```bash
# Clear build cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies
npm install

# Try building again
npm run build
```

#### TypeScript Compilation Errors
**Problem**: TypeScript errors prevent build or development
**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
```

### 2. Runtime Errors

#### React Component Errors
**Problem**: Components fail to render or throw errors
**Solution**:
- Check browser console for error messages
- Verify all required props are passed
- Ensure components are properly imported
- Check for missing dependencies in package.json

#### Styling Issues
**Problem**: Tailwind CSS classes not working
**Solution**:
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check Tailwind configuration
npx tailwindcss --help

# Verify PostCSS configuration
```

### 3. PWA Issues

#### Service Worker Not Working
**Problem**: PWA features not functioning
**Solution**:
- Check if HTTPS is enabled (required for PWA)
- Clear browser cache and service workers
- Verify service worker registration in browser dev tools
- Check manifest.json configuration

#### Offline Functionality Issues
**Problem**: App doesn't work offline
**Solution**:
- Verify service worker is caching resources
- Check cache strategies in service worker
- Ensure critical resources are cached
- Test offline mode in browser dev tools

## Backend Issues

### 1. Server Startup Problems

#### Port Already in Use
**Problem**: Server fails to start due to port conflict
**Solution**:
```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Environment Variables Missing
**Problem**: Server crashes due to missing environment variables
**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Copy from example if missing
cp .env.example .env

# Verify required variables are set
cat .env
```

### 2. Database Connection Issues

#### PostgreSQL Connection Failed
**Problem**: Cannot connect to database
**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL service
sudo systemctl start postgresql

# Verify connection parameters
psql -h localhost -U username -d database_name

# Check firewall settings
sudo ufw status
```

#### Migration Errors
**Problem**: Database migrations fail
**Solution**:
```bash
# Check migration status
npm run db:status

# Reset database (WARNING: This will delete all data)
npm run db:reset

# Run migrations manually
npm run db:migrate

# Check for syntax errors in migration files
```

### 3. API Issues

#### CORS Errors
**Problem**: Frontend can't access backend API
**Solution**:
- Verify CORS configuration in backend
- Check if frontend URL is in allowed origins
- Ensure proper headers are set
- Test with Postman to isolate frontend vs backend issue

#### Authentication Errors
**Problem**: JWT tokens not working
**Solution**:
- Check JWT_SECRET in environment variables
- Verify token expiration settings
- Check token format in requests
- Ensure proper middleware order

## Development Environment Issues

### 1. Dependency Problems

#### Package Installation Fails
**Problem**: npm install fails with errors
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try using yarn
npm install -g yarn
yarn install
```

#### Version Conflicts
**Problem**: Dependency version conflicts
**Solution**:
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 2. Build Tool Issues

#### Vite Configuration Problems
**Problem**: Vite dev server not working
**Solution**:
```bash
# Check Vite configuration
cat vite.config.ts

# Verify TypeScript configuration
cat tsconfig.json

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Hot Module Replacement Not Working
**Problem**: Changes not reflected in browser
**Solution**:
- Check if HMR is enabled in Vite config
- Verify file watching is working
- Check for syntax errors preventing compilation
- Restart dev server

## Performance Issues

### 1. Slow Development Server

#### Build Times Too Long
**Problem**: Development builds take too long
**Solution**:
```bash
# Enable Vite optimizations
# Add to vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})

# Use faster package manager
npm install -g pnpm
pnpm install
```

#### Memory Issues
**Problem**: Development server uses too much memory
**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Monitor memory usage
htop
# or
top
```

### 2. Database Performance

#### Slow Queries
**Problem**: Database queries are slow
**Solution**:
```bash
# Check query performance
EXPLAIN ANALYZE SELECT * FROM table_name;

# Check for missing indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'your_table';

# Analyze table statistics
ANALYZE table_name;
```

## Deployment Issues

### 1. Production Build Problems

#### Build Fails in Production
**Problem**: Production build fails but development works
**Solution**:
```bash
# Check environment variables
echo $NODE_ENV

# Verify production dependencies
npm install --production

# Check for missing build tools
npm install -g typescript
npm install -g vite
```

#### Environment Configuration Issues
**Problem**: Production environment not properly configured
**Solution**:
- Verify all environment variables are set
- Check for hardcoded development URLs
- Ensure database connection strings are correct
- Verify SSL certificates for HTTPS

### 2. Runtime Issues in Production

#### Memory Leaks
**Problem**: Application memory usage grows over time
**Solution**:
```bash
# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect app.js

# Restart application periodically
pm2 restart app
```

#### Performance Degradation
**Problem**: Application becomes slower over time
**Solution**:
- Check database connection pool settings
- Monitor CPU and memory usage
- Review logging levels (reduce verbose logging)
- Implement proper caching strategies

## Debugging Techniques

### 1. Frontend Debugging

#### Browser Dev Tools
- Use Console tab for error messages
- Check Network tab for API calls
- Use Sources tab for breakpoint debugging
- Monitor Performance tab for bottlenecks

#### React Dev Tools
- Install React Developer Tools browser extension
- Use Components tab to inspect component tree
- Use Profiler tab to identify performance issues

### 2. Backend Debugging

#### Logging
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check application logs
tail -f logs/app.log

# Use structured logging
console.log(JSON.stringify(data, null, 2));
```

#### Database Debugging
```bash
# Enable PostgreSQL query logging
# Add to postgresql.conf
log_statement = 'all'
log_min_duration_statement = 1000

# Check slow query log
tail -f /var/log/postgresql/postgresql-*.log
```

## Prevention Strategies

### 1. Development Best Practices
- Use TypeScript for type safety
- Implement proper error handling
- Write comprehensive tests
- Use linting and formatting tools
- Regular dependency updates

### 2. Monitoring and Alerting
- Implement health check endpoints
- Monitor application metrics
- Set up error tracking (Sentry, etc.)
- Use logging aggregation tools
- Regular performance audits

---

*This document should be updated as new issues are discovered and resolved.*
