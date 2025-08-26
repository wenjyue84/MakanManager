@echo off
REM Database Export Script for MakanManager
REM This script exports your local PostgreSQL database to a SQL file

REM Database connection details (from docker-compose.yml)
set DB_NAME=makan_moments
set DB_USER=makan_user
set DB_PASSWORD=makan_password
set DB_HOST=localhost
set DB_PORT=5432

REM Output file name with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"
set OUTPUT_FILE=makanmanager_backup_%TIMESTAMP%.sql

echo Starting database export...
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo Output file: %OUTPUT_FILE%
echo.

REM Check if pg_dump is available
pg_dump --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: pg_dump not found!
    echo Please install PostgreSQL client tools or add them to your PATH
    echo You can download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo pg_dump found successfully
echo Exporting database...

REM Set password environment variable for pg_dump
set PGPASSWORD=%DB_PASSWORD%

REM Run pg_dump command
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --verbose --clean --create --if-exists > %OUTPUT_FILE%

if %errorlevel% equ 0 (
    echo Database exported successfully!
    echo Output file: %OUTPUT_FILE%
    
    REM Get file size
    for %%A in (%OUTPUT_FILE%) do set size=%%~zA
    set /a sizeMB=%size%/1048576
    echo File size: %sizeMB% MB
    
    echo.
    echo First few lines of the export file:
    echo ----------------------------------------
    type %OUTPUT_FILE% | findstr /n "^" | findstr "^[1-10]:" | findstr /v "^[0-9]*:--"
    
) else (
    echo Export failed with error code: %errorlevel%
    pause
    exit /b 1
)

REM Clear password from environment
set PGPASSWORD=

echo.
echo Export completed successfully!
echo You can now import this file to your Replit database using:
echo   psql -h your_replit_host -U your_replit_username -d your_replit_database ^< %OUTPUT_FILE%
echo.
pause
