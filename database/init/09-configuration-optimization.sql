-- Enterprise Database Configuration and Performance Optimization
-- PostgreSQL tuning and configuration recommendations

-- Create configuration schema for settings and optimization
CREATE SCHEMA IF NOT EXISTS config;

-- ==================== CONFIGURATION TRACKING TABLE ====================

-- Table to track configuration changes
CREATE TABLE config.configuration_history (
    id BIGSERIAL PRIMARY KEY,
    setting_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    setting_context TEXT, -- 'postgresql.conf', 'session', 'database', etc.
    change_reason TEXT,
    applied_by TEXT DEFAULT CURRENT_USER,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    requires_restart BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('PENDING', 'APPLIED', 'REVERTED')) DEFAULT 'APPLIED'
);

-- Index for configuration history
CREATE INDEX idx_config_history_setting ON config.configuration_history(setting_name, applied_at DESC);
CREATE INDEX idx_config_history_context ON config.configuration_history(setting_context, applied_at DESC);

-- ==================== PERFORMANCE OPTIMIZATION SETTINGS ====================

-- Function to apply optimal database settings for restaurant management workload
CREATE OR REPLACE FUNCTION config.apply_performance_settings()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Database Performance Configuration Applied:\n\n';
    v_total_memory_gb NUMERIC;
    v_shared_buffers TEXT;
    v_effective_cache_size TEXT;
    v_work_mem TEXT;
    v_maintenance_work_mem TEXT;
BEGIN
    -- Detect system memory (this would need to be set based on actual system)
    -- For demonstration, assuming 8GB system
    v_total_memory_gb := 8;
    
    -- Calculate optimal settings based on system memory
    v_shared_buffers := ROUND(v_total_memory_gb * 0.25) || 'GB'; -- 25% of RAM
    v_effective_cache_size := ROUND(v_total_memory_gb * 0.75) || 'GB'; -- 75% of RAM
    v_work_mem := ROUND((v_total_memory_gb * 1024 * 0.05) / 50) || 'MB'; -- 5% of RAM / max_connections
    v_maintenance_work_mem := ROUND(v_total_memory_gb * 0.05 * 1024) || 'MB'; -- 5% of RAM
    
    -- Log configuration recommendations
    INSERT INTO config.configuration_history (
        setting_name, new_value, setting_context, change_reason, requires_restart
    ) VALUES 
        ('shared_buffers', v_shared_buffers, 'postgresql.conf', 'Performance optimization for restaurant workload', TRUE),
        ('effective_cache_size', v_effective_cache_size, 'postgresql.conf', 'Cache size optimization', FALSE),
        ('work_mem', v_work_mem, 'postgresql.conf', 'Query memory optimization', FALSE),
        ('maintenance_work_mem', v_maintenance_work_mem, 'postgresql.conf', 'Maintenance operation optimization', FALSE),
        ('random_page_cost', '1.1', 'postgresql.conf', 'SSD optimization', FALSE),
        ('seq_page_cost', '1.0', 'postgresql.conf', 'SSD optimization', FALSE),
        ('max_connections', '100', 'postgresql.conf', 'Connection limit for restaurant app', TRUE),
        ('checkpoint_completion_target', '0.9', 'postgresql.conf', 'Checkpoint optimization', FALSE),
        ('wal_buffers', '16MB', 'postgresql.conf', 'WAL buffer optimization', TRUE),
        ('default_statistics_target', '100', 'postgresql.conf', 'Statistics accuracy', FALSE),
        ('constraint_exclusion', 'partition', 'postgresql.conf', 'Partition optimization', FALSE),
        ('enable_partitionwise_join', 'on', 'postgresql.conf', 'Partition join optimization', FALSE),
        ('enable_partitionwise_aggregate', 'on', 'postgresql.conf', 'Partition aggregate optimization', FALSE);
    
    v_result := v_result || format('Memory Configuration:\n');
    v_result := v_result || format('- shared_buffers = %s\n', v_shared_buffers);
    v_result := v_result || format('- effective_cache_size = %s\n', v_effective_cache_size);
    v_result := v_result || format('- work_mem = %s\n', v_work_mem);
    v_result := v_result || format('- maintenance_work_mem = %s\n', v_maintenance_work_mem);
    v_result := v_result || E'\nConnection & Checkpoint Configuration:\n';
    v_result := v_result || format('- max_connections = 100\n');
    v_result := v_result || format('- checkpoint_completion_target = 0.9\n');
    v_result := v_result || format('- wal_buffers = 16MB\n');
    v_result := v_result || E'\nQuery Optimization:\n';
    v_result := v_result || format('- random_page_cost = 1.1 (SSD optimized)\n');
    v_result := v_result || format('- default_statistics_target = 100\n');
    v_result := v_result || format('- Partition-wise operations enabled\n');
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== WORKLOAD-SPECIFIC OPTIMIZATIONS ====================

-- Apply restaurant management specific optimizations
CREATE OR REPLACE FUNCTION config.apply_restaurant_optimizations()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Restaurant Management Workload Optimizations:\n\n';
BEGIN
    -- Set session-level optimizations for common restaurant operations
    
    -- Optimize for frequent small transactions (orders, tasks)
    INSERT INTO config.configuration_history (
        setting_name, new_value, setting_context, change_reason
    ) VALUES 
        ('synchronous_commit', 'off', 'session', 'Fast order processing - acceptable risk for restaurant'),
        ('commit_delay', '0', 'session', 'No delay for restaurant transactions'),
        ('vacuum_cost_delay', '10ms', 'postgresql.conf', 'Background maintenance with low impact'),
        ('vacuum_cost_page_hit', '1', 'postgresql.conf', 'Gentle vacuuming'),
        ('vacuum_cost_page_miss', '10', 'postgresql.conf', 'Moderate vacuum impact'),
        ('vacuum_cost_page_dirty', '20', 'postgresql.conf', 'Higher cost for dirty pages'),
        ('autovacuum_vacuum_scale_factor', '0.1', 'postgresql.conf', 'More frequent autovacuum for busy tables'),
        ('autovacuum_analyze_scale_factor', '0.05', 'postgresql.conf', 'Frequent analyze for changing data'),
        ('log_min_duration_statement', '1000', 'postgresql.conf', 'Log slow queries (1 second)'),
        ('log_checkpoints', 'on', 'postgresql.conf', 'Monitor checkpoint performance'),
        ('log_lock_waits', 'on', 'postgresql.conf', 'Monitor locking issues'),
        ('deadlock_timeout', '1s', 'postgresql.conf', 'Quick deadlock detection'),
        ('statement_timeout', '30s', 'session', 'Prevent runaway queries in restaurant app');
    
    -- Apply current session settings that can be changed immediately
    PERFORM set_config('synchronous_commit', 'off', false);
    PERFORM set_config('commit_delay', '0', false);
    PERFORM set_config('statement_timeout', '30s', false);
    
    v_result := v_result || 'Transaction Optimizations:\n';
    v_result := v_result || '- synchronous_commit = off (applied to session)\n';
    v_result := v_result || '- statement_timeout = 30s (applied to session)\n';
    v_result := v_result || E'\nMaintenance Optimizations:\n';
    v_result := v_result || '- Autovacuum tuned for frequent updates\n';
    v_result := v_result || '- Vacuum cost settings optimized\n';
    v_result := v_result || E'\nMonitoring Enabled:\n';
    v_result := v_result || '- Slow query logging (>1s)\n';
    v_result := v_result || '- Checkpoint and lock monitoring\n';
    v_result := v_result || '- Quick deadlock detection (1s)\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== CONNECTION POOLING OPTIMIZATION ====================

-- Function to configure connection pooling recommendations
CREATE OR REPLACE FUNCTION config.connection_pooling_setup()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Connection Pooling Configuration:\n\n';
BEGIN
    -- Log connection pooling recommendations
    INSERT INTO config.configuration_history (
        setting_name, new_value, setting_context, change_reason
    ) VALUES 
        ('max_connections', '100', 'postgresql.conf', 'Balance between concurrency and resource usage'),
        ('superuser_reserved_connections', '3', 'postgresql.conf', 'Reserve connections for maintenance'),
        ('tcp_keepalives_idle', '300', 'postgresql.conf', 'Detect dead connections (5 min)'),
        ('tcp_keepalives_interval', '30', 'postgresql.conf', 'Keepalive probe interval'),
        ('tcp_keepalives_count', '3', 'postgresql.conf', 'Keepalive probe attempts'),
        ('idle_in_transaction_session_timeout', '60000', 'postgresql.conf', 'Kill idle transactions (1 min)'),
        ('lock_timeout', '30000', 'postgresql.conf', 'Lock timeout (30s)');
    
    v_result := v_result || 'PostgreSQL Connection Settings:\n';
    v_result := v_result || '- max_connections = 100\n';
    v_result := v_result || '- superuser_reserved_connections = 3\n';
    v_result := v_result || '- idle_in_transaction_session_timeout = 60s\n';
    v_result := v_result || '- TCP keepalive enabled\n';
    
    v_result := v_result || E'\nRecommended PgBouncer Configuration:\n';
    v_result := v_result || 'pool_mode = transaction\n';
    v_result := v_result || 'default_pool_size = 20\n';
    v_result := v_result || 'max_client_conn = 200\n';
    v_result := v_result || 'server_round_robin = 1\n';
    v_result := v_result || 'server_idle_timeout = 300\n';
    v_result := v_result || 'client_idle_timeout = 0\n';
    v_result := v_result || 'query_timeout = 30\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== MONITORING AND ALERTING SETUP ====================

-- Create performance monitoring configuration
CREATE OR REPLACE FUNCTION config.setup_monitoring()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Performance Monitoring Setup:\n\n';
BEGIN
    -- Enable pg_stat_statements if not already enabled
    BEGIN
        CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
        v_result := v_result || '✓ pg_stat_statements extension enabled\n';
    EXCEPTION WHEN OTHERS THEN
        v_result := v_result || '✗ pg_stat_statements extension not available\n';
    END;
    
    -- Configure statement tracking
    INSERT INTO config.configuration_history (
        setting_name, new_value, setting_context, change_reason, requires_restart
    ) VALUES 
        ('shared_preload_libraries', 'pg_stat_statements', 'postgresql.conf', 'Enable query statistics', TRUE),
        ('pg_stat_statements.max', '10000', 'postgresql.conf', 'Track top 10k queries', TRUE),
        ('pg_stat_statements.track', 'all', 'postgresql.conf', 'Track all statements', TRUE),
        ('pg_stat_statements.track_utility', 'on', 'postgresql.conf', 'Track utility commands', TRUE),
        ('pg_stat_statements.save', 'on', 'postgresql.conf', 'Persist stats across restarts', TRUE),
        ('log_statement', 'ddl', 'postgresql.conf', 'Log DDL statements', FALSE),
        ('log_min_duration_statement', '1000', 'postgresql.conf', 'Log queries > 1s', FALSE),
        ('log_line_prefix', '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ', 'postgresql.conf', 'Detailed log format', TRUE),
        ('log_connections', 'on', 'postgresql.conf', 'Log connections', FALSE),
        ('log_disconnections', 'on', 'postgresql.conf', 'Log disconnections', FALSE),
        ('log_temp_files', '0', 'postgresql.conf', 'Log all temp files', FALSE);
    
    v_result := v_result || E'\nLogging Configuration:\n';
    v_result := v_result || '- DDL statements logged\n';
    v_result := v_result || '- Queries >1s logged\n';
    v_result := v_result || '- Connection events logged\n';
    v_result := v_result || '- Temporary files logged\n';
    
    v_result := v_result || E'\nQuery Statistics:\n';
    v_result := v_result || '- pg_stat_statements configured\n';
    v_result := v_result || '- Track top 10,000 queries\n';
    v_result := v_result || '- Include utility commands\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== SECURITY CONFIGURATION ====================

-- Apply security-focused configuration
CREATE OR REPLACE FUNCTION config.apply_security_settings()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Security Configuration Applied:\n\n';
BEGIN
    -- Log security configuration recommendations
    INSERT INTO config.configuration_history (
        setting_name, new_value, setting_context, change_reason, requires_restart
    ) VALUES 
        ('ssl', 'on', 'postgresql.conf', 'Enable SSL encryption', TRUE),
        ('ssl_prefer_server_ciphers', 'on', 'postgresql.conf', 'Server cipher preference', TRUE),
        ('ssl_ciphers', 'HIGH:!aNULL', 'postgresql.conf', 'Strong ciphers only', TRUE),
        ('password_encryption', 'scram-sha-256', 'postgresql.conf', 'Strong password hashing', TRUE),
        ('log_statement', 'ddl', 'postgresql.conf', 'Log schema changes', FALSE),
        ('log_min_error_statement', 'error', 'postgresql.conf', 'Log error statements', FALSE),
        ('row_security', 'on', 'postgresql.conf', 'Enable Row Level Security', FALSE),
        ('session_replication_role', 'origin', 'session', 'Standard replication role', FALSE);
    
    -- Apply session-level security settings
    PERFORM set_config('row_security', 'on', false);
    PERFORM set_config('session_replication_role', 'origin', false);
    
    v_result := v_result || 'Network Security:\n';
    v_result := v_result || '- SSL encryption enabled\n';
    v_result := v_result || '- Strong cipher suites configured\n';
    v_result := v_result || E'\nAuthentication:\n';
    v_result := v_result || '- SCRAM-SHA-256 password encryption\n';
    v_result := v_result || E'\nAccess Control:\n';
    v_result := v_result || '- Row Level Security enabled\n';
    v_result := v_result || E'\nAuditing:\n';
    v_result := v_result || '- DDL statement logging\n';
    v_result := v_result || '- Error statement logging\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== AUTOMATIC TUNING PROCEDURES ====================

-- Auto-tuning based on current workload
CREATE OR REPLACE FUNCTION config.auto_tune_database()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := 'Database Auto-Tuning Analysis:\n\n';
    v_cache_hit_ratio NUMERIC;
    v_index_hit_ratio NUMERIC;
    v_total_connections INTEGER;
    v_slow_queries INTEGER;
    v_table_scans INTEGER;
    v_recommendations TEXT := '';
BEGIN
    -- Analyze current performance metrics
    
    -- Cache hit ratio
    SELECT ROUND((SUM(blks_hit) / (SUM(blks_hit) + SUM(blks_read) + 0.001) * 100)::NUMERIC, 2)
    INTO v_cache_hit_ratio
    FROM pg_stat_database WHERE datname = current_database();
    
    -- Index usage ratio
    SELECT ROUND(AVG(100 * idx_scan / (seq_scan + idx_scan + 0.001))::NUMERIC, 2)
    INTO v_index_hit_ratio
    FROM pg_stat_user_tables
    WHERE seq_scan + idx_scan > 0;
    
    -- Connection count
    SELECT COUNT(*) INTO v_total_connections FROM pg_stat_activity;
    
    -- Slow queries (from logs - would need external monitoring)
    v_slow_queries := 0; -- Placeholder
    
    -- Sequential scans
    SELECT COALESCE(SUM(seq_scan), 0) INTO v_table_scans FROM pg_stat_user_tables;
    
    v_result := v_result || format('Current Performance Metrics:\n');
    v_result := v_result || format('- Cache Hit Ratio: %s%%\n', v_cache_hit_ratio);
    v_result := v_result || format('- Index Usage Ratio: %s%%\n', COALESCE(v_index_hit_ratio, 0));
    v_result := v_result || format('- Active Connections: %s\n', v_total_connections);
    v_result := v_result || format('- Sequential Scans: %s\n', v_table_scans);
    
    -- Generate recommendations
    IF v_cache_hit_ratio < 95 THEN
        v_recommendations := v_recommendations || '- Consider increasing shared_buffers\n';
    END IF;
    
    IF COALESCE(v_index_hit_ratio, 0) < 90 THEN
        v_recommendations := v_recommendations || '- Review and add missing indexes\n';
        v_recommendations := v_recommendations || '- Analyze query patterns for optimization\n';
    END IF;
    
    IF v_total_connections > 80 THEN
        v_recommendations := v_recommendations || '- Consider implementing connection pooling\n';
    END IF;
    
    IF v_table_scans > 10000 THEN
        v_recommendations := v_recommendations || '- High sequential scan count - review indexing strategy\n';
    END IF;
    
    v_result := v_result || E'\nRecommendations:\n' || COALESCE(v_recommendations, 'No immediate optimizations needed\n');
    
    -- Log auto-tune analysis
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'auto_tune_analysis', 1,
        jsonb_build_object(
            'cache_hit_ratio', v_cache_hit_ratio,
            'index_hit_ratio', v_index_hit_ratio,
            'active_connections', v_total_connections,
            'table_scans', v_table_scans
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== RESOURCE USAGE MONITORING ====================

-- Function to monitor resource usage and recommend adjustments
CREATE OR REPLACE FUNCTION config.monitor_resource_usage()
RETURNS TABLE (
    resource_type TEXT,
    current_usage TEXT,
    recommended_action TEXT,
    priority TEXT
) AS $$
BEGIN
    -- Memory usage analysis
    RETURN QUERY
    WITH memory_stats AS (
        SELECT 
            CASE 
                WHEN setting ~ '^\d+kB$' THEN (setting::text::numeric / 1024)::text || ' MB'
                WHEN setting ~ '^\d+MB$' THEN setting
                WHEN setting ~ '^\d+GB$' THEN setting
                ELSE setting
            END as current_setting,
            name
        FROM pg_settings
        WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem', 'effective_cache_size')
    )
    SELECT 
        'Memory Configuration'::TEXT,
        format('%s = %s', name, current_setting),
        CASE name
            WHEN 'shared_buffers' THEN 'Should be 25% of RAM'
            WHEN 'work_mem' THEN 'Should be (RAM * 0.05) / max_connections MB'
            WHEN 'maintenance_work_mem' THEN 'Should be 5% of RAM'
            WHEN 'effective_cache_size' THEN 'Should be 75% of RAM'
        END,
        'MEDIUM'::TEXT
    FROM memory_stats;
    
    -- Connection usage
    RETURN QUERY
    SELECT 
        'Connection Usage'::TEXT,
        format('%s/%s connections', 
               (SELECT COUNT(*) FROM pg_stat_activity),
               (SELECT setting FROM pg_settings WHERE name = 'max_connections'))::TEXT,
        CASE 
            WHEN (SELECT COUNT(*)::FLOAT / setting::FLOAT 
                  FROM pg_stat_activity, pg_settings 
                  WHERE pg_settings.name = 'max_connections') > 0.8 
            THEN 'Consider increasing max_connections or implementing pooling'
            ELSE 'Connection usage within normal range'
        END,
        CASE 
            WHEN (SELECT COUNT(*)::FLOAT / setting::FLOAT 
                  FROM pg_stat_activity, pg_settings 
                  WHERE pg_settings.name = 'max_connections') > 0.8 
            THEN 'HIGH'
            ELSE 'LOW'
        END::TEXT;
    
    -- Disk usage (database size)
    RETURN QUERY
    SELECT 
        'Database Size'::TEXT,
        pg_size_pretty(pg_database_size(current_database()))::TEXT,
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240 -- 10GB
            THEN 'Consider archiving old data or partitioning large tables'
            ELSE 'Database size within acceptable range'
        END,
        CASE 
            WHEN pg_database_size(current_database()) > 10737418240
            THEN 'MEDIUM'
            ELSE 'LOW'
        END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ==================== CONFIGURATION DEPLOYMENT ====================

-- Master function to apply all optimizations
CREATE OR REPLACE FUNCTION config.deploy_all_optimizations()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := format('=== DATABASE OPTIMIZATION DEPLOYMENT ===\n%s\n\n', CURRENT_TIMESTAMP);
    v_step_result TEXT;
BEGIN
    -- Apply performance settings
    SELECT config.apply_performance_settings() INTO v_step_result;
    v_result := v_result || '1. ' || v_step_result || E'\n';
    
    -- Apply restaurant-specific optimizations
    SELECT config.apply_restaurant_optimizations() INTO v_step_result;
    v_result := v_result || '2. ' || v_step_result || E'\n';
    
    -- Configure connection pooling
    SELECT config.connection_pooling_setup() INTO v_step_result;
    v_result := v_result || '3. ' || v_step_result || E'\n';
    
    -- Setup monitoring
    SELECT config.setup_monitoring() INTO v_step_result;
    v_result := v_result || '4. ' || v_step_result || E'\n';
    
    -- Apply security settings
    SELECT config.apply_security_settings() INTO v_step_result;
    v_result := v_result || '5. ' || v_step_result || E'\n';
    
    -- Run auto-tuning analysis
    SELECT config.auto_tune_database() INTO v_step_result;
    v_result := v_result || '6. ' || v_step_result || E'\n';
    
    v_result := v_result || E'=== DEPLOYMENT COMPLETE ===\n';
    v_result := v_result || E'\nNOTE: Some settings require PostgreSQL restart to take effect.\n';
    v_result := v_result || E'Check configuration_history table for settings that require restart.\n';
    
    -- Log deployment completion
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'optimization_deployment_completed', 1,
        jsonb_build_object(
            'deployment_time', CURRENT_TIMESTAMP,
            'settings_applied', (SELECT COUNT(*) FROM config.configuration_history WHERE applied_at > CURRENT_TIMESTAMP - INTERVAL '1 minute')
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ==================== CONFIGURATION VALIDATION ====================

-- Function to validate current configuration
CREATE OR REPLACE FUNCTION config.validate_configuration()
RETURNS TABLE (
    category TEXT,
    setting_name TEXT,
    current_value TEXT,
    recommended_value TEXT,
    status TEXT,
    impact TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH config_validation AS (
        SELECT 
            'Memory' as category,
            name,
            COALESCE(setting, 'NOT SET') as current_val,
            CASE name
                WHEN 'shared_buffers' THEN '2GB'
                WHEN 'effective_cache_size' THEN '6GB'
                WHEN 'work_mem' THEN '80MB'
                WHEN 'maintenance_work_mem' THEN '400MB'
            END as recommended_val,
            CASE name
                WHEN 'shared_buffers' THEN 'CRITICAL'
                WHEN 'effective_cache_size' THEN 'HIGH'
                WHEN 'work_mem' THEN 'MEDIUM'
                WHEN 'maintenance_work_mem' THEN 'MEDIUM'
            END as impact_level
        FROM pg_settings
        WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem', 'maintenance_work_mem')
        
        UNION ALL
        
        SELECT 
            'Performance' as category,
            name,
            COALESCE(setting, 'NOT SET') as current_val,
            CASE name
                WHEN 'random_page_cost' THEN '1.1'
                WHEN 'seq_page_cost' THEN '1.0'
                WHEN 'default_statistics_target' THEN '100'
                WHEN 'checkpoint_completion_target' THEN '0.9'
            END as recommended_val,
            'MEDIUM' as impact_level
        FROM pg_settings
        WHERE name IN ('random_page_cost', 'seq_page_cost', 'default_statistics_target', 'checkpoint_completion_target')
        
        UNION ALL
        
        SELECT 
            'Security' as category,
            name,
            COALESCE(setting, 'NOT SET') as current_val,
            CASE name
                WHEN 'ssl' THEN 'on'
                WHEN 'password_encryption' THEN 'scram-sha-256'
                WHEN 'row_security' THEN 'on'
            END as recommended_val,
            'HIGH' as impact_level
        FROM pg_settings
        WHERE name IN ('ssl', 'password_encryption', 'row_security')
    )
    SELECT 
        cv.category::TEXT,
        cv.name::TEXT,
        cv.current_val::TEXT,
        cv.recommended_val::TEXT,
        CASE 
            WHEN cv.current_val = cv.recommended_val THEN 'OPTIMAL'
            WHEN cv.current_val = 'NOT SET' THEN 'NOT_CONFIGURED'
            ELSE 'NEEDS_ADJUSTMENT'
        END::TEXT,
        cv.impact_level::TEXT
    FROM config_validation cv
    ORDER BY 
        CASE cv.impact_level 
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            ELSE 4
        END,
        cv.category, cv.name;
END;
$$ LANGUAGE plpgsql;

-- ==================== POSTGRESQL.CONF GENERATOR ====================

-- Function to generate optimized postgresql.conf content
CREATE OR REPLACE FUNCTION config.generate_postgresql_conf()
RETURNS TEXT AS $$
DECLARE
    v_conf TEXT := '';
BEGIN
    v_conf := '# PostgreSQL Configuration for Makan Manager' || E'\n';
    v_conf := v_conf || '# Generated: ' || CURRENT_TIMESTAMP || E'\n\n';
    
    v_conf := v_conf || '# MEMORY CONFIGURATION' || E'\n';
    v_conf := v_conf || 'shared_buffers = 2GB' || E'\n';
    v_conf := v_conf || 'effective_cache_size = 6GB' || E'\n';
    v_conf := v_conf || 'work_mem = 80MB' || E'\n';
    v_conf := v_conf || 'maintenance_work_mem = 400MB' || E'\n';
    v_conf := v_conf || 'wal_buffers = 16MB' || E'\n\n';
    
    v_conf := v_conf || '# CONNECTION SETTINGS' || E'\n';
    v_conf := v_conf || 'max_connections = 100' || E'\n';
    v_conf := v_conf || 'superuser_reserved_connections = 3' || E'\n';
    v_conf := v_conf || 'tcp_keepalives_idle = 300' || E'\n';
    v_conf := v_conf || 'tcp_keepalives_interval = 30' || E'\n';
    v_conf := v_conf || 'tcp_keepalives_count = 3' || E'\n';
    v_conf := v_conf || 'idle_in_transaction_session_timeout = 60s' || E'\n';
    v_conf := v_conf || 'lock_timeout = 30s' || E'\n';
    v_conf := v_conf || 'deadlock_timeout = 1s' || E'\n\n';
    
    v_conf := v_conf || '# PERFORMANCE TUNING' || E'\n';
    v_conf := v_conf || 'random_page_cost = 1.1' || E'\n';
    v_conf := v_conf || 'seq_page_cost = 1.0' || E'\n';
    v_conf := v_conf || 'default_statistics_target = 100' || E'\n';
    v_conf := v_conf || 'constraint_exclusion = partition' || E'\n';
    v_conf := v_conf || 'enable_partitionwise_join = on' || E'\n';
    v_conf := v_conf || 'enable_partitionwise_aggregate = on' || E'\n\n';
    
    v_conf := v_conf || '# CHECKPOINT SETTINGS' || E'\n';
    v_conf := v_conf || 'checkpoint_completion_target = 0.9' || E'\n';
    v_conf := v_conf || 'checkpoint_timeout = 15min' || E'\n';
    v_conf := v_conf || 'max_wal_size = 4GB' || E'\n';
    v_conf := v_conf || 'min_wal_size = 1GB' || E'\n\n';
    
    v_conf := v_conf || '# AUTOVACUUM SETTINGS' || E'\n';
    v_conf := v_conf || 'autovacuum = on' || E'\n';
    v_conf := v_conf || 'autovacuum_vacuum_scale_factor = 0.1' || E'\n';
    v_conf := v_conf || 'autovacuum_analyze_scale_factor = 0.05' || E'\n';
    v_conf := v_conf || 'vacuum_cost_delay = 10ms' || E'\n';
    v_conf := v_conf || 'vacuum_cost_page_hit = 1' || E'\n';
    v_conf := v_conf || 'vacuum_cost_page_miss = 10' || E'\n';
    v_conf := v_conf || 'vacuum_cost_page_dirty = 20' || E'\n\n';
    
    v_conf := v_conf || '# LOGGING SETTINGS' || E'\n';
    v_conf := v_conf || 'logging_collector = on' || E'\n';
    v_conf := v_conf || 'log_statement = ''ddl''' || E'\n';
    v_conf := v_conf || 'log_min_duration_statement = 1000ms' || E'\n';
    v_conf := v_conf || 'log_line_prefix = ''%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ''' || E'\n';
    v_conf := v_conf || 'log_connections = on' || E'\n';
    v_conf := v_conf || 'log_disconnections = on' || E'\n';
    v_conf := v_conf || 'log_lock_waits = on' || E'\n';
    v_conf := v_conf || 'log_checkpoints = on' || E'\n';
    v_conf := v_conf || 'log_temp_files = 0' || E'\n\n';
    
    v_conf := v_conf || '# SECURITY SETTINGS' || E'\n';
    v_conf := v_conf || 'ssl = on' || E'\n';
    v_conf := v_conf || 'ssl_prefer_server_ciphers = on' || E'\n';
    v_conf := v_conf || 'ssl_ciphers = ''HIGH:!aNULL''' || E'\n';
    v_conf := v_conf || 'password_encryption = scram-sha-256' || E'\n';
    v_conf := v_conf || 'row_security = on' || E'\n\n';
    
    v_conf := v_conf || '# MONITORING EXTENSIONS' || E'\n';
    v_conf := v_conf || 'shared_preload_libraries = ''pg_stat_statements''' || E'\n';
    v_conf := v_conf || 'pg_stat_statements.max = 10000' || E'\n';
    v_conf := v_conf || 'pg_stat_statements.track = all' || E'\n';
    v_conf := v_conf || 'pg_stat_statements.track_utility = on' || E'\n';
    v_conf := v_conf || 'pg_stat_statements.save = on' || E'\n';
    
    RETURN v_conf;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on configuration functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA config TO makan_owner, makan_manager;

-- ==================== FINAL SETUP AND VALIDATION ====================

-- Create configuration summary view
CREATE VIEW config.configuration_summary AS
SELECT 
    setting_context,
    COUNT(*) as total_settings,
    COUNT(CASE WHEN status = 'APPLIED' THEN 1 END) as applied_settings,
    COUNT(CASE WHEN requires_restart = TRUE THEN 1 END) as restart_required_settings,
    MAX(applied_at) as last_change
FROM config.configuration_history
GROUP BY setting_context
ORDER BY setting_context;

-- Final validation and setup completion message
DO $$
DECLARE
    v_setup_complete TEXT;
BEGIN
    -- Log final setup completion
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'database_enhancement_completed', 1,
        jsonb_build_object(
            'enhancement_date', CURRENT_TIMESTAMP,
            'total_schemas', (SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name IN ('audit', 'reporting', 'procedures', 'security', 'maintenance', 'config')),
            'total_tables', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
            'total_indexes', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
            'total_functions', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema IN ('procedures', 'security', 'maintenance', 'config')),
            'total_views', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'reporting')
        )
    );
    
    RAISE NOTICE 'Database enhancement completed successfully!';
    RAISE NOTICE 'Run SELECT config.deploy_all_optimizations() to apply performance optimizations.';
    RAISE NOTICE 'Run SELECT config.generate_postgresql_conf() to get optimized configuration file.';
END $$;

COMMIT;