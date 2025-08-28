# AWS Elastic Beanstalk Deployment Guide

## Prerequisites

1. **AWS Account** with Elastic Beanstalk access
2. **AWS CLI** installed and configured
3. **Elastic Beanstalk CLI (EB CLI)** installed
4. **Database**: Your Neon PostgreSQL database should be accessible from AWS

## Environment Variables Setup

### Required Environment Variables
Set these through the EB Console or EB CLI:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your-random-long-session-secret-here
```

### Optional Environment Variables
These have defaults but can be customized:

```bash
NODE_ENV=production
PORT=8080
DEFAULT_TASK_POINTS=50
SESSION_TTL_MINUTES=15
LOG_LEVEL=info
ENABLE_DETAILED_LOGGING=false
ENABLE_METRICS=true
```

## Deployment Steps

### Option 1: Using EB CLI (Recommended)

1. **Install EB CLI**:
   ```bash
   pip install awsebcli --upgrade --user
   ```

2. **Initialize EB application**:
   ```bash
   eb init
   ```
   - Choose your region
   - Select "Node.js" platform
   - Choose Node.js 18 running on 64bit Amazon Linux 2

3. **Create environment**:
   ```bash
   eb create makanmanager-production
   ```

4. **Set environment variables**:
   ```bash
   eb setenv DATABASE_URL="your-neon-database-url"
   eb setenv SESSION_SECRET="your-long-random-secret"
   ```

5. **Deploy**:
   ```bash
   eb deploy
   ```

### Option 2: Using AWS Console

1. **Create Application**:
   - Go to Elastic Beanstalk console
   - Click "Create application"
   - Application name: `MakanManager`
   - Platform: Node.js 18 running on 64bit Amazon Linux 2

2. **Upload Code**:
   - Create deployment package (zip entire project)
   - Upload to EB or use S3

3. **Configure Environment**:
   - Go to Configuration → Software
   - Add environment variables listed above

4. **Deploy**:
   - Upload your application version
   - Deploy to environment

## Database Configuration

### Using Neon Database (Current Setup)
- Your Neon database URL should be accessible from AWS
- Update security groups if needed
- Format: `postgresql://username:password@host:port/database_name`

### Using AWS RDS (Alternative)
If you prefer AWS-hosted database:

1. Create RDS PostgreSQL instance
2. Update security groups to allow EB access
3. Update DATABASE_URL environment variable

## Post-Deployment

### Health Checks
- Application health check: `/health`
- Application will be available at your EB environment URL

### Monitoring
- Check CloudWatch logs for any issues
- Monitor application performance through EB console

### SSL/HTTPS
- Configure Application Load Balancer for SSL
- Upload SSL certificate through AWS Certificate Manager

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check if all dependencies are in `dependencies` (not `devDependencies`)
   - Ensure Node.js version compatibility

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check network connectivity from EB to database

3. **Static Files Not Loading**:
   - Ensure build process completed successfully
   - Check nginx configuration in `.ebextensions`

4. **Environment Variable Issues**:
   - Use EB CLI: `eb printenv` to verify variables
   - Restart environment after changing variables

### Useful Commands

```bash
# Check application status
eb status

# View logs
eb logs

# SSH into instance
eb ssh

# Open application in browser
eb open

# Check environment variables
eb printenv
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to repository
2. **Database Access**: Use secure connections (SSL)
3. **Session Secret**: Use a long, random string
4. **HTTPS**: Enable SSL/TLS in production
5. **Security Groups**: Restrict access to necessary ports only

## Scaling

- EB can auto-scale based on demand
- Configure scaling policies in EB console
- Monitor CPU and memory usage

## Backup

- EB automatically creates application versions
- Database backups should be configured separately
- Consider automated backup strategies for Neon database

## Cost Optimization

- Use appropriate instance sizes
- Configure auto-scaling to minimize costs
- Monitor AWS billing dashboard
- Consider spot instances for development environments