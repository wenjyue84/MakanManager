@echo off
REM AWS Elastic Beanstalk Deployment Script for MakanManager (Windows)
REM This script prepares and deploys the application to AWS EB

echo 🚀 Starting AWS Elastic Beanstalk deployment process...

REM Check if EB CLI is installed
eb --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Elastic Beanstalk CLI (eb) is not installed.
    echo [INFO] Install it with: pip install awsebcli --upgrade --user
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Clean up previous builds
echo [INFO] Cleaning up previous builds...
if exist "build" rmdir /s /q "build"
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

REM Install dependencies
echo [INFO] Installing dependencies...
npm ci
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Build the React application
echo [INFO] Building React application...
npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

REM Verify build was successful
if not exist "build" (
    echo [ERROR] Build failed - build directory not found
    pause
    exit /b 1
)

echo [INFO] Build completed successfully!

REM Check if EB is initialized
if not exist ".elasticbeanstalk\config.yml" (
    echo [WARNING] EB not initialized. Run 'eb init' first to set up your application.
    echo [INFO] You can run this script again after initialization.
    pause
    exit /b 1
)

REM Deploy to EB
echo [INFO] Deploying to Elastic Beanstalk...
eb deploy
if errorlevel 1 (
    echo [ERROR] Deployment failed. Check the logs with 'eb logs'
    pause
    exit /b 1
)

echo [INFO] ✅ Deployment successful!
echo [INFO] Opening application in browser...
eb open

echo [INFO] 🎉 Deployment process completed!
echo [INFO] Useful commands:
echo [INFO]   - View logs: eb logs
echo [INFO]   - Check status: eb status
echo [INFO]   - SSH to instance: eb ssh
echo [INFO]   - Check environment variables: eb printenv

pause