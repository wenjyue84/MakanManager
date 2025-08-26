# Database Export Commands for MakanManager

## Prerequisites
Make sure you have PostgreSQL client tools installed and accessible from command line:
- Download from: https://www.postgresql.org/download/windows/
- Add to your system PATH

## Manual Export Commands

### 1. Basic Export (Recommended)
```bash
# Set password environment variable
set PGPASSWORD=makan_password

# Export database to SQL file
pg_dump -h localhost -p 5432 -U makan_user -d makan_moments --verbose --clean --create --if-exists > makanmanager_backup.sql

# Clear password from environment
set PGPASSWORD=
```

### 2. Export with Timestamp
```bash
# Set password environment variable
set PGPASSWORD=makan_password

# Export with timestamp
pg_dump -h localhost -p 5432 -U makan_user -d makan_moments --verbose --clean --create --if-exists > makanmanager_backup_%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%.sql

# Clear password from environment
set PGPASSWORD=
```

### 3. Export Only Schema (No Data)
```bash
set PGPASSWORD=makan_password
pg_dump -h localhost -p 5432 -U makan_user -d makan_moments --schema-only --verbose --clean --create --if-exists > makanmanager_schema_only.sql
set PGPASSWORD=
```

### 4. Export Only Data (No Schema)
```bash
set PGPASSWORD=makan_password
pg_dump -h localhost -p 5432 -U makan_user -d makan_moments --data-only --verbose > makanmanager_data_only.sql
set PGPASSWORD=
```

## Import to Replit

Once you have your SQL file, import it to Replit using:

```bash
# Set password for Replit database
set PGPASSWORD=your_replit_password

# Import the SQL file
psql -h your_replit_host -p 5432 -U your_replit_username -d your_replit_database < makanmanager_backup.sql

# Clear password
set PGPASSWORD=
```

## Database Connection Details

From your `docker-compose.yml`:
- **Database Name**: `makan_moments`
- **Username**: `makan_user`
- **Password**: `makan_password`
- **Host**: `localhost`
- **Port**: `5432`

## Troubleshooting

### If pg_dump is not found:
1. Install PostgreSQL client tools
2. Add to system PATH
3. Restart command prompt

### If connection fails:
1. Ensure Docker container is running: `docker-compose up -d`
2. Check if database is accessible: `psql -h localhost -U makan_user -d makan_moments`
3. Verify credentials in docker-compose.yml

### If export is empty:
1. Check if database has data
2. Verify user permissions
3. Try connecting directly with psql first

## File Size Considerations

- Small databases (< 100MB): Use basic export
- Large databases (> 100MB): Consider splitting or using custom format
- Very large databases: Use `--jobs` parameter for parallel export

## Custom Format Export (For Large Databases)

```bash
set PGPASSWORD=makan_password
pg_dump -h localhost -p 5432 -U makan_user -d makan_moments -Fc --verbose > makanmanager_backup.dump
set PGPASSWORD=
```

Import custom format:
```bash
set PGPASSWORD=your_replit_password
pg_restore -h your_replit_host -p 5432 -U your_replit_username -d your_replit_database makanmanager_backup.dump
set PGPASSWORD=
```
