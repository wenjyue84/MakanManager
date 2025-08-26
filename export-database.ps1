# Database Export Script for MakanManager
# This script exports your local PostgreSQL database to a SQL file

# Database connection details (from docker-compose.yml)
$DB_NAME = "makan_moments"
$DB_USER = "makan_user"
$DB_PASSWORD = "makan_password"
$DB_HOST = "localhost"
$DB_PORT = "5432"

# Output file name with timestamp
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$OUTPUT_FILE = "makanmanager_backup_$TIMESTAMP.sql"

Write-Host "Starting database export..." -ForegroundColor Green
Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "Host: $DB_HOST:$DB_PORT" -ForegroundColor Cyan
Write-Host "Output file: $OUTPUT_FILE" -ForegroundColor Cyan

# Check if pg_dump is available
try {
    $pgDumpVersion = pg_dump --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "pg_dump found: $pgDumpVersion" -ForegroundColor Green
    } else {
        throw "pg_dump not found"
    }
} catch {
    Write-Host "Error: pg_dump not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools or add them to your PATH" -ForegroundColor Yellow
    Write-Host "You can download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Export the database
Write-Host "Exporting database..." -ForegroundColor Yellow

try {
    # Set password environment variable for pg_dump
    $env:PGPASSWORD = $DB_PASSWORD
    
    # Run pg_dump command
    pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --verbose --clean --create --if-exists > $OUTPUT_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database exported successfully!" -ForegroundColor Green
        Write-Host "Output file: $OUTPUT_FILE" -ForegroundColor Green
        
        # Get file size
        $fileSize = (Get-Item $OUTPUT_FILE).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "File size: $fileSizeMB MB" -ForegroundColor Green
        
        # Show first few lines to verify content
        Write-Host "First few lines of the export file:" -ForegroundColor Cyan
        Get-Content $OUTPUT_FILE | Select-Object -First 10 | ForEach-Object { Write-Host "  $($_)" -ForegroundColor Gray }
        
    } else {
        Write-Host "Export failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error during export: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Export completed successfully!" -ForegroundColor Green
Write-Host "You can now import this file to your Replit database using:" -ForegroundColor Cyan
Write-Host "  psql -h your_replit_host -U your_replit_username -d your_replit_database < $OUTPUT_FILE" -ForegroundColor White
