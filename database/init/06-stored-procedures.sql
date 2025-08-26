-- Enterprise-Grade Stored Procedures and Functions
-- Complex business logic and operational procedures

-- Create procedures schema for organization
CREATE SCHEMA IF NOT EXISTS procedures;

-- ==================== TASK MANAGEMENT PROCEDURES ====================

-- Procedure to create and assign tasks with validation
CREATE OR REPLACE FUNCTION procedures.create_task(
    p_title VARCHAR(255),
    p_description TEXT,
    p_station station_type,
    p_due_date DATE,
    p_due_time TIME DEFAULT NULL,
    p_base_points INTEGER DEFAULT 10,
    p_assigner_id UUID,
    p_assignee_id UUID DEFAULT NULL,
    p_proof_type proof_type DEFAULT 'none',
    p_repeat_schedule repeat_type DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_task_id UUID;
    v_assigner_role TEXT[];
    v_assignee_station station_type;
    v_assignee_roles TEXT[];
BEGIN
    -- Validate assigner permissions
    SELECT roles INTO v_assigner_role 
    FROM users 
    WHERE id = p_assigner_id;
    
    IF v_assigner_role IS NULL THEN
        RAISE EXCEPTION 'Invalid assigner ID: %', p_assigner_id;
    END IF;
    
    IF NOT ('manager' = ANY(v_assigner_role) OR 'head-of-kitchen' = ANY(v_assigner_role) 
            OR 'front-desk-manager' = ANY(v_assigner_role) OR 'owner' = ANY(v_assigner_role)) THEN
        RAISE EXCEPTION 'Assigner must have management role to create tasks';
    END IF;
    
    -- Validate assignee if provided
    IF p_assignee_id IS NOT NULL THEN
        SELECT station, roles INTO v_assignee_station, v_assignee_roles 
        FROM users 
        WHERE id = p_assignee_id;
        
        IF v_assignee_station IS NULL THEN
            RAISE EXCEPTION 'Invalid assignee ID: %', p_assignee_id;
        END IF;
        
        -- Check station compatibility
        IF v_assignee_station != p_station AND v_assignee_station IS NOT NULL THEN
            IF NOT ('manager' = ANY(v_assignee_roles) OR 'owner' = ANY(v_assignee_roles)) THEN
                RAISE EXCEPTION 'Assignee station (%) does not match task station (%)', 
                    v_assignee_station, p_station;
            END IF;
        END IF;
    END IF;
    
    -- Create the task
    INSERT INTO tasks (
        title, description, station, due_date, due_time, base_points,
        assigner_id, assignee_id, proof_type, repeat_schedule
    ) VALUES (
        p_title, p_description, p_station, p_due_date, p_due_time, p_base_points,
        p_assigner_id, p_assignee_id, p_proof_type, p_repeat_schedule
    ) RETURNING id INTO v_task_id;
    
    -- Create notification for assignee if assigned
    IF p_assignee_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
            p_assignee_id,
            'New Task Assigned',
            format('You have been assigned task: %s', p_title),
            'info',
            jsonb_build_object('task_id', v_task_id, 'due_date', p_due_date)
        );
    END IF;
    
    -- Log the task creation
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, table_name, user_id, metadata
    ) VALUES (
        'task_created', 1, 'tasks', p_assigner_id,
        jsonb_build_object('task_id', v_task_id, 'points', p_base_points)
    );
    
    RETURN v_task_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure for task completion with validation and point calculation
CREATE OR REPLACE FUNCTION procedures.complete_task(
    p_task_id UUID,
    p_completing_user_id UUID,
    p_proof_data JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_task RECORD;
    v_calculated_points INTEGER;
    v_multiplier DECIMAL(3,2);
BEGIN
    -- Get task details with lock
    SELECT t.*, u.name as assignee_name 
    INTO v_task 
    FROM tasks t 
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.id = p_task_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found: %', p_task_id;
    END IF;
    
    -- Validate task can be completed
    IF v_task.status = 'done' THEN
        RAISE EXCEPTION 'Task is already completed';
    END IF;
    
    -- Validate user can complete this task
    IF v_task.assignee_id IS NOT NULL AND v_task.assignee_id != p_completing_user_id THEN
        -- Check if user has manager role to complete others' tasks
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = p_completing_user_id 
            AND ('manager' = ANY(roles) OR 'owner' = ANY(roles))
        ) THEN
            RAISE EXCEPTION 'Only assigned user or managers can complete this task';
        END IF;
    END IF;
    
    -- Calculate quality multiplier based on timing
    v_multiplier := v_task.multiplier;
    
    IF v_task.due_date < CURRENT_DATE THEN
        -- Late completion penalty
        v_multiplier := v_multiplier * 0.8;
    ELSIF v_task.due_date > CURRENT_DATE THEN
        -- Early completion bonus
        v_multiplier := v_multiplier * 1.1;
    END IF;
    
    -- Calculate final points
    v_calculated_points := ROUND(v_task.base_points * v_multiplier) + v_task.adjustment;
    
    -- Update task
    UPDATE tasks 
    SET 
        status = 'done',
        completed_at = CURRENT_TIMESTAMP,
        final_points = v_calculated_points,
        proof_data = COALESCE(p_proof_data, proof_data),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_task_id;
    
    -- Create completion notification for assigner
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
        v_task.assigner_id,
        'Task Completed',
        format('Task "%s" has been completed by %s', v_task.title, 
               COALESCE(v_task.assignee_name, (SELECT name FROM users WHERE id = p_completing_user_id))),
        'success',
        jsonb_build_object('task_id', p_task_id, 'points_earned', v_calculated_points)
    );
    
    -- Log completion metrics
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, table_name, user_id, metadata
    ) VALUES (
        'task_completed', 1, 'tasks', p_completing_user_id,
        jsonb_build_object(
            'task_id', p_task_id, 
            'points_earned', v_calculated_points,
            'completion_time_hours', EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_task.created_at))/3600
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Bulk task assignment procedure
CREATE OR REPLACE FUNCTION procedures.bulk_assign_tasks(
    p_task_ids UUID[],
    p_assignee_id UUID,
    p_assigner_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_assigned_count INTEGER := 0;
    v_task_id UUID;
    v_assigner_roles TEXT[];
    v_assignee_info RECORD;
BEGIN
    -- Validate assigner permissions
    SELECT roles INTO v_assigner_roles FROM users WHERE id = p_assigner_id;
    IF NOT ('manager' = ANY(v_assigner_roles) OR 'owner' = ANY(v_assigner_roles)) THEN
        RAISE EXCEPTION 'Only managers can bulk assign tasks';
    END IF;
    
    -- Get assignee info
    SELECT station, roles, name INTO v_assignee_info FROM users WHERE id = p_assignee_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid assignee ID: %', p_assignee_id;
    END IF;
    
    -- Process each task
    FOREACH v_task_id IN ARRAY p_task_ids
    LOOP
        -- Update task if valid
        UPDATE tasks 
        SET 
            assignee_id = p_assignee_id,
            status = CASE WHEN status = 'open' THEN 'open' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_task_id 
        AND status NOT IN ('done')
        AND (assignee_id IS NULL OR assignee_id != p_assignee_id);
        
        IF FOUND THEN
            v_assigned_count := v_assigned_count + 1;
        END IF;
    END LOOP;
    
    -- Create bulk notification
    IF v_assigned_count > 0 THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
            p_assignee_id,
            'Multiple Tasks Assigned',
            format('%s tasks have been assigned to you', v_assigned_count),
            'info',
            jsonb_build_object('task_count', v_assigned_count, 'assigned_by', p_assigner_id)
        );
    END IF;
    
    RETURN v_assigned_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== USER MANAGEMENT PROCEDURES ====================

-- Procedure to onboard new staff member
CREATE OR REPLACE FUNCTION procedures.onboard_staff(
    p_name VARCHAR(255),
    p_phone VARCHAR(50),
    p_station station_type,
    p_roles user_role[],
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_emergency_contact TEXT DEFAULT NULL,
    p_onboarding_manager_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_manager_roles TEXT[];
BEGIN
    -- Validate manager if provided
    IF p_onboarding_manager_id IS NOT NULL THEN
        SELECT roles INTO v_manager_roles FROM users WHERE id = p_onboarding_manager_id;
        IF NOT ('manager' = ANY(v_manager_roles) OR 'owner' = ANY(v_manager_roles)) THEN
            RAISE EXCEPTION 'Only managers can onboard new staff';
        END IF;
    END IF;
    
    -- Create user
    INSERT INTO users (
        name, phone, station, roles, start_date, emergency_contact
    ) VALUES (
        p_name, p_phone, p_station, p_roles, p_start_date, p_emergency_contact
    ) RETURNING id INTO v_user_id;
    
    -- Create welcome notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_user_id,
        'Welcome to Makan Manager',
        format('Welcome %s! Your account has been created successfully.', p_name),
        'success'
    );
    
    -- Create initial skills assessment tasks
    INSERT INTO tasks (title, description, station, due_date, assigner_id, assignee_id, base_points)
    VALUES 
        ('Complete Safety Training', 'Complete workplace safety orientation', p_station, 
         p_start_date + INTERVAL '3 days', p_onboarding_manager_id, v_user_id, 50),
        ('Station Orientation', format('Complete orientation for %s station', p_station), p_station,
         p_start_date + INTERVAL '1 week', p_onboarding_manager_id, v_user_id, 30);
    
    -- Log onboarding
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, table_name, user_id, metadata
    ) VALUES (
        'staff_onboarded', 1, 'users', p_onboarding_manager_id,
        jsonb_build_object('new_user_id', v_user_id, 'station', p_station)
    );
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure to reset weekly/monthly points
CREATE OR REPLACE FUNCTION procedures.reset_periodic_points(
    p_period TEXT -- 'weekly' or 'monthly'
) RETURNS INTEGER AS $$
DECLARE
    v_affected_users INTEGER;
BEGIN
    IF p_period = 'weekly' THEN
        UPDATE users 
        SET weekly_points = 0, updated_at = CURRENT_TIMESTAMP
        WHERE weekly_points > 0;
        
        GET DIAGNOSTICS v_affected_users = ROW_COUNT;
        
        -- Log weekly reset
        INSERT INTO audit.performance_metrics (
            metric_name, metric_value, metadata
        ) VALUES (
            'weekly_points_reset', v_affected_users,
            jsonb_build_object('reset_date', CURRENT_DATE)
        );
        
    ELSIF p_period = 'monthly' THEN
        UPDATE users 
        SET monthly_points = 0, updated_at = CURRENT_TIMESTAMP
        WHERE monthly_points > 0;
        
        GET DIAGNOSTICS v_affected_users = ROW_COUNT;
        
        -- Log monthly reset
        INSERT INTO audit.performance_metrics (
            metric_name, metric_value, metadata
        ) VALUES (
            'monthly_points_reset', v_affected_users,
            jsonb_build_object('reset_date', CURRENT_DATE)
        );
    ELSE
        RAISE EXCEPTION 'Invalid period: %. Use "weekly" or "monthly"', p_period;
    END IF;
    
    RETURN v_affected_users;
END;
$$ LANGUAGE plpgsql;

-- ==================== FINANCIAL PROCEDURES ====================

-- Procedure to process cash reconciliation
CREATE OR REPLACE FUNCTION procedures.process_cash_reconciliation(
    p_user_id UUID,
    p_reconciliation_date DATE,
    p_expected_amount DECIMAL(10,2),
    p_actual_amount DECIMAL(10,2),
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_reconciliation_id UUID;
    v_difference DECIMAL(10,2);
    v_user_name VARCHAR(255);
    v_manager_ids UUID[];
BEGIN
    -- Check for existing reconciliation
    IF EXISTS (
        SELECT 1 FROM cash_reconciliations 
        WHERE user_id = p_user_id AND reconciliation_date = p_reconciliation_date
    ) THEN
        RAISE EXCEPTION 'Cash reconciliation already exists for user % on %', p_user_id, p_reconciliation_date;
    END IF;
    
    -- Get user name
    SELECT name INTO v_user_name FROM users WHERE id = p_user_id;
    
    -- Calculate difference
    v_difference := p_actual_amount - p_expected_amount;
    
    -- Create reconciliation record
    INSERT INTO cash_reconciliations (
        user_id, reconciliation_date, expected_amount, actual_amount, notes, status
    ) VALUES (
        p_user_id, p_reconciliation_date, p_expected_amount, p_actual_amount, p_notes,
        CASE WHEN ABS(v_difference) <= 5.00 THEN 'approved' ELSE 'pending' END
    ) RETURNING id INTO v_reconciliation_id;
    
    -- Auto-approve small differences, flag large ones
    IF ABS(v_difference) > 5.00 THEN
        -- Get manager IDs for notifications
        SELECT array_agg(id) INTO v_manager_ids 
        FROM users 
        WHERE 'manager' = ANY(roles) OR 'owner' = ANY(roles);
        
        -- Notify managers of significant discrepancy
        INSERT INTO notifications (user_id, title, message, type, metadata)
        SELECT 
            unnest(v_manager_ids),
            'Cash Reconciliation Review Needed',
            format('Cash reconciliation for %s shows $%.2f difference (Expected: $%.2f, Actual: $%.2f)', 
                   v_user_name, v_difference, p_expected_amount, p_actual_amount),
            CASE WHEN ABS(v_difference) > 50.00 THEN 'error' ELSE 'warning' END,
            jsonb_build_object('reconciliation_id', v_reconciliation_id, 'difference', v_difference);
        
        -- Create issue for large discrepancies
        IF ABS(v_difference) > 50.00 THEN
            INSERT INTO issues (
                title, description, category, priority, reported_by_id, status
            ) VALUES (
                'Significant Cash Discrepancy',
                format('Large cash discrepancy of $%.2f found in reconciliation by %s on %s', 
                       v_difference, v_user_name, p_reconciliation_date),
                'finance',
                'high',
                p_user_id,
                'open'
            );
        END IF;
    END IF;
    
    -- Log performance metric
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, table_name, user_id, metadata
    ) VALUES (
        'cash_reconciliation_processed', 1, 'cash_reconciliations', p_user_id,
        jsonb_build_object('difference', v_difference, 'auto_approved', ABS(v_difference) <= 5.00)
    );
    
    RETURN v_reconciliation_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure to calculate staff meal allowances and costs
CREATE OR REPLACE FUNCTION procedures.calculate_meal_allowances(
    p_user_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    user_id UUID,
    user_name VARCHAR(255),
    period_start DATE,
    period_end DATE,
    total_meals INTEGER,
    total_cost DECIMAL(10,2),
    avg_meal_cost DECIMAL(10,2),
    allowance_exceeded BOOLEAN,
    excess_amount DECIMAL(10,2)
) AS $$
DECLARE
    v_daily_allowance DECIMAL(10,2) := 25.00; -- Default daily allowance
    v_start_date DATE := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
    v_user_filter TEXT := '';
BEGIN
    -- Build user filter if specific user requested
    IF p_user_id IS NOT NULL THEN
        v_user_filter := format('AND u.id = %L', p_user_id);
    END IF;
    
    RETURN QUERY EXECUTE format('
        SELECT 
            u.id,
            u.name,
            %L::DATE as period_start,
            %L::DATE as period_end,
            COUNT(sm.id)::INTEGER as total_meals,
            COALESCE(SUM(sm.cost), 0)::DECIMAL(10,2) as total_cost,
            COALESCE(AVG(sm.cost), 0)::DECIMAL(10,2) as avg_meal_cost,
            (COALESCE(SUM(sm.cost), 0) > (%L * (%L::DATE - %L::DATE + 1))) as allowance_exceeded,
            GREATEST(0, COALESCE(SUM(sm.cost), 0) - (%L * (%L::DATE - %L::DATE + 1)))::DECIMAL(10,2) as excess_amount
        FROM users u
        LEFT JOIN staff_meals sm ON u.id = sm.user_id 
            AND sm.meal_date BETWEEN %L AND %L
        WHERE u.start_date IS NOT NULL %s
        GROUP BY u.id, u.name
        ORDER BY total_cost DESC
    ', v_start_date, v_end_date, v_daily_allowance, v_end_date, v_start_date, 
       v_daily_allowance, v_end_date, v_start_date, v_start_date, v_end_date, v_user_filter);
END;
$$ LANGUAGE plpgsql;

-- ==================== INVENTORY AND PURCHASING PROCEDURES ====================

-- Procedure to process purchase order with approval workflow
CREATE OR REPLACE FUNCTION procedures.create_purchase_order(
    p_item_name VARCHAR(255),
    p_category VARCHAR(100),
    p_quantity DECIMAL(10,2),
    p_unit VARCHAR(50),
    p_unit_price DECIMAL(10,2),
    p_supplier VARCHAR(255),
    p_purchase_date DATE,
    p_delivery_date DATE,
    p_ordered_by_id UUID,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_total_price DECIMAL(10,2);
    v_orderer_roles TEXT[];
    v_requires_approval BOOLEAN := FALSE;
BEGIN
    -- Calculate total price
    v_total_price := p_quantity * p_unit_price;
    
    -- Get orderer roles
    SELECT roles INTO v_orderer_roles FROM users WHERE id = p_ordered_by_id;
    
    -- Determine if approval is needed
    IF v_total_price > 1000.00 THEN
        IF NOT ('manager' = ANY(v_orderer_roles) OR 'owner' = ANY(v_orderer_roles)) THEN
            v_requires_approval := TRUE;
        END IF;
    END IF;
    
    -- Create purchase record
    INSERT INTO purchases (
        item_name, category, quantity, unit, unit_price, supplier,
        purchase_date, delivery_date, ordered_by_id, notes, status
    ) VALUES (
        p_item_name, p_category, p_quantity, p_unit, p_unit_price, p_supplier,
        p_purchase_date, p_delivery_date, p_ordered_by_id, p_notes,
        CASE WHEN v_requires_approval THEN 'pending' ELSE 'ordered' END
    ) RETURNING id INTO v_purchase_id;
    
    -- Create approval notification if needed
    IF v_requires_approval THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        SELECT 
            id,
            'Purchase Order Approval Required',
            format('Purchase order for %s ($%.2f) requires your approval', p_item_name, v_total_price),
            'warning',
            jsonb_build_object('purchase_id', v_purchase_id, 'total_price', v_total_price)
        FROM users 
        WHERE 'manager' = ANY(roles) OR 'owner' = ANY(roles);
    END IF;
    
    -- Update supplier relationship
    INSERT INTO suppliers (name, categories, active)
    VALUES (p_supplier, ARRAY[p_category], TRUE)
    ON CONFLICT (name) DO UPDATE 
    SET categories = array_append(suppliers.categories, p_category),
        updated_at = CURRENT_TIMESTAMP
    WHERE NOT (p_category = ANY(suppliers.categories));
    
    -- Log purchase metric
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, table_name, user_id, metadata
    ) VALUES (
        'purchase_order_created', v_total_price, 'purchases', p_ordered_by_id,
        jsonb_build_object('purchase_id', v_purchase_id, 'requires_approval', v_requires_approval)
    );
    
    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== REPORTING PROCEDURES ====================

-- Procedure to generate comprehensive staff performance report
CREATE OR REPLACE FUNCTION procedures.generate_staff_report(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_station station_type DEFAULT NULL
) RETURNS TABLE (
    user_id UUID,
    name VARCHAR(255),
    station station_type,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    completion_rate DECIMAL(5,2),
    total_points INTEGER,
    avg_task_hours DECIMAL(5,2),
    disciplinary_actions INTEGER,
    meal_costs DECIMAL(10,2),
    performance_grade CHAR(1),
    recommendations TEXT
) AS $$
DECLARE
    v_start_date DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
    v_station_filter TEXT := CASE WHEN p_station IS NOT NULL THEN format('AND u.station = %L', p_station) ELSE '' END;
BEGIN
    RETURN QUERY EXECUTE format('
        WITH staff_metrics AS (
            SELECT 
                u.id,
                u.name,
                u.station,
                COUNT(t.id) as total_tasks,
                COUNT(CASE WHEN t.status = ''done'' THEN 1 END) as completed_tasks,
                CASE 
                    WHEN COUNT(t.id) = 0 THEN 0 
                    ELSE ROUND(COUNT(CASE WHEN t.status = ''done'' THEN 1 END)::DECIMAL / COUNT(t.id) * 100, 2) 
                END as completion_rate,
                COALESCE(SUM(CASE WHEN t.status = ''done'' THEN COALESCE(t.final_points, t.base_points) END), 0) as total_points,
                COALESCE(AVG(CASE 
                    WHEN t.status = ''done'' AND t.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 
                END), 0) as avg_task_hours,
                COALESCE(disc.disciplinary_count, 0) as disciplinary_actions,
                COALESCE(meals.total_cost, 0) as meal_costs
            FROM users u
            LEFT JOIN tasks t ON u.id = t.assignee_id 
                AND t.created_at BETWEEN %L AND %L + INTERVAL ''1 day'' - INTERVAL ''1 second''
            LEFT JOIN (
                SELECT target_user_id, COUNT(*) as disciplinary_count
                FROM disciplinary_actions 
                WHERE created_at BETWEEN %L AND %L + INTERVAL ''1 day'' - INTERVAL ''1 second''
                GROUP BY target_user_id
            ) disc ON u.id = disc.target_user_id
            LEFT JOIN (
                SELECT user_id, SUM(cost) as total_cost
                FROM staff_meals 
                WHERE meal_date BETWEEN %L AND %L
                GROUP BY user_id
            ) meals ON u.id = meals.user_id
            WHERE u.start_date IS NOT NULL %s
            GROUP BY u.id, u.name, u.station, disc.disciplinary_count, meals.total_cost
        )
        SELECT 
            sm.id,
            sm.name,
            sm.station,
            sm.total_tasks::INTEGER,
            sm.completed_tasks::INTEGER,
            sm.completion_rate,
            sm.total_points::INTEGER,
            sm.avg_task_hours::DECIMAL(5,2),
            sm.disciplinary_actions::INTEGER,
            sm.meal_costs::DECIMAL(10,2),
            CASE 
                WHEN sm.completion_rate >= 95 AND sm.disciplinary_actions = 0 AND sm.avg_task_hours <= 24 THEN ''A''
                WHEN sm.completion_rate >= 85 AND sm.disciplinary_actions <= 1 AND sm.avg_task_hours <= 48 THEN ''B''
                WHEN sm.completion_rate >= 70 AND sm.disciplinary_actions <= 2 THEN ''C''
                WHEN sm.completion_rate >= 50 THEN ''D''
                ELSE ''F''
            END as performance_grade,
            CASE 
                WHEN sm.completion_rate < 70 THEN ''Focus on task completion''
                WHEN sm.disciplinary_actions > 2 THEN ''Address behavioral issues''
                WHEN sm.avg_task_hours > 48 THEN ''Improve task efficiency''
                WHEN sm.completion_rate >= 95 THEN ''Excellent performance, consider advanced responsibilities''
                ELSE ''Good performance, maintain standards''
            END as recommendations
        FROM staff_metrics sm
        ORDER BY sm.completion_rate DESC, sm.total_points DESC
    ', v_start_date, v_end_date, v_start_date, v_end_date, v_start_date, v_end_date, v_station_filter);
END;
$$ LANGUAGE plpgsql;

-- ==================== MAINTENANCE PROCEDURES ====================

-- Procedure to cleanup old data and optimize performance
CREATE OR REPLACE FUNCTION procedures.maintenance_cleanup(
    p_dry_run BOOLEAN DEFAULT TRUE
) RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
    v_old_notifications INTEGER;
    v_old_audit_records INTEGER;
    v_completed_tasks INTEGER;
BEGIN
    -- Count records to be affected
    SELECT COUNT(*) INTO v_old_notifications 
    FROM notifications 
    WHERE read = true AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    SELECT COUNT(*) INTO v_old_audit_records 
    FROM audit.change_log 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    SELECT COUNT(*) INTO v_completed_tasks 
    FROM tasks 
    WHERE status = 'done' AND completed_at < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    v_result := format('Maintenance Report (Dry Run: %s):\n', p_dry_run);
    v_result := v_result || format('- Old notifications to clean: %s\n', v_old_notifications);
    v_result := v_result || format('- Old audit records to archive: %s\n', v_old_audit_records);
    v_result := v_result || format('- Completed tasks older than 6 months: %s\n', v_completed_tasks);
    
    IF NOT p_dry_run THEN
        -- Delete old read notifications
        DELETE FROM notifications 
        WHERE read = true AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
        
        -- Archive old audit records
        PERFORM archive_old_audit_data();
        
        -- Update statistics
        ANALYZE;
        
        -- Vacuum analyze key tables
        VACUUM ANALYZE tasks;
        VACUUM ANALYZE notifications;
        VACUUM ANALYZE audit.change_log;
        
        v_result := v_result || '\nCleanup completed successfully.';
        
        -- Log maintenance activity
        INSERT INTO audit.performance_metrics (
            metric_name, metric_value, metadata
        ) VALUES (
            'maintenance_cleanup_completed', 1,
            jsonb_build_object(
                'notifications_deleted', v_old_notifications,
                'audit_records_archived', v_old_audit_records
            )
        );
    ELSE
        v_result := v_result || '\nNo changes made (dry run mode).';
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Procedure to recompute user points and rankings
CREATE OR REPLACE FUNCTION procedures.recalculate_user_points() 
RETURNS INTEGER AS $$
DECLARE
    v_updated_users INTEGER := 0;
    v_user RECORD;
    v_total_points INTEGER;
    v_weekly_points INTEGER;
    v_monthly_points INTEGER;
BEGIN
    -- Process each user
    FOR v_user IN SELECT id FROM users WHERE start_date IS NOT NULL
    LOOP
        -- Calculate total points from completed tasks
        SELECT 
            COALESCE(SUM(COALESCE(final_points, base_points * multiplier + adjustment)), 0),
            COALESCE(SUM(CASE 
                WHEN completed_at >= DATE_TRUNC('week', CURRENT_TIMESTAMP) 
                THEN COALESCE(final_points, base_points * multiplier + adjustment) 
                ELSE 0 
            END), 0),
            COALESCE(SUM(CASE 
                WHEN completed_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP) 
                THEN COALESCE(final_points, base_points * multiplier + adjustment) 
                ELSE 0 
            END), 0)
        INTO v_total_points, v_weekly_points, v_monthly_points
        FROM tasks 
        WHERE assignee_id = v_user.id AND status = 'done';
        
        -- Subtract disciplinary points
        SELECT 
            v_total_points - COALESCE(SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END), 0),
            v_weekly_points - COALESCE(SUM(CASE 
                WHEN points < 0 AND created_at >= DATE_TRUNC('week', CURRENT_TIMESTAMP) 
                THEN ABS(points) ELSE 0 
            END), 0),
            v_monthly_points - COALESCE(SUM(CASE 
                WHEN points < 0 AND created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP) 
                THEN ABS(points) ELSE 0 
            END), 0)
        INTO v_total_points, v_weekly_points, v_monthly_points
        FROM disciplinary_actions 
        WHERE target_user_id = v_user.id;
        
        -- Update user points
        UPDATE users 
        SET 
            points = GREATEST(0, v_total_points),
            weekly_points = GREATEST(0, v_weekly_points),
            monthly_points = GREATEST(0, v_monthly_points),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_user.id
        AND (points != GREATEST(0, v_total_points) 
             OR weekly_points != GREATEST(0, v_weekly_points)
             OR monthly_points != GREATEST(0, v_monthly_points));
        
        IF FOUND THEN
            v_updated_users := v_updated_users + 1;
        END IF;
    END LOOP;
    
    -- Log the recalculation
    INSERT INTO audit.performance_metrics (
        metric_name, metric_value, metadata
    ) VALUES (
        'user_points_recalculated', v_updated_users,
        jsonb_build_object('recalculation_date', CURRENT_TIMESTAMP)
    );
    
    RETURN v_updated_users;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on procedures to appropriate roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA procedures TO PUBLIC;

-- Create procedure for automated daily tasks (can be scheduled)
CREATE OR REPLACE FUNCTION procedures.daily_automated_tasks()
RETURNS TEXT AS $$
DECLARE
    v_result TEXT := '';
BEGIN
    -- Reset weekly points on Monday
    IF EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN
        PERFORM procedures.reset_periodic_points('weekly');
        v_result := v_result || 'Weekly points reset. ';
    END IF;
    
    -- Reset monthly points on first day of month
    IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
        PERFORM procedures.reset_periodic_points('monthly');
        v_result := v_result || 'Monthly points reset. ';
    END IF;
    
    -- Run maintenance on Sundays
    IF EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN
        PERFORM procedures.maintenance_cleanup(FALSE);
        v_result := v_result || 'Maintenance cleanup completed. ';
    END IF;
    
    -- Refresh materialized views
    PERFORM refresh_materialized_views();
    v_result := v_result || 'Views refreshed. ';
    
    RETURN COALESCE(NULLIF(v_result, ''), 'No automated tasks executed today.');
END;
$$ LANGUAGE plpgsql;

COMMIT;