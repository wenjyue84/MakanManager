-- Advanced Audit Trails and Business Logic Automation
-- Enterprise-grade tracking and automated workflows

-- ==================== AUDIT INFRASTRUCTURE ====================

-- Create audit schema for separation
CREATE SCHEMA IF NOT EXISTS audit;

-- Universal audit log table
CREATE TABLE audit.change_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation CHAR(1) NOT NULL CHECK (operation IN ('I', 'U', 'D')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID,
    user_role TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    application_name TEXT DEFAULT 'MakanManager',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id BIGINT DEFAULT txid_current()
);

-- Index for efficient audit queries
CREATE INDEX idx_audit_table_record ON audit.change_log(table_name, record_id, timestamp DESC);
CREATE INDEX idx_audit_user_activity ON audit.change_log(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_operation_time ON audit.change_log(operation, timestamp DESC);

-- Sensitive field tracking table
CREATE TABLE audit.sensitive_field_access (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    field_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID,
    access_type TEXT CHECK (access_type IN ('READ', 'WRITE', 'EXPORT')),
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics tracking
CREATE TABLE audit.performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    table_name TEXT,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Business rule violations log
CREATE TABLE audit.business_rule_violations (
    id BIGSERIAL PRIMARY KEY,
    rule_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    violation_type TEXT,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    auto_resolved BOOLEAN DEFAULT false,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== GENERIC AUDIT TRIGGER FUNCTION ====================

CREATE OR REPLACE FUNCTION audit.record_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    changed_fields TEXT[] := ARRAY[]::TEXT[];
    current_user_id UUID;
    current_user_role TEXT;
BEGIN
    -- Get current user context (would be set by application)
    current_user_id := nullif(current_setting('app.current_user_id', true), '')::UUID;
    current_user_role := nullif(current_setting('app.current_user_role', true), '');
    
    -- Handle different operations
    CASE TG_OP
        WHEN 'INSERT' THEN
            new_values := to_jsonb(NEW);
            old_values := NULL;
            
        WHEN 'UPDATE' THEN
            old_values := to_jsonb(OLD);
            new_values := to_jsonb(NEW);
            
            -- Calculate changed fields
            SELECT array_agg(key)
            INTO changed_fields
            FROM (
                SELECT key
                FROM jsonb_each(old_values) old_kv
                WHERE old_kv.value IS DISTINCT FROM (new_values->old_kv.key)
            ) changed;
            
            -- Skip if no actual changes
            IF array_length(changed_fields, 1) IS NULL THEN
                RETURN NEW;
            END IF;
            
        WHEN 'DELETE' THEN
            old_values := to_jsonb(OLD);
            new_values := NULL;
    END CASE;
    
    -- Insert audit record
    INSERT INTO audit.change_log (
        table_name, record_id, operation, old_values, new_values, 
        changed_fields, user_id, user_role, session_id, ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        LEFT(TG_OP, 1),
        old_values,
        new_values,
        changed_fields,
        current_user_id,
        current_user_role,
        nullif(current_setting('app.session_id', true), ''),
        nullif(current_setting('app.client_ip', true), '')::INET
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==================== TABLE-SPECIFIC AUDIT TRIGGERS ====================

-- Apply audit triggers to all critical tables
DO $$
DECLARE
    table_record RECORD;
    audit_tables TEXT[] := ARRAY[
        'users', 'tasks', 'disciplinary_actions', 'recipes', 'staff_meals',
        'cash_reconciliations', 'online_orders', 'purchases', 'suppliers',
        'disposals', 'issues', 'notifications', 'user_skills', 'salary_records'
    ];
BEGIN
    FOREACH table_record IN ARRAY audit_tables
    LOOP
        EXECUTE format('
            CREATE TRIGGER audit_%s
            AFTER INSERT OR UPDATE OR DELETE ON %s
            FOR EACH ROW EXECUTE FUNCTION audit.record_changes();
        ', table_record, table_record);
    END LOOP;
END $$;

-- ==================== BUSINESS LOGIC AUTOMATION TRIGGERS ====================

-- 1. Automatic point calculation and user score updates
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user points when task is completed
    IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
        UPDATE users 
        SET 
            points = points + COALESCE(NEW.final_points, NEW.base_points + NEW.adjustment),
            weekly_points = weekly_points + COALESCE(NEW.final_points, NEW.base_points + NEW.adjustment),
            monthly_points = monthly_points + COALESCE(NEW.final_points, NEW.base_points + NEW.adjustment),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.assignee_id;
        
        -- Log performance metric
        INSERT INTO audit.performance_metrics (
            metric_name, metric_value, table_name, user_id, metadata
        ) VALUES (
            'task_completion_points', 
            COALESCE(NEW.final_points, NEW.base_points + NEW.adjustment),
            'tasks',
            NEW.assignee_id,
            jsonb_build_object(
                'task_id', NEW.id,
                'completion_time', NEW.completed_at - NEW.created_at,
                'station', NEW.station
            )
        );
    END IF;
    
    -- Subtract points if task completion is reverted
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        UPDATE users 
        SET 
            points = GREATEST(0, points - COALESCE(OLD.final_points, OLD.base_points + OLD.adjustment)),
            weekly_points = GREATEST(0, weekly_points - COALESCE(OLD.final_points, OLD.base_points + OLD.adjustment)),
            monthly_points = GREATEST(0, monthly_points - COALESCE(OLD.final_points, OLD.base_points + OLD.adjustment)),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.assignee_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_points
    AFTER UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- 2. Automatic task status and overdue management
CREATE OR REPLACE FUNCTION manage_task_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-set completion timestamp when status changes to done
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Clear completion timestamp if status is reverted
    IF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
        NEW.approved_at = NULL;
    END IF;
    
    -- Calculate overdue days
    IF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('done') THEN
        NEW.overdue_days = CURRENT_DATE - NEW.due_date;
        
        -- Auto-change status to overdue if more than 1 day late
        IF NEW.overdue_days > 1 AND NEW.status NOT IN ('overdue', 'done') THEN
            NEW.status = 'overdue';
            
            -- Create notification for assignee
            IF NEW.assignee_id IS NOT NULL THEN
                INSERT INTO notifications (user_id, title, message, type, metadata)
                VALUES (
                    NEW.assignee_id,
                    'Task Overdue',
                    format('Task "%s" is now %s days overdue', NEW.title, NEW.overdue_days),
                    'warning',
                    jsonb_build_object('task_id', NEW.id, 'overdue_days', NEW.overdue_days)
                );
            END IF;
            
            -- Notify assigner too
            INSERT INTO notifications (user_id, title, message, type, metadata)
            VALUES (
                NEW.assigner_id,
                'Assigned Task Overdue',
                format('Task "%s" assigned to %s is %s days overdue', 
                       NEW.title, 
                       (SELECT name FROM users WHERE id = NEW.assignee_id),
                       NEW.overdue_days),
                'error',
                jsonb_build_object('task_id', NEW.id, 'assignee_id', NEW.assignee_id)
            );
        END IF;
    ELSE
        NEW.overdue_days = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_manage_task_status
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION manage_task_status();

-- 3. Automatic notification creation for important events
CREATE OR REPLACE FUNCTION create_automatic_notifications()
RETURNS TRIGGER AS $$
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'disciplinary_actions' THEN
            -- Notify the target user
            INSERT INTO notifications (user_id, title, message, type, metadata)
            VALUES (
                NEW.target_user_id,
                'Disciplinary Action',
                format('A disciplinary action has been recorded: %s', NEW.type),
                'warning',
                jsonb_build_object('disciplinary_id', NEW.id, 'type', NEW.type)
            );
            
        WHEN 'online_orders' THEN
            -- Notify when order is assigned
            IF TG_OP = 'UPDATE' AND NEW.assigned_to_id IS NOT NULL AND OLD.assigned_to_id IS NULL THEN
                INSERT INTO notifications (user_id, title, message, type, metadata)
                VALUES (
                    NEW.assigned_to_id,
                    'Order Assigned',
                    format('Order #%s has been assigned to you', NEW.order_number),
                    'info',
                    jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
                );
            END IF;
            
        WHEN 'issues' THEN
            -- Notify when issue is assigned
            IF NEW.assigned_to_id IS NOT NULL THEN
                INSERT INTO notifications (user_id, title, message, type, metadata)
                VALUES (
                    NEW.assigned_to_id,
                    'Issue Assigned',
                    format('Issue "%s" has been assigned to you', NEW.title),
                    'info',
                    jsonb_build_object('issue_id', NEW.id, 'priority', NEW.priority)
                );
            END IF;
            
        WHEN 'cash_reconciliations' THEN
            -- Notify on approval/rejection
            IF TG_OP = 'UPDATE' AND NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
                INSERT INTO notifications (user_id, title, message, type, metadata)
                VALUES (
                    NEW.user_id,
                    format('Cash Reconciliation %s', INITCAP(NEW.status)),
                    format('Your cash reconciliation for %s has been %s', NEW.reconciliation_date, NEW.status),
                    CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'error' END,
                    jsonb_build_object('reconciliation_id', NEW.id, 'difference', NEW.difference)
                );
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply notification triggers
CREATE TRIGGER trg_auto_notifications_disciplinary
    AFTER INSERT ON disciplinary_actions
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

CREATE TRIGGER trg_auto_notifications_orders
    AFTER INSERT OR UPDATE ON online_orders
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

CREATE TRIGGER trg_auto_notifications_issues
    AFTER INSERT OR UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

CREATE TRIGGER trg_auto_notifications_cash
    AFTER UPDATE ON cash_reconciliations
    FOR EACH ROW EXECUTE FUNCTION create_automatic_notifications();

-- 4. Data validation and business rule enforcement
CREATE OR REPLACE FUNCTION enforce_business_rules()
RETURNS TRIGGER AS $$
DECLARE
    violation_msg TEXT;
    rule_name TEXT;
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'tasks' THEN
            -- Rule: High-point tasks must have manager approval
            IF NEW.base_points > 100 THEN
                IF NOT EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = NEW.assigner_id 
                    AND ('manager' = ANY(roles) OR 'owner' = ANY(roles))
                ) THEN
                    rule_name := 'high_point_task_approval';
                    violation_msg := 'Tasks with more than 100 points require manager approval';
                    RAISE EXCEPTION '%', violation_msg;
                END IF;
            END IF;
            
            -- Rule: Tasks cannot be assigned more than 30 days in advance
            IF NEW.due_date > CURRENT_DATE + INTERVAL '30 days' THEN
                rule_name := 'task_future_limit';
                violation_msg := 'Tasks cannot be scheduled more than 30 days in advance';
                
                INSERT INTO audit.business_rule_violations (
                    rule_name, table_name, record_id, violation_type, 
                    description, severity, user_id
                ) VALUES (
                    rule_name, TG_TABLE_NAME, NEW.id, 'DATE_VALIDATION',
                    violation_msg, 'MEDIUM', 
                    nullif(current_setting('app.current_user_id', true), '')::UUID
                );
                
                RAISE EXCEPTION '%', violation_msg;
            END IF;
            
        WHEN 'staff_meals' THEN
            -- Rule: Limit expensive meals
            IF NEW.cost > 50.00 THEN
                rule_name := 'expensive_meal_limit';
                violation_msg := format('Meal cost $%.2f exceeds limit of $50.00', NEW.cost);
                
                INSERT INTO audit.business_rule_violations (
                    rule_name, table_name, record_id, violation_type,
                    description, severity, user_id
                ) VALUES (
                    rule_name, TG_TABLE_NAME, NEW.id, 'COST_VALIDATION',
                    violation_msg, 'HIGH',
                    nullif(current_setting('app.current_user_id', true), '')::UUID
                );
                
                -- Don't prevent, but log for review
            END IF;
            
        WHEN 'purchases' THEN
            -- Rule: Large purchases need approval
            IF NEW.total_price > 1000.00 THEN
                IF NOT EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = NEW.ordered_by_id 
                    AND ('manager' = ANY(roles) OR 'owner' = ANY(roles))
                ) THEN
                    rule_name := 'large_purchase_approval';
                    violation_msg := format('Purchase of $%.2f requires manager approval', NEW.total_price);
                    
                    INSERT INTO audit.business_rule_violations (
                        rule_name, table_name, record_id, violation_type,
                        description, severity, user_id
                    ) VALUES (
                        rule_name, TG_TABLE_NAME, NEW.id, 'APPROVAL_REQUIRED',
                        violation_msg, 'HIGH', NEW.ordered_by_id
                    );
                    
                    RAISE EXCEPTION '%', violation_msg;
                END IF;
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_business_rules_tasks
    BEFORE INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION enforce_business_rules();

CREATE TRIGGER trg_enforce_business_rules_meals
    BEFORE INSERT OR UPDATE ON staff_meals
    FOR EACH ROW EXECUTE FUNCTION enforce_business_rules();

CREATE TRIGGER trg_enforce_business_rules_purchases
    BEFORE INSERT OR UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION enforce_business_rules();

-- 5. Automatic data enrichment and calculation
CREATE OR REPLACE FUNCTION enrich_data()
RETURNS TRIGGER AS $$
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'online_orders' THEN
            -- Generate order number if not provided
            IF NEW.order_number IS NULL THEN
                NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
                                   LPAD(nextval('order_number_seq')::TEXT, 4, '0');
            END IF;
            
            -- Set delivery time for immediate orders
            IF NEW.status = 'ready' AND NEW.delivery_time IS NULL THEN
                NEW.delivery_time = CURRENT_TIMESTAMP + INTERVAL '30 minutes';
            END IF;
            
        WHEN 'issues' THEN
            -- Auto-assign based on category
            IF NEW.assigned_to_id IS NULL AND NEW.category IS NOT NULL THEN
                SELECT id INTO NEW.assigned_to_id
                FROM users 
                WHERE CASE NEW.category
                    WHEN 'equipment' THEN 'maintenance' = ANY(roles) OR 'manager' = ANY(roles)
                    WHEN 'safety' THEN 'head-of-kitchen' = ANY(roles) OR 'manager' = ANY(roles)
                    WHEN 'customer' THEN 'front-desk-manager' = ANY(roles) OR 'manager' = ANY(roles)
                    ELSE 'manager' = ANY(roles)
                END
                ORDER BY RANDOM()
                LIMIT 1;
            END IF;
            
        WHEN 'disposals' THEN
            -- Auto-calculate estimated value based on purchase history
            IF NEW.estimated_value IS NULL THEN
                SELECT AVG(unit_price * NEW.quantity)
                INTO NEW.estimated_value
                FROM purchases 
                WHERE LOWER(item_name) LIKE LOWER('%' || NEW.item_name || '%')
                AND created_at > CURRENT_DATE - INTERVAL '90 days';
            END IF;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TRIGGER trg_enrich_data_orders
    BEFORE INSERT ON online_orders
    FOR EACH ROW EXECUTE FUNCTION enrich_data();

CREATE TRIGGER trg_enrich_data_issues
    BEFORE INSERT ON issues
    FOR EACH ROW EXECUTE FUNCTION enrich_data();

CREATE TRIGGER trg_enrich_data_disposals
    BEFORE INSERT ON disposals
    FOR EACH ROW EXECUTE FUNCTION enrich_data();

-- ==================== SENSITIVE DATA ACCESS LOGGING ====================

CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
DECLARE
    sensitive_fields TEXT[] := ARRAY['phone', 'emergency_contact', 'base_salary', 'total_salary'];
    field_name TEXT;
    current_user_id UUID;
BEGIN
    current_user_id := nullif(current_setting('app.current_user_id', true), '')::UUID;
    
    -- Log access to sensitive fields on SELECT (would need to be handled at application level)
    -- This trigger handles UPDATE access
    IF TG_OP = 'UPDATE' THEN
        FOREACH field_name IN ARRAY sensitive_fields
        LOOP
            IF jsonb_extract_path(to_jsonb(OLD), field_name) IS DISTINCT FROM 
               jsonb_extract_path(to_jsonb(NEW), field_name) THEN
                INSERT INTO audit.sensitive_field_access (
                    table_name, field_name, record_id, user_id, access_type,
                    old_value, new_value, reason
                ) VALUES (
                    TG_TABLE_NAME, field_name, NEW.id, current_user_id, 'WRITE',
                    jsonb_extract_path_text(to_jsonb(OLD), field_name),
                    jsonb_extract_path_text(to_jsonb(NEW), field_name),
                    'Field updated via application'
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_sensitive_users
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER trg_log_sensitive_salary
    AFTER UPDATE ON salary_records
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

-- ==================== MAINTENANCE AND CLEANUP TRIGGERS ====================

-- Auto-cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM notifications 
    WHERE read = true 
    AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Delete unread notifications older than 90 days (except critical ones)
    DELETE FROM notifications 
    WHERE read = false 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
    AND type NOT IN ('error', 'alert');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cleanup on notification table updates (batch operations)
CREATE TRIGGER trg_cleanup_notifications
    AFTER INSERT ON notifications
    FOR EACH STATEMENT EXECUTE FUNCTION cleanup_old_notifications();

-- ==================== PERFORMANCE MONITORING TRIGGERS ====================

CREATE OR REPLACE FUNCTION monitor_performance()
RETURNS TRIGGER AS $$
DECLARE
    operation_duration INTERVAL;
    table_size BIGINT;
BEGIN
    -- Monitor large table operations
    IF TG_TABLE_NAME IN ('tasks', 'online_orders', 'audit.change_log') THEN
        SELECT pg_total_relation_size(TG_RELID) INTO table_size;
        
        INSERT INTO audit.performance_metrics (
            metric_name, metric_value, metric_unit, table_name, metadata
        ) VALUES (
            'table_size_bytes', table_size, 'bytes', TG_TABLE_NAME,
            jsonb_build_object('operation', TG_OP, 'timestamp', CURRENT_TIMESTAMP)
        );
        
        -- Alert if table is growing too fast
        IF table_size > 1000000000 THEN -- 1GB
            INSERT INTO issues (
                title, description, category, priority, reported_by_id, status
            ) VALUES (
                'Database Table Size Alert',
                format('Table %s has exceeded 1GB (%s bytes)', TG_TABLE_NAME, table_size),
                'maintenance',
                'high',
                (SELECT id FROM users WHERE 'owner' = ANY(roles) LIMIT 1),
                'open'
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply performance monitoring to key tables
CREATE TRIGGER trg_monitor_performance_tasks
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH STATEMENT EXECUTE FUNCTION monitor_performance();

CREATE TRIGGER trg_monitor_performance_orders
    AFTER INSERT OR UPDATE OR DELETE ON online_orders
    FOR EACH STATEMENT EXECUTE FUNCTION monitor_performance();

-- ==================== AUDIT DATA RETENTION ====================

-- Function to archive old audit data
CREATE OR REPLACE FUNCTION archive_old_audit_data()
RETURNS void AS $$
BEGIN
    -- Archive audit records older than 2 years to a separate table
    CREATE TABLE IF NOT EXISTS audit.change_log_archive (LIKE audit.change_log);
    
    WITH archived_records AS (
        DELETE FROM audit.change_log 
        WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '2 years'
        RETURNING *
    )
    INSERT INTO audit.change_log_archive SELECT * FROM archived_records;
    
    -- Compress and analyze
    VACUUM ANALYZE audit.change_log;
    
    RAISE NOTICE 'Audit data archiving completed at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for audit cleanup (requires pg_cron extension)
-- SELECT cron.schedule('audit-cleanup', '0 2 1 * *', 'SELECT archive_old_audit_data();');

COMMIT;