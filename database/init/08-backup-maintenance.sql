-- Enterprise Backup and Maintenance Framework
-- Comprehensive database maintenance, backup, and monitoring procedures

-- Create maintenance schema for maintenance-related objects
CREATE SCHEMA IF NOT EXISTS maintenance;

-- ==================== DATABASE HEALTH MONITORING ====================

-- Table to track database health metrics
CREATE TABLE maintenance.health_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    threshold_warning NUMERIC,
    threshold_critical NUMERIC,
    status TEXT CHECK (status IN ('OK', 'WARNING', 'CRITICAL')) DEFAULT 'OK',
    measurement_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index for health metrics queries
CREATE INDEX idx_health_metrics_time ON maintenance.health_metrics(measurement_time DESC);
CREATE INDEX idx_health_metrics_status ON maintenance.health_metrics(status, measurement_time DESC) WHERE status != 'OK';

-- Table to track backup operations
CREATE TABLE maintenance.backup_log (
    id BIGSERIAL PRIMARY KEY,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('FULL', 'INCREMENTAL', 'ARCHIVE', 'LOGICAL')),
    backup_method TEXT NOT NULL,
    backup_location TEXT,
    backup_size_bytes BIGINT,
    backup_duration_seconds INTEGER,
    compression_ratio DECIMAL(5,2),
    backup_status TEXT CHECK (backup_status IN ('STARTED', 'COMPLETED', 'FAILED', 'PARTIAL')) DEFAULT 'STARTED',
    error_message TEXT,
    metadata JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for backup log queries
CREATE INDEX idx_backup_log_time ON maintenance.backup_log(started_at DESC);
CREATE INDEX idx_backup_log_status ON maintenance.backup_log(backup_status, started_at DESC);

-- Table to track maintenance operations
CREATE TABLE maintenance.maintenance_log (
    id BIGSERIAL PRIMARY KEY,
    operation_type TEXT NOT NULL,
    operation_description TEXT NOT NULL,
    table_names TEXT[],
    duration_seconds INTEGER,
    records_affected BIGINT,
    operation_status TEXT CHECK (operation_status IN ('STARTED', 'COMPLETED', 'FAILED', 'CANCELLED')) DEFAULT 'STARTED',
    error_message TEXT,
    metadata JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_by TEXT DEFAULT CURRENT_USER
);

-- ==================== COMPREHENSIVE HEALTH CHECK PROCEDURES ====================

-- Function to collect comprehensive database health metrics
CREATE OR REPLACE FUNCTION maintenance.collect_health_metrics()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_unit TEXT,
    status TEXT,
    details JSONB
) AS $$
DECLARE
    v_database_size BIGINT;
    v_connection_count INTEGER;
    v_long_running_queries INTEGER;
    v_locks_count INTEGER;
    v_cache_hit_ratio NUMERIC;
    v_index_usage_ratio NUMERIC;
    v_bloat_ratio NUMERIC;
    v_vacuum_age INTERVAL;
    v_archive_lag_mb NUMERIC;
BEGIN
    -- Database size
    SELECT pg_database_size(current_database()) INTO v_database_size;
    
    RETURN QUERY SELECT 
        'database_size'::TEXT, 
        v_database_size::NUMERIC, 
        'bytes'::TEXT,
        CASE WHEN v_database_size > 10737418240 THEN 'WARNING' ELSE 'OK' END, -- 10GB threshold
        jsonb_build_object('size_gb', ROUND(v_database_size/1073741824.0, 2));
    
    -- Active connections
    SELECT COUNT(*) INTO v_connection_count
    FROM pg_stat_activity 
    WHERE state = 'active' AND query != '<IDLE>';
    
    RETURN QUERY SELECT 
        'active_connections'::TEXT,
        v_connection_count::NUMERIC,
        'count'::TEXT,
        CASE 
            WHEN v_connection_count > 50 THEN 'CRITICAL'
            WHEN v_connection_count > 25 THEN 'WARNING'
            ELSE 'OK'
        END,
        jsonb_build_object('connection_count', v_connection_count);
    
    -- Long running queries (> 5 minutes)
    SELECT COUNT(*) INTO v_long_running_queries
    FROM pg_stat_activity 
    WHERE state = 'active' 
    AND query_start < CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    AND query NOT LIKE '%pg_stat_activity%';
    
    RETURN QUERY SELECT 
        'long_running_queries'::TEXT,
        v_long_running_queries::NUMERIC,
        'count'::TEXT,
        CASE WHEN v_long_running_queries > 0 THEN 'WARNING' ELSE 'OK' END,
        jsonb_build_object('long_queries', v_long_running_queries);
    
    -- Lock count
    SELECT COUNT(*) INTO v_locks_count
    FROM pg_locks 
    WHERE NOT granted;
    
    RETURN QUERY SELECT 
        'blocked_locks'::TEXT,
        v_locks_count::NUMERIC,
        'count'::TEXT,
        CASE WHEN v_locks_count > 0 THEN 'WARNING' ELSE 'OK' END,
        jsonb_build_object('blocked_locks', v_locks_count);
    
    -- Cache hit ratio
    SELECT 
        ROUND((SUM(blks_hit) / (SUM(blks_hit) + SUM(blks_read) + 0.001) * 100)::NUMERIC, 2)
    INTO v_cache_hit_ratio
    FROM pg_stat_database 
    WHERE datname = current_database();
    
    RETURN QUERY SELECT 
        'cache_hit_ratio'::TEXT,
        v_cache_hit_ratio,
        'percent'::TEXT,
        CASE 
            WHEN v_cache_hit_ratio < 85 THEN 'CRITICAL'
            WHEN v_cache_hit_ratio < 95 THEN 'WARNING'
            ELSE 'OK'
        END,
        jsonb_build_object('hit_ratio', v_cache_hit_ratio);
    
    -- Index usage ratio for user tables
    WITH index_usage AS (
        SELECT 
            schemaname,
            tablename,
            COALESCE(ROUND((100 * idx_scan / (seq_scan + idx_scan + 0.001))::NUMERIC, 2), 0) as usage_ratio
        FROM pg_stat_user_tables
        WHERE seq_scan + idx_scan > 0
    )
    SELECT AVG(usage_ratio) INTO v_index_usage_ratio FROM index_usage;
    
    RETURN QUERY SELECT 
        'index_usage_ratio'::TEXT,
        COALESCE(v_index_usage_ratio, 0),
        'percent'::TEXT,
        CASE 
            WHEN COALESCE(v_index_usage_ratio, 0) < 70 THEN 'WARNING'
            WHEN COALESCE(v_index_usage_ratio, 0) < 50 THEN 'CRITICAL'
            ELSE 'OK'
        END,
        jsonb_build_object('usage_ratio', COALESCE(v_index_usage_ratio, 0));
    
    -- Check for table bloat (estimated)
    WITH bloat_info AS (
        SELECT 
            schemaname,
            tablename,
            ROUND(100 * (pg_relation_size(schemaname||'.'||tablename) / 
                  (GREATEST(pg_stat_user_tables.n_tup_ins + pg_stat_user_tables.n_tup_upd, 1) * 
                   COALESCE((SELECT AVG(avg_width) FROM pg_stats WHERE schemaname = pg_stat_user_tables.schemaname 
                            AND tablename = pg_stat_user_tables.tablename), 100))), 2) as bloat_ratio
        FROM pg_stat_user_tables
        WHERE n_tup_ins + n_tup_upd > 1000
    )
    SELECT AVG(bloat_ratio) INTO v_bloat_ratio FROM bloat_info;
    
    RETURN QUERY SELECT 
        'table_bloat_ratio'::TEXT,
        COALESCE(v_bloat_ratio, 0),
        'ratio'::TEXT,
        CASE 
            WHEN COALESCE(v_bloat_ratio, 0) > 5 THEN 'WARNING'
            WHEN COALESCE(v_bloat_ratio, 0) > 10 THEN 'CRITICAL'
            ELSE 'OK'
        END,
        jsonb_build_object('avg_bloat', COALESCE(v_bloat_ratio, 0));
    
    -- Check last vacuum/analyze age
    SELECT MAX(GREATEST(
        COALESCE(CURRENT_TIMESTAMP - last_vacuum, INTERVAL '0'),
        COALESCE(CURRENT_TIMESTAMP - last_autovacuum, INTERVAL '0')
    )) INTO v_vacuum_age
    FROM pg_stat_user_tables;
    
    RETURN QUERY SELECT 
        'max_vacuum_age'::TEXT,
        EXTRACT(EPOCH FROM COALESCE(v_vacuum_age, INTERVAL '0'))/3600,
        'hours'::TEXT,
        CASE 
            WHEN v_vacuum_age > INTERVAL '7 days' THEN 'CRITICAL'
            WHEN v_vacuum_age > INTERVAL '2 days' THEN 'WARNING'
            ELSE 'OK'
        END,
        jsonb_build_object('hours_since_vacuum', EXTRACT(EPOCH FROM COALESCE(v_vacuum_age, INTERVAL '0'))/3600);
    
    -- Replication lag (if applicable)
    -- This would need to be customized based on your replication setup
    RETURN QUERY SELECT 
        'replication_lag'::TEXT,
        0::NUMERIC,
        'seconds'::TEXT,
        'OK'::TEXT,
        jsonb_build_object('note', 'Replication monitoring not configured');
END;
$$ LANGUAGE plpgsql;

-- Function to store health metrics and create alerts
CREATE OR REPLACE FUNCTION maintenance.monitor_database_health()
RETURNS TEXT AS $$
DECLARE
    v_metric RECORD;
    v_critical_issues INTEGER := 0;
    v_warning_issues INTEGER := 0;
    v_result TEXT := 'Health Check Results:\n';
BEGIN
    -- Collect and store health metrics
    FOR v_metric IN SELECT * FROM maintenance.collect_health_metrics()
    LOOP
        INSERT INTO maintenance.health_metrics (
            metric_name, metric_value, metric_unit, status, details
        ) VALUES (
            v_metric.metric_name, v_metric.metric_value, v_metric.metric_unit,
            v_metric.status, v_metric.details
        );
        
        v_result := v_result || format('- %s: %s %s [%s]\n', 
                                     v_metric.metric_name, 
                                     v_metric.metric_value, 
                                     v_metric.metric_unit,
                                     v_metric.status);
        
        -- Count issues
        IF v_metric.status = 'CRITICAL' THEN
            v_critical_issues := v_critical_issues + 1;
        ELSIF v_metric.status = 'WARNING' THEN
            v_warning_issues := v_warning_issues + 1;
        END IF;
        
        -- Create issues for critical problems
        IF v_metric.status = 'CRITICAL' THEN
            INSERT INTO issues (
                title, description, category, priority, reported_by_id, status
            ) VALUES (
                format('Database Health Alert: %s', v_metric.metric_name),
                format('Critical database health issue detected: %s = %s %s', 
                       v_metric.metric_name, v_metric.metric_value, v_metric.metric_unit),
                'maintenance',
                'critical',
                (SELECT id FROM users WHERE 'owner' = ANY(roles) LIMIT 1),
                'open'
            );
        END IF;
    END LOOP;
    
    v_result := v_result || format('\nSummary: %s critical issues, %s warnings', 
                                 v_critical_issues, v_warning_issues);
    
    -- Log overall health status
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'health_check_completed', 1,
        jsonb_build_object(
            'critical_issues', v_critical_issues,
            'warning_issues', v_warning_issues,
            'total_metrics', (SELECT COUNT(*) FROM maintenance.collect_health_metrics())
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== BACKUP PROCEDURES ====================

-- Function to initiate logical backup
CREATE OR REPLACE FUNCTION maintenance.create_logical_backup(
    p_backup_location TEXT DEFAULT '/backups/',
    p_compress BOOLEAN DEFAULT TRUE,
    p_tables TEXT[] DEFAULT NULL -- NULL means all tables
) RETURNS UUID AS $$
DECLARE
    v_backup_id UUID;
    v_backup_file TEXT;
    v_timestamp TEXT;
    v_command TEXT;
    v_table_list TEXT := '';
BEGIN
    -- Generate backup ID and timestamp
    v_backup_id := uuid_generate_v4();
    v_timestamp := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    v_backup_file := format('%smakan_manager_backup_%s.sql', p_backup_location, v_timestamp);
    
    IF p_compress THEN
        v_backup_file := v_backup_file || '.gz';
    END IF;
    
    -- Build table list if specified
    IF p_tables IS NOT NULL THEN
        v_table_list := ' -t ' || array_to_string(p_tables, ' -t ');
    END IF;
    
    -- Log backup start
    INSERT INTO maintenance.backup_log (
        id, backup_type, backup_method, backup_location, backup_status, metadata
    ) VALUES (
        v_backup_id, 'LOGICAL', 'pg_dump', v_backup_file, 'STARTED',
        jsonb_build_object(
            'compress', p_compress,
            'tables', p_tables,
            'command_template', 'pg_dump with custom options'
        )
    );
    
    -- Note: In a real implementation, you would execute the actual backup command here
    -- This is a template for the backup command that would be executed externally:
    v_command := format(
        'pg_dump -h localhost -U makan_app -d makan_manager %s %s %s > %s',
        CASE WHEN p_compress THEN '| gzip' ELSE '' END,
        v_table_list,
        '--verbose --no-owner --no-privileges',
        v_backup_file
    );
    
    -- Log the backup command for external execution
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'backup_initiated', 1,
        jsonb_build_object(
            'backup_id', v_backup_id,
            'backup_command', v_command,
            'backup_file', v_backup_file
        )
    );
    
    RETURN v_backup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark backup as completed (called by external backup script)
CREATE OR REPLACE FUNCTION maintenance.complete_backup(
    p_backup_id UUID,
    p_success BOOLEAN,
    p_backup_size BIGINT DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_backup_record RECORD;
BEGIN
    -- Get backup record
    SELECT * INTO v_backup_record 
    FROM maintenance.backup_log 
    WHERE id = p_backup_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Backup record not found: %', p_backup_id;
    END IF;
    
    -- Update backup record
    UPDATE maintenance.backup_log
    SET 
        backup_status = CASE WHEN p_success THEN 'COMPLETED' ELSE 'FAILED' END,
        backup_size_bytes = p_backup_size,
        backup_duration_seconds = p_duration_seconds,
        error_message = p_error_message,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = p_backup_id;
    
    -- Create issue if backup failed
    IF NOT p_success THEN
        INSERT INTO issues (
            title, description, category, priority, reported_by_id, status
        ) VALUES (
            'Backup Failure',
            format('Backup %s failed: %s', p_backup_id, COALESCE(p_error_message, 'Unknown error')),
            'maintenance',
            'high',
            (SELECT id FROM users WHERE 'owner' = ANY(roles) LIMIT 1),
            'open'
        );
    END IF;
    
    -- Log backup completion
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'backup_completed', CASE WHEN p_success THEN 1 ELSE 0 END,
        jsonb_build_object(
            'backup_id', p_backup_id,
            'success', p_success,
            'size_bytes', p_backup_size,
            'duration_seconds', p_duration_seconds
        )
    );
    
    RETURN p_success;
END;
$$ LANGUAGE plpgsql;

-- ==================== MAINTENANCE PROCEDURES ====================

-- Comprehensive vacuum and analyze procedure
CREATE OR REPLACE FUNCTION maintenance.vacuum_analyze_all(
    p_vacuum_full BOOLEAN DEFAULT FALSE,
    p_analyze_only BOOLEAN DEFAULT FALSE
) RETURNS TEXT AS $$
DECLARE
    v_table RECORD;
    v_result TEXT := '';
    v_start_time TIMESTAMP;
    v_duration INTEGER;
    v_tables_processed INTEGER := 0;
    v_operation_id BIGINT;
BEGIN
    v_start_time := CURRENT_TIMESTAMP;
    
    -- Log operation start
    INSERT INTO maintenance.maintenance_log (
        operation_type, operation_description, operation_status
    ) VALUES (
        CASE 
            WHEN p_analyze_only THEN 'ANALYZE'
            WHEN p_vacuum_full THEN 'VACUUM_FULL'
            ELSE 'VACUUM_ANALYZE'
        END,
        format('Maintenance operation: vacuum_full=%s, analyze_only=%s', p_vacuum_full, p_analyze_only),
        'STARTED'
    ) RETURNING id INTO v_operation_id;
    
    -- Process each user table
    FOR v_table IN 
        SELECT schemaname, tablename, n_tup_ins + n_tup_upd + n_tup_del as activity
        FROM pg_stat_user_tables 
        ORDER BY activity DESC
    LOOP
        BEGIN
            IF NOT p_analyze_only THEN
                IF p_vacuum_full THEN
                    EXECUTE format('VACUUM FULL ANALYZE %I.%I', v_table.schemaname, v_table.tablename);
                    v_result := v_result || format('VACUUM FULL ANALYZE %s.%s\n', v_table.schemaname, v_table.tablename);
                ELSE
                    EXECUTE format('VACUUM ANALYZE %I.%I', v_table.schemaname, v_table.tablename);
                    v_result := v_result || format('VACUUM ANALYZE %s.%s\n', v_table.schemaname, v_table.tablename);
                END IF;
            ELSE
                EXECUTE format('ANALYZE %I.%I', v_table.schemaname, v_table.tablename);
                v_result := v_result || format('ANALYZE %s.%s\n', v_table.schemaname, v_table.tablename);
            END IF;
            
            v_tables_processed := v_tables_processed + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_result := v_result || format('ERROR processing %s.%s: %s\n', 
                                         v_table.schemaname, v_table.tablename, SQLERRM);
        END;
    END LOOP;
    
    v_duration := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_start_time));
    
    -- Update operation log
    UPDATE maintenance.maintenance_log
    SET 
        operation_status = 'COMPLETED',
        duration_seconds = v_duration,
        records_affected = v_tables_processed,
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('tables_processed', v_tables_processed)
    WHERE id = v_operation_id;
    
    v_result := v_result || format('\nCompleted in %s seconds. %s tables processed.', v_duration, v_tables_processed);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Index maintenance procedure
CREATE OR REPLACE FUNCTION maintenance.reindex_database(
    p_tables TEXT[] DEFAULT NULL,
    p_concurrently BOOLEAN DEFAULT TRUE
) RETURNS TEXT AS $$
DECLARE
    v_index RECORD;
    v_result TEXT := '';
    v_start_time TIMESTAMP;
    v_duration INTEGER;
    v_indexes_processed INTEGER := 0;
    v_operation_id BIGINT;
    v_table_filter TEXT := '';
BEGIN
    v_start_time := CURRENT_TIMESTAMP;
    
    -- Build table filter
    IF p_tables IS NOT NULL THEN
        v_table_filter := format('AND t.tablename = ANY(%L)', p_tables);
    END IF;
    
    -- Log operation start
    INSERT INTO maintenance.maintenance_log (
        operation_type, operation_description, table_names, operation_status
    ) VALUES (
        'REINDEX',
        format('Reindex operation: concurrently=%s, tables=%s', p_concurrently, COALESCE(array_to_string(p_tables, ','), 'all')),
        p_tables,
        'STARTED'
    ) RETURNING id INTO v_operation_id;
    
    -- Get indexes to rebuild (excluding system catalogs and unique indexes if concurrent)
    FOR v_index IN 
        EXECUTE format('
            SELECT i.schemaname, i.indexname, t.tablename
            FROM pg_stat_user_indexes i
            JOIN pg_stat_user_tables t ON i.relid = t.relid
            WHERE i.schemaname NOT IN (''information_schema'', ''pg_catalog'')
            %s
            ORDER BY t.seq_scan + t.idx_scan DESC
        ', v_table_filter)
    LOOP
        BEGIN
            IF p_concurrently THEN
                EXECUTE format('REINDEX INDEX CONCURRENTLY %I.%I', v_index.schemaname, v_index.indexname);
                v_result := v_result || format('REINDEX CONCURRENTLY %s.%s\n', v_index.schemaname, v_index.indexname);
            ELSE
                EXECUTE format('REINDEX INDEX %I.%I', v_index.schemaname, v_index.indexname);
                v_result := v_result || format('REINDEX %s.%s\n', v_index.schemaname, v_index.indexname);
            END IF;
            
            v_indexes_processed := v_indexes_processed + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_result := v_result || format('ERROR reindexing %s.%s: %s\n', 
                                         v_index.schemaname, v_index.indexname, SQLERRM);
        END;
    END LOOP;
    
    v_duration := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_start_time));
    
    -- Update operation log
    UPDATE maintenance.maintenance_log
    SET 
        operation_status = 'COMPLETED',
        duration_seconds = v_duration,
        records_affected = v_indexes_processed,
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('indexes_processed', v_indexes_processed)
    WHERE id = v_operation_id;
    
    v_result := v_result || format('\nCompleted in %s seconds. %s indexes processed.', v_duration, v_indexes_processed);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Database statistics update procedure
CREATE OR REPLACE FUNCTION maintenance.update_statistics()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
    v_start_time TIMESTAMP;
    v_duration INTEGER;
    v_operation_id BIGINT;
BEGIN
    v_start_time := CURRENT_TIMESTAMP;
    
    -- Log operation start
    INSERT INTO maintenance.maintenance_log (
        operation_type, operation_description, operation_status
    ) VALUES (
        'UPDATE_STATISTICS',
        'Update database statistics for query planner',
        'STARTED'
    ) RETURNING id INTO v_operation_id;
    
    -- Analyze all tables
    ANALYZE;
    
    -- Update pg_stat_statements if available
    BEGIN
        PERFORM pg_stat_statements_reset();
        v_result := v_result || 'pg_stat_statements reset\n';
    EXCEPTION WHEN OTHERS THEN
        v_result := v_result || 'pg_stat_statements not available or error: ' || SQLERRM || '\n';
    END;
    
    v_duration := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_start_time));
    
    -- Update operation log
    UPDATE maintenance.maintenance_log
    SET 
        operation_status = 'COMPLETED',
        duration_seconds = v_duration,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = v_operation_id;
    
    v_result := v_result || format('Statistics updated in %s seconds.', v_duration);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== DATA ARCHIVAL PROCEDURES ====================

-- Function to archive old audit data
CREATE OR REPLACE FUNCTION maintenance.archive_audit_data(
    p_archive_age INTERVAL DEFAULT '2 years',
    p_delete_after_archive BOOLEAN DEFAULT TRUE
) RETURNS TEXT AS $$
DECLARE
    v_archived_count BIGINT := 0;
    v_deleted_count BIGINT := 0;
    v_result TEXT := '';
    v_archive_table TEXT;
    v_operation_id BIGINT;
BEGIN
    -- Log operation start
    INSERT INTO maintenance.maintenance_log (
        operation_type, operation_description, operation_status
    ) VALUES (
        'ARCHIVE_AUDIT_DATA',
        format('Archive audit data older than %s', p_archive_age),
        'STARTED'
    ) RETURNING id INTO v_operation_id;
    
    -- Create archive table if it doesn't exist
    v_archive_table := 'audit.change_log_archive_' || TO_CHAR(CURRENT_DATE, 'YYYY');
    
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %s (LIKE audit.change_log INCLUDING ALL)
    ', v_archive_table);
    
    -- Archive old records
    EXECUTE format('
        WITH archived_records AS (
            DELETE FROM audit.change_log 
            WHERE timestamp < $1
            RETURNING *
        )
        INSERT INTO %s SELECT * FROM archived_records
    ', v_archive_table) 
    USING CURRENT_TIMESTAMP - p_archive_age;
    
    GET DIAGNOSTICS v_archived_count = ROW_COUNT;
    
    v_result := format('Archived %s audit records to %s', v_archived_count, v_archive_table);
    
    -- Update operation log
    UPDATE maintenance.maintenance_log
    SET 
        operation_status = 'COMPLETED',
        records_affected = v_archived_count,
        completed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_build_object('archive_table', v_archive_table, 'records_archived', v_archived_count)
    WHERE id = v_operation_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== AUTOMATED MAINTENANCE SCHEDULING ====================

-- Master maintenance procedure that can be scheduled
CREATE OR REPLACE FUNCTION maintenance.daily_maintenance(
    p_vacuum_analyze BOOLEAN DEFAULT TRUE,
    p_update_stats BOOLEAN DEFAULT TRUE,
    p_health_check BOOLEAN DEFAULT TRUE,
    p_cleanup_temp BOOLEAN DEFAULT TRUE
) RETURNS TEXT AS $$
DECLARE
    v_result TEXT := format('Daily Maintenance Report - %s\n', CURRENT_TIMESTAMP);
    v_maintenance_result TEXT;
BEGIN
    -- Health check
    IF p_health_check THEN
        v_result := v_result || E'\n=== HEALTH CHECK ===\n';
        SELECT maintenance.monitor_database_health() INTO v_maintenance_result;
        v_result := v_result || v_maintenance_result || E'\n';
    END IF;
    
    -- Vacuum and analyze
    IF p_vacuum_analyze THEN
        v_result := v_result || E'\n=== VACUUM ANALYZE ===\n';
        SELECT maintenance.vacuum_analyze_all(FALSE, FALSE) INTO v_maintenance_result;
        v_result := v_result || v_maintenance_result || E'\n';
    END IF;
    
    -- Update statistics
    IF p_update_stats THEN
        v_result := v_result || E'\n=== UPDATE STATISTICS ===\n';
        SELECT maintenance.update_statistics() INTO v_maintenance_result;
        v_result := v_result || v_maintenance_result || E'\n';
    END IF;
    
    -- Cleanup temporary data
    IF p_cleanup_temp THEN
        v_result := v_result || E'\n=== CLEANUP ===\n';
        SELECT security.cleanup_security_data() INTO v_maintenance_result;
        v_result := v_result || 'Security cleanup: ' || v_maintenance_result || E'\n';
        
        SELECT procedures.maintenance_cleanup(FALSE) INTO v_maintenance_result;
        v_result := v_result || 'General cleanup: ' || v_maintenance_result || E'\n';
    END IF;
    
    v_result := v_result || E'\n=== MAINTENANCE COMPLETED ===\n';
    
    -- Log daily maintenance completion
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'daily_maintenance_completed', 1,
        jsonb_build_object(
            'vacuum_analyze', p_vacuum_analyze,
            'update_stats', p_update_stats,
            'health_check', p_health_check,
            'cleanup_temp', p_cleanup_temp
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Weekly maintenance procedure
CREATE OR REPLACE FUNCTION maintenance.weekly_maintenance()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := format('Weekly Maintenance Report - %s\n', CURRENT_TIMESTAMP);
BEGIN
    -- Run daily maintenance
    SELECT maintenance.daily_maintenance(TRUE, TRUE, TRUE, TRUE) INTO v_result;
    
    -- Add weekly-specific tasks
    v_result := v_result || E'\n=== WEEKLY TASKS ===\n';
    
    -- Reindex database
    v_result := v_result || 'Reindexing database...\n';
    SELECT maintenance.reindex_database(NULL, TRUE) INTO v_result;
    
    -- Archive old audit data
    v_result := v_result || E'\nArchiving old audit data...\n';
    SELECT maintenance.archive_audit_data('3 months', TRUE) INTO v_result;
    
    -- Recalculate user points
    v_result := v_result || E'\nRecalculating user points...\n';
    SELECT format('Recalculated points for %s users', procedures.recalculate_user_points()) INTO v_result;
    
    v_result := v_result || E'\n=== WEEKLY MAINTENANCE COMPLETED ===\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== PERFORMANCE MONITORING ====================

-- Function to identify slow queries and performance issues
CREATE OR REPLACE FUNCTION maintenance.analyze_performance()
RETURNS TABLE (
    issue_type TEXT,
    description TEXT,
    severity TEXT,
    recommendation TEXT,
    details JSONB
) AS $$
BEGIN
    -- Check for missing indexes on foreign keys
    RETURN QUERY
    WITH missing_indexes AS (
        SELECT 
            conrelid::regclass as table_name,
            conname as constraint_name,
            pg_get_constraintdef(oid) as constraint_def
        FROM pg_constraint
        WHERE contype = 'f'
        AND NOT EXISTS (
            SELECT 1 FROM pg_index i
            WHERE i.indrelid = conrelid
            AND conkey[1] = ANY(i.indkey::int[])
        )
    )
    SELECT 
        'missing_fk_index'::TEXT,
        format('Missing index on foreign key: %s', constraint_name)::TEXT,
        'MEDIUM'::TEXT,
        format('CREATE INDEX ON %s (%s)', table_name, 
               split_part(split_part(constraint_def, '(', 2), ')', 1))::TEXT,
        jsonb_build_object('table', table_name::TEXT, 'constraint', constraint_name)
    FROM missing_indexes;
    
    -- Check for unused indexes
    RETURN QUERY
    SELECT 
        'unused_index'::TEXT,
        format('Potentially unused index: %s.%s (0 scans)', schemaname, indexname)::TEXT,
        'LOW'::TEXT,
        format('Consider dropping index if confirmed unused: DROP INDEX %s.%s', schemaname, indexname)::TEXT,
        jsonb_build_object('schema', schemaname, 'index', indexname, 'table', tablename)
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0 
    AND schemaname NOT IN ('information_schema', 'pg_catalog')
    AND indexname NOT LIKE '%_pkey';
    
    -- Check for tables that might need partitioning
    RETURN QUERY
    SELECT 
        'large_table'::TEXT,
        format('Large table may benefit from partitioning: %s.%s (%s MB)', 
               schemaname, tablename, 
               ROUND(pg_total_relation_size(schemaname||'.'||tablename)/1024/1024))::TEXT,
        CASE 
            WHEN pg_total_relation_size(schemaname||'.'||tablename) > 1073741824 THEN 'HIGH'
            ELSE 'MEDIUM'
        END::TEXT,
        'Consider partitioning by date or other suitable column'::TEXT,
        jsonb_build_object(
            'schema', schemaname, 
            'table', tablename,
            'size_mb', ROUND(pg_total_relation_size(schemaname||'.'||tablename)/1024/1024),
            'row_count', n_tup_ins + n_tup_upd + n_tup_del
        )
    FROM pg_stat_user_tables
    WHERE pg_total_relation_size(schemaname||'.'||tablename) > 536870912; -- 512MB
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on maintenance functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA maintenance TO makan_app, makan_manager, makan_owner;

-- ==================== MAINTENANCE DASHBOARD VIEW ====================

-- Create maintenance dashboard view
CREATE VIEW maintenance.maintenance_dashboard AS
SELECT 
    'Recent Backups' as category,
    backup_type || ' (' || backup_status || ')' as item,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))/3600 as hours_ago,
    backup_status as status,
    jsonb_build_object(
        'backup_id', id,
        'size_mb', ROUND(backup_size_bytes/1024/1024, 2),
        'duration_min', ROUND(backup_duration_seconds/60.0, 1)
    ) as details
FROM maintenance.backup_log
WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '7 days'

UNION ALL

SELECT 
    'Health Metrics' as category,
    metric_name as item,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - measurement_time))/3600 as hours_ago,
    status,
    jsonb_build_object(
        'value', metric_value,
        'unit', metric_unit,
        'details', details
    ) as details
FROM maintenance.health_metrics
WHERE measurement_time > CURRENT_TIMESTAMP - INTERVAL '24 hours'
AND status != 'OK'

UNION ALL

SELECT 
    'Maintenance Operations' as category,
    operation_type as item,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))/3600 as hours_ago,
    operation_status as status,
    jsonb_build_object(
        'duration_min', ROUND(duration_seconds/60.0, 1),
        'records_affected', records_affected,
        'description', operation_description
    ) as details
FROM maintenance.maintenance_log
WHERE started_at > CURRENT_TIMESTAMP - INTERVAL '7 days'

ORDER BY hours_ago ASC;

COMMIT;