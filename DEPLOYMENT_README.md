# MakanManager - AWS Elastic Beanstalk Deployment

This guide will help you deploy your MakanManager application to AWS Elastic Beanstalk.

## Quick Start

1. **Prerequisites Check**:
   - AWS Account with EB access ✓
   - AWS CLI installed and configured ✓
   - EB CLI installed ✓
   - Database (Neon) accessible ✓

2. **Deploy in 3 steps**:
   ```bash
   # Step 1: Initialize EB (first time only)
   eb init

   # Step 2: Set environment variables
   eb setenv DATABASE_URL="your-neon-database-url" SESSION_SECRET="your-random-secret"

   # Step 3: Deploy
   eb create makanmanager-production  # First deployment
   # OR
   eb deploy  # Subsequent deployments
   ```

## Files Created for Deployment

### Configuration Files
- `.ebextensions/` - EB configuration files
  - `01-node-commands.config` - Node.js setup
  - `02-health-check.config` - Health check configuration
  - `03-nginx-proxy.config` - Nginx proxy settings
  - `04-environment-variables.config` - Environment variables

### Platform Files
- `.platform/hooks/` - Deployment hooks
  - `prebuild/01_node_install.sh` - Pre-build setup
  - `postdeploy/01_build_app.sh` - Post-deployment build

### Deployment Files
- `Procfile` - Process definition
- `.ebignore` - Files to exclude from deployment
- `.env.production` - Production environment template
- `deploy-to-eb.sh` / `deploy-to-eb.bat` - Deployment scripts

## Environment Variables Required

### Essential Variables (Must be set)
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your-long-random-session-secret
```

### Optional Variables (Have defaults)
```bash
NODE_ENV=production
PORT=8080
DEFAULT_TASK_POINTS=50
SESSION_TTL_MINUTES=15
LOG_LEVEL=info
```

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │  Elastic         │    │   Neon          │
│   Load Balancer │────│  Beanstalk       │────│   Database      │
│   (nginx)       │    │  (Node.js)       │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Application Flow

1. **Build Process**: 
   - `npm install` → `npm run build` → Static files ready
2. **Server Start**: 
   - `npm start` → `node server/index.js` → Express server
3. **Request Handling**: 
   - Static files served from `/build` directory
   - API requests handled by Express routes
   - Health checks at `/health` endpoint

## Monitoring & Troubleshooting

### Health Check
- Endpoint: `/health`
- Returns: Server status, uptime, timestamp

### Useful Commands
```bash
# Check deployment status
eb status

# View application logs
eb logs

# SSH into the server
eb ssh

# Check environment variables
eb printenv

# Open app in browser
eb open
```

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are properly listed
   - Review build logs: `eb logs`

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is accessible from AWS

3. **Static File Issues**
   - Verify build completed successfully
   - Check nginx configuration
   - Ensure files are in `/build` directory

## Cost Optimization

- **Instance Type**: Start with `t3.micro` (Free Tier eligible)
- **Auto Scaling**: Configure based on traffic patterns
- **Monitoring**: Use CloudWatch to track usage
- **Environment**: Use single instance for development

## Security Checklist

- [ ] Environment variables set securely (not in code)
- [ ] Database uses SSL connection
- [ ] Session secret is long and random
- [ ] HTTPS enabled (configure SSL certificate)
- [ ] Security groups properly configured

## Next Steps After Deployment

1. **Custom Domain**: Configure your domain name
2. **SSL Certificate**: Set up HTTPS with AWS Certificate Manager
3. **Monitoring**: Set up CloudWatch alarms
4. **Backup Strategy**: Configure database backups
5. **CI/CD**: Set up automated deployments from GitHub

## Support

For deployment issues:
1. Check AWS Elastic Beanstalk documentation
2. Review application logs with `eb logs`
3. Verify environment variables with `eb printenv`
4. Test database connectivity

## Version History

- **v1.0.0**: Initial EB deployment configuration
- Configured for Node.js 18 on Amazon Linux 2
- Includes nginx proxy configuration
- Health check endpoints configured
- Auto-build on deployment