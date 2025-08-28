@echo off
echo 📦 Creating AWS Elastic Beanstalk Deployment Package...

REM Create deployment directory
if exist "deployment-package" rmdir /s /q "deployment-package"
mkdir "deployment-package"

echo ✅ Copying application files...

REM Copy essential files and directories
xcopy "src" "deployment-package\src\" /e /i /q
xcopy "server" "deployment-package\server\" /e /i /q
xcopy "backend" "deployment-package\backend\" /e /i /q
xcopy "build" "deployment-package\build\" /e /i /q
xcopy "public" "deployment-package\public\" /e /i /q
xcopy ".ebextensions" "deployment-package\.ebextensions\" /e /i /q
xcopy ".platform" "deployment-package\.platform\" /e /i /q
xcopy "prisma" "deployment-package\prisma\" /e /i /q
xcopy "shared" "deployment-package\shared\" /e /i /q

REM Copy configuration files
copy "package.json" "deployment-package\"
copy "package-lock.json" "deployment-package\"
copy "Procfile" "deployment-package\"
copy ".ebignore" "deployment-package\"
copy "tsconfig.json" "deployment-package\"
copy "tsconfig.node.json" "deployment-package\"
copy "tailwind.config.js" "deployment-package\"
copy "tailwind.config.ts" "deployment-package\"
copy "postcss.config.mjs" "deployment-package\"
copy "components.json" "deployment-package\"
copy "vite.config.ts" "deployment-package\"
copy ".env.production" "deployment-package\"

echo ✅ Creating ZIP file for deployment...

REM Create ZIP file using PowerShell
powershell -command "Compress-Archive -Path 'deployment-package\*' -DestinationPath 'makanmanager-deployment.zip' -Force"

echo ✅ Deployment package created: makanmanager-deployment.zip

echo.
echo 🚀 Ready to Deploy!
echo.
echo Next Steps:
echo 1. Go to AWS Elastic Beanstalk Console
echo 2. Create new application: MakanManager
echo 3. Upload: makanmanager-deployment.zip
echo 4. Set environment variables (DATABASE_URL, SESSION_SECRET)
echo 5. Deploy!
echo.
echo File size: 
for %%A in (makanmanager-deployment.zip) do echo %%~zA bytes

pause