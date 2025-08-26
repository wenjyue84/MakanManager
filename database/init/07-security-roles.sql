-- Enterprise Security Framework and Role-Based Access Control
-- Comprehensive security implementation with granular permissions

-- Create security schema for security-related objects
CREATE SCHEMA IF NOT EXISTS security;

-- ==================== DATABASE ROLES AND PERMISSIONS ====================

-- Create application-specific database roles
DO $$
BEGIN
    -- Owner role (full access)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_owner') THEN
        CREATE ROLE makan_owner;
    END IF;
    
    -- Manager role (management functions)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_manager') THEN
        CREATE ROLE makan_manager;
    END IF;
    
    -- Staff role (basic operations)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_staff') THEN
        CREATE ROLE makan_staff;
    END IF;
    
    -- Kitchen staff role (kitchen-specific functions)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_kitchen') THEN
        CREATE ROLE makan_kitchen;
    END IF;
    
    -- Front desk role (front desk operations)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_frontdesk') THEN
        CREATE ROLE makan_frontdesk;
    END IF;
    
    -- Auditor role (read-only audit access)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_auditor') THEN
        CREATE ROLE makan_auditor;
    END IF;
    
    -- Application role (general application access)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_app') THEN
        CREATE ROLE makan_app;
    END IF;
    
    -- Read-only reporting role
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'makan_reporting') THEN
        CREATE ROLE makan_reporting;
    END IF;
END $$;

-- ==================== BASE PERMISSIONS BY ROLE ====================

-- Owner permissions (full access)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO makan_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO makan_owner;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO makan_owner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO makan_owner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA reporting TO makan_owner;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA procedures TO makan_owner;
GRANT ALL PRIVILEGES ON SCHEMA audit, reporting, procedures, security TO makan_owner;

-- Manager permissions (management operations)
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO makan_manager;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO makan_manager;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO makan_manager;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA procedures TO makan_manager;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO makan_manager;

-- Staff permissions (limited operations)
GRANT SELECT, INSERT ON tasks, staff_meals, disposals, issues, notifications TO makan_staff;
GRANT UPDATE ON tasks, staff_meals, disposals, issues, notifications TO makan_staff;
GRANT SELECT ON users, recipes, suppliers, online_orders TO makan_staff;
GRANT UPDATE (status, completed_at, proof_data) ON tasks TO makan_staff;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO makan_staff;

-- Kitchen staff permissions
GRANT SELECT, INSERT, UPDATE ON recipes, disposals TO makan_kitchen;
GRANT SELECT ON users, tasks, purchases, suppliers TO makan_kitchen;
GRANT INSERT ON issues TO makan_kitchen;

-- Front desk permissions
GRANT SELECT, INSERT, UPDATE ON online_orders, cash_reconciliations TO makan_frontdesk;
GRANT SELECT ON users, tasks, issues TO makan_frontdesk;
GRANT INSERT ON issues TO makan_frontdesk;

-- Auditor permissions (read-only audit access)
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO makan_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO makan_auditor;
GRANT SELECT ON users, tasks, disciplinary_actions, salary_records TO makan_auditor;

-- Application permissions (general application access)
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO makan_app;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO makan_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA procedures TO makan_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO makan_app;

-- Reporting permissions (read-only)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO makan_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO makan_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO makan_reporting;

-- ==================== ROW LEVEL SECURITY POLICIES ====================

-- Function to get current application user ID
CREATE OR REPLACE FUNCTION security.current_app_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN nullif(current_setting('app.current_user_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current application user roles
CREATE OR REPLACE FUNCTION security.current_app_user_roles()
RETURNS TEXT[] AS $$
BEGIN
    RETURN string_to_array(current_setting('app.current_user_roles', true), ',');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION security.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN required_role = ANY(security.current_app_user_roles());
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== USER TABLE RLS POLICIES ====================

-- Users can see their own record, managers can see all
CREATE POLICY user_self_access ON users
    FOR ALL
    TO makan_app, makan_staff, makan_manager, makan_owner
    USING (
        id = security.current_app_user_id() OR 
        security.has_role('manager') OR 
        security.has_role('owner')
    );

-- Managers can update user records, users can update limited fields of their own
CREATE POLICY user_update_policy ON users
    FOR UPDATE
    TO makan_app, makan_staff, makan_manager, makan_owner
    USING (
        -- Can update own limited fields
        (id = security.current_app_user_id() AND 
         current_setting('app.update_fields', true) IN ('avatar', 'photo', 'phone', 'emergency_contact'))
        OR
        -- Managers can update any user
        (security.has_role('manager') OR security.has_role('owner'))
    );

-- ==================== TASKS TABLE RLS POLICIES ====================

-- Users can see tasks assigned to them or created by them, plus station-based visibility
CREATE POLICY task_visibility_policy ON tasks
    FOR SELECT
    TO makan_app, makan_staff, makan_manager, makan_owner
    USING (
        assignee_id = security.current_app_user_id() OR
        assigner_id = security.current_app_user_id() OR
        security.has_role('manager') OR
        security.has_role('owner') OR
        -- Station-based visibility for coordination
        (station IN (
            SELECT u.station FROM users u WHERE u.id = security.current_app_user_id()
        ) AND security.has_role('staff'))
    );

-- Task creation policy
CREATE POLICY task_creation_policy ON tasks
    FOR INSERT
    TO makan_app, makan_manager, makan_owner
    WITH CHECK (
        assigner_id = security.current_app_user_id() AND (
            security.has_role('manager') OR 
            security.has_role('head-of-kitchen') OR 
            security.has_role('front-desk-manager') OR
            security.has_role('owner')
        )
    );

-- Task update policy
CREATE POLICY task_update_policy ON tasks
    FOR UPDATE
    TO makan_app, makan_staff, makan_manager, makan_owner
    USING (
        -- Assignees can update status and completion fields
        (assignee_id = security.current_app_user_id() AND 
         current_setting('app.update_fields', true) IN ('status', 'completed_at', 'proof_data'))
        OR
        -- Assigners and managers can update most fields
        (assigner_id = security.current_app_user_id() OR 
         security.has_role('manager') OR 
         security.has_role('owner'))
    );

-- ==================== DISCIPLINARY ACTIONS RLS POLICIES ====================

-- Managers and owners can see all, affected users can see their own
CREATE POLICY disciplinary_visibility_policy ON disciplinary_actions
    FOR SELECT
    TO makan_app, makan_manager, makan_owner, makan_auditor
    USING (
        target_user_id = security.current_app_user_id() OR
        created_by_id = security.current_app_user_id() OR
        security.has_role('manager') OR
        security.has_role('owner') OR
        security.has_role('auditor')
    );

-- Only managers can create disciplinary actions
CREATE POLICY disciplinary_creation_policy ON disciplinary_actions
    FOR INSERT
    TO makan_app, makan_manager, makan_owner
    WITH CHECK (
        created_by_id = security.current_app_user_id() AND (
            security.has_role('manager') OR 
            security.has_role('head-of-kitchen') OR 
            security.has_role('front-desk-manager') OR
            security.has_role('owner')
        )
    );

-- ==================== SALARY RECORDS RLS POLICIES ====================

-- Users can see their own salary records, managers can see all
CREATE POLICY salary_visibility_policy ON salary_records
    FOR SELECT
    TO makan_app, makan_manager, makan_owner, makan_auditor
    USING (
        user_id = security.current_app_user_id() OR
        security.has_role('manager') OR
        security.has_role('owner') OR
        security.has_role('auditor')
    );

-- Only managers can create/update salary records
CREATE POLICY salary_management_policy ON salary_records
    FOR ALL
    TO makan_app, makan_manager, makan_owner
    USING (
        security.has_role('manager') OR security.has_role('owner')
    );

-- ==================== CASH RECONCILIATION RLS POLICIES ====================

-- Users can see their own reconciliations, managers can see all
CREATE POLICY cash_recon_visibility_policy ON cash_reconciliations
    FOR ALL
    TO makan_app, makan_staff, makan_manager, makan_owner
    USING (
        user_id = security.current_app_user_id() OR
        security.has_role('manager') OR
        security.has_role('owner')
    );

-- ==================== SENSITIVE DATA PROTECTION ====================

-- Create function to mask sensitive data based on user role
CREATE OR REPLACE FUNCTION security.mask_sensitive_data(
    data_type TEXT,
    original_value TEXT,
    user_role TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
    -- Get user role if not provided
    IF user_role IS NULL THEN
        user_role := array_to_string(security.current_app_user_roles(), ',');
    END IF;
    
    -- Return original data for privileged roles
    IF 'owner' = ANY(security.current_app_user_roles()) OR 
       'manager' = ANY(security.current_app_user_roles()) OR
       'auditor' = ANY(security.current_app_user_roles()) THEN
        RETURN original_value;
    END IF;
    
    -- Mask data based on type
    CASE data_type
        WHEN 'phone' THEN
            RETURN COALESCE(
                REGEXP_REPLACE(original_value, '(\d{3})\d+(\d{2})', '\1***\2'),
                original_value
            );
        WHEN 'email' THEN
            RETURN COALESCE(
                REGEXP_REPLACE(original_value, '([^@]{2})[^@]*([^@]{2})@', '\1***\2@'),
                original_value
            );
        WHEN 'salary' THEN
            RETURN 'CONFIDENTIAL';
        WHEN 'emergency_contact' THEN
            RETURN 'REDACTED';
        ELSE
            RETURN original_value;
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create secure views for sensitive data
CREATE VIEW security.users_secure AS
SELECT 
    id,
    name,
    roles,
    avatar,
    security.mask_sensitive_data('phone', phone) as phone,
    start_date,
    security.mask_sensitive_data('emergency_contact', emergency_contact) as emergency_contact,
    photo,
    station,
    points,
    weekly_points,
    monthly_points,
    created_at,
    updated_at
FROM users;

CREATE VIEW security.salary_records_secure AS
SELECT 
    id,
    user_id,
    period_start,
    period_end,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN base_salary
        ELSE NULL
    END as base_salary,
    overtime_hours,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN overtime_rate
        ELSE NULL
    END as overtime_rate,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN overtime_pay
        ELSE NULL
    END as overtime_pay,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN bonuses
        ELSE NULL
    END as bonuses,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN deductions
        ELSE NULL
    END as deductions,
    CASE 
        WHEN security.has_role('manager') OR security.has_role('owner') OR security.has_role('auditor')
        THEN total_salary
        ELSE NULL
    END as total_salary,
    status,
    approved_by_id,
    notes,
    created_at
FROM salary_records;

-- ==================== SECURITY MONITORING AND LOGGING ====================

-- Create security events table
CREATE TABLE security.security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_description TEXT NOT NULL,
    user_id UUID,
    user_role TEXT,
    table_name TEXT,
    record_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for security event queries
CREATE INDEX idx_security_events_type_time ON security.security_events(event_type, timestamp DESC);
CREATE INDEX idx_security_events_user_time ON security.security_events(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_events_risk ON security.security_events(risk_level, timestamp DESC) WHERE risk_level IN ('HIGH', 'CRITICAL');

-- Function to log security events
CREATE OR REPLACE FUNCTION security.log_security_event(
    p_event_type TEXT,
    p_event_description TEXT,
    p_user_id UUID DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_risk_level TEXT DEFAULT 'LOW',
    p_metadata JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO security.security_events (
        event_type, event_description, user_id, user_role,
        table_name, record_id, ip_address, user_agent,
        risk_level, metadata
    ) VALUES (
        p_event_type, p_event_description, 
        COALESCE(p_user_id, security.current_app_user_id()),
        array_to_string(security.current_app_user_roles(), ','),
        p_table_name, p_record_id,
        nullif(current_setting('app.client_ip', true), '')::INET,
        nullif(current_setting('app.user_agent', true), ''),
        p_risk_level, p_metadata
    );
    
    -- Create alert for high-risk events
    IF p_risk_level IN ('HIGH', 'CRITICAL') THEN
        INSERT INTO issues (
            title, description, category, priority, reported_by_id, status
        ) VALUES (
            format('Security Alert: %s', p_event_type),
            format('High-risk security event detected: %s', p_event_description),
            'security',
            CASE p_risk_level WHEN 'CRITICAL' THEN 'critical' ELSE 'high' END,
            (SELECT id FROM users WHERE 'owner' = ANY(roles) LIMIT 1),
            'open'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================== FAILED LOGIN ATTEMPTS TRACKING ====================

-- Table to track failed login attempts
CREATE TABLE security.failed_login_attempts (
    id BIGSERIAL PRIMARY KEY,
    identifier TEXT NOT NULL, -- email, username, or user_id
    ip_address INET,
    user_agent TEXT,
    attempt_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    failure_reason TEXT,
    metadata JSONB
);

-- Index for failed login queries
CREATE INDEX idx_failed_login_identifier ON security.failed_login_attempts(identifier, attempt_timestamp DESC);
CREATE INDEX idx_failed_login_ip ON security.failed_login_attempts(ip_address, attempt_timestamp DESC);

-- Function to check if user/IP is locked due to failed attempts
CREATE OR REPLACE FUNCTION security.is_login_blocked(
    p_identifier TEXT,
    p_ip_address INET DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_failed_attempts INTEGER := 0;
    v_ip_attempts INTEGER := 0;
    v_lockout_threshold INTEGER := 5;
    v_lockout_duration INTERVAL := '15 minutes';
BEGIN
    -- Count failed attempts for identifier in last lockout period
    SELECT COUNT(*) INTO v_failed_attempts
    FROM security.failed_login_attempts
    WHERE identifier = p_identifier
    AND attempt_timestamp > CURRENT_TIMESTAMP - v_lockout_duration;
    
    -- Count failed attempts from IP in last lockout period
    IF p_ip_address IS NOT NULL THEN
        SELECT COUNT(*) INTO v_ip_attempts
        FROM security.failed_login_attempts
        WHERE ip_address = p_ip_address
        AND attempt_timestamp > CURRENT_TIMESTAMP - v_lockout_duration;
    END IF;
    
    -- Block if threshold exceeded
    IF v_failed_attempts >= v_lockout_threshold OR v_ip_attempts >= (v_lockout_threshold * 2) THEN
        -- Log security event
        PERFORM security.log_security_event(
            'LOGIN_BLOCKED',
            format('Login blocked for %s due to %s failed attempts', p_identifier, v_failed_attempts),
            NULL, NULL, NULL, 'HIGH',
            jsonb_build_object('identifier', p_identifier, 'failed_attempts', v_failed_attempts)
        );
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to record failed login attempt
CREATE OR REPLACE FUNCTION security.record_failed_login(
    p_identifier TEXT,
    p_failure_reason TEXT DEFAULT 'Invalid credentials',
    p_metadata JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO security.failed_login_attempts (
        identifier, ip_address, user_agent, failure_reason, metadata
    ) VALUES (
        p_identifier,
        nullif(current_setting('app.client_ip', true), '')::INET,
        nullif(current_setting('app.user_agent', true), ''),
        p_failure_reason,
        p_metadata
    );
    
    -- Log security event
    PERFORM security.log_security_event(
        'LOGIN_FAILED',
        format('Failed login attempt for %s: %s', p_identifier, p_failure_reason),
        NULL, NULL, NULL, 'MEDIUM',
        jsonb_build_object('identifier', p_identifier, 'reason', p_failure_reason)
    );
END;
$$ LANGUAGE plpgsql;

-- ==================== DATA ACCESS AUDIT TRIGGERS ====================

-- Function to audit sensitive data access
CREATE OR REPLACE FUNCTION security.audit_sensitive_access()
RETURNS TRIGGER AS $$
DECLARE
    v_sensitive_fields TEXT[] := ARRAY['phone', 'emergency_contact', 'base_salary', 'total_salary'];
    v_field TEXT;
BEGIN
    -- Only audit SELECT operations on sensitive tables
    IF TG_OP = 'SELECT' AND TG_TABLE_NAME IN ('users', 'salary_records') THEN
        FOREACH v_field IN ARRAY v_sensitive_fields
        LOOP
            -- Log access to sensitive fields
            INSERT INTO audit.sensitive_field_access (
                table_name, field_name, record_id, user_id, access_type, reason
            ) VALUES (
                TG_TABLE_NAME, v_field, 
                COALESCE(NEW.id, OLD.id),
                security.current_app_user_id(),
                'READ',
                'Data access via application'
            );
        END LOOP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==================== SESSION MANAGEMENT ====================

-- Table to track active sessions
CREATE TABLE security.active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for session management
CREATE INDEX idx_active_sessions_user ON security.active_sessions(user_id, is_active);
CREATE INDEX idx_active_sessions_token ON security.active_sessions(session_token) WHERE is_active = TRUE;
CREATE INDEX idx_active_sessions_expires ON security.active_sessions(expires_at) WHERE is_active = TRUE;

-- Function to create new session
CREATE OR REPLACE FUNCTION security.create_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_max_sessions INTEGER := 5; -- Limit concurrent sessions per user
BEGIN
    -- Set default expiration if not provided (24 hours)
    IF p_expires_at IS NULL THEN
        p_expires_at := CURRENT_TIMESTAMP + INTERVAL '24 hours';
    END IF;
    
    -- Deactivate old sessions if user has too many active ones
    UPDATE security.active_sessions 
    SET is_active = FALSE, last_activity = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
    AND is_active = TRUE
    AND id NOT IN (
        SELECT id FROM security.active_sessions
        WHERE user_id = p_user_id AND is_active = TRUE
        ORDER BY last_activity DESC
        LIMIT v_max_sessions - 1
    );
    
    -- Create new session
    INSERT INTO security.active_sessions (
        user_id, session_token, ip_address, user_agent, expires_at
    ) VALUES (
        p_user_id, p_session_token,
        nullif(current_setting('app.client_ip', true), '')::INET,
        nullif(current_setting('app.user_agent', true), ''),
        p_expires_at
    ) RETURNING id INTO v_session_id;
    
    -- Log session creation
    PERFORM security.log_security_event(
        'SESSION_CREATED',
        format('New session created for user %s', p_user_id),
        p_user_id, NULL, NULL, 'LOW',
        jsonb_build_object('session_id', v_session_id)
    );
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and refresh session
CREATE OR REPLACE FUNCTION security.validate_session(
    p_session_token TEXT
) RETURNS TABLE(user_id UUID, roles TEXT[], is_valid BOOLEAN) AS $$
DECLARE
    v_session RECORD;
    v_user RECORD;
BEGIN
    -- Get session details
    SELECT s.*, u.roles, u.name
    INTO v_session
    FROM security.active_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = p_session_token
    AND s.is_active = TRUE
    AND s.expires_at > CURRENT_TIMESTAMP;
    
    IF v_session.id IS NULL THEN
        -- Invalid session
        PERFORM security.log_security_event(
            'INVALID_SESSION',
            format('Invalid session token used: %s', LEFT(p_session_token, 8) || '...'),
            NULL, NULL, NULL, 'MEDIUM',
            jsonb_build_object('token_prefix', LEFT(p_session_token, 8))
        );
        
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT[], FALSE;
        RETURN;
    END IF;
    
    -- Update last activity
    UPDATE security.active_sessions
    SET last_activity = CURRENT_TIMESTAMP
    WHERE id = v_session.id;
    
    -- Return valid session info
    RETURN QUERY SELECT v_session.user_id, v_session.roles, TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to terminate session
CREATE OR REPLACE FUNCTION security.terminate_session(
    p_session_token TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_terminated_count INTEGER := 0;
BEGIN
    IF p_session_token IS NOT NULL THEN
        -- Terminate specific session
        UPDATE security.active_sessions
        SET is_active = FALSE, last_activity = CURRENT_TIMESTAMP
        WHERE session_token = p_session_token AND is_active = TRUE;
        
        GET DIAGNOSTICS v_terminated_count = ROW_COUNT;
        
    ELSIF p_user_id IS NOT NULL THEN
        -- Terminate all sessions for user
        UPDATE security.active_sessions
        SET is_active = FALSE, last_activity = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND is_active = TRUE;
        
        GET DIAGNOSTICS v_terminated_count = ROW_COUNT;
    END IF;
    
    -- Log session termination
    IF v_terminated_count > 0 THEN
        PERFORM security.log_security_event(
            'SESSION_TERMINATED',
            format('%s sessions terminated', v_terminated_count),
            p_user_id, NULL, NULL, 'LOW',
            jsonb_build_object('sessions_terminated', v_terminated_count)
        );
    END IF;
    
    RETURN v_terminated_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== SECURITY MAINTENANCE PROCEDURES ====================

-- Function to clean up expired sessions and security data
CREATE OR REPLACE FUNCTION security.cleanup_security_data()
RETURNS TEXT AS $$
DECLARE
    v_expired_sessions INTEGER;
    v_old_failed_attempts INTEGER;
    v_old_events INTEGER;
    v_result TEXT := '';
BEGIN
    -- Clean up expired sessions
    DELETE FROM security.active_sessions
    WHERE expires_at < CURRENT_TIMESTAMP OR last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days';
    GET DIAGNOSTICS v_expired_sessions = ROW_COUNT;
    
    -- Clean up old failed login attempts (keep 90 days)
    DELETE FROM security.failed_login_attempts
    WHERE attempt_timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';
    GET DIAGNOSTICS v_old_failed_attempts = ROW_COUNT;
    
    -- Clean up old security events (keep 1 year, except critical events)
    DELETE FROM security.security_events
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year'
    AND risk_level NOT IN ('HIGH', 'CRITICAL');
    GET DIAGNOSTICS v_old_events = ROW_COUNT;
    
    v_result := format('Security cleanup completed: %s expired sessions, %s failed attempts, %s events removed',
                      v_expired_sessions, v_old_failed_attempts, v_old_events);
    
    -- Log cleanup activity
    PERFORM security.log_security_event(
        'SECURITY_CLEANUP',
        v_result,
        NULL, NULL, NULL, 'LOW',
        jsonb_build_object(
            'sessions_cleaned', v_expired_sessions,
            'failed_attempts_cleaned', v_old_failed_attempts,
            'events_cleaned', v_old_events
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant appropriate permissions on security functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA security TO makan_app, makan_manager, makan_owner;
GRANT SELECT ON security.users_secure TO makan_staff, makan_manager, makan_owner;
GRANT SELECT ON security.salary_records_secure TO makan_manager, makan_owner, makan_auditor;

-- ==================== DEFAULT SECURITY SETTINGS ====================

-- Set secure default settings
ALTER DATABASE current SET log_statement TO 'ddl';
ALTER DATABASE current SET log_min_duration_statement TO 1000; -- Log slow queries
ALTER DATABASE current SET log_connections TO on;
ALTER DATABASE current SET log_disconnections TO on;
ALTER DATABASE current SET log_checkpoints TO on;

-- Create security monitoring view
CREATE VIEW security.security_dashboard AS
SELECT 
    'Failed Login Attempts (24h)' as metric,
    COUNT(*)::TEXT as value,
    'HIGH' as alert_level
FROM security.failed_login_attempts 
WHERE attempt_timestamp > CURRENT_TIMESTAMP - INTERVAL '24 hours'
HAVING COUNT(*) > 10

UNION ALL

SELECT 
    'High Risk Security Events (7d)',
    COUNT(*)::TEXT,
    'CRITICAL'
FROM security.security_events 
WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days'
AND risk_level IN ('HIGH', 'CRITICAL')
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    'Active Sessions',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 100 THEN 'MEDIUM' ELSE 'LOW' END
FROM security.active_sessions 
WHERE is_active = TRUE AND expires_at > CURRENT_TIMESTAMP

UNION ALL

SELECT 
    'Expired Sessions (Cleanup Needed)',
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 1000 THEN 'HIGH' ELSE 'LOW' END
FROM security.active_sessions 
WHERE expires_at < CURRENT_TIMESTAMP;

COMMIT;