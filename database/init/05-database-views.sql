-- Comprehensive Database Views for Business Intelligence and Reporting
-- Optimized views for common queries and dashboards

-- Create a reporting schema for views
CREATE SCHEMA IF NOT EXISTS reporting;

-- ==================== USER MANAGEMENT VIEWS ====================

-- Active staff overview with performance metrics
CREATE VIEW reporting.active_staff_overview AS
SELECT 
    u.id,
    u.name,
    u.roles,
    u.station,
    u.start_date,
    u.phone,
    u.points,
    u.weekly_points,
    u.monthly_points,
    EXTRACT(DAYS FROM CURRENT_DATE - u.start_date) as days_employed,
    
    -- Task statistics
    COALESCE(task_stats.total_tasks, 0) as total_tasks_assigned,
    COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
    COALESCE(task_stats.overdue_tasks, 0) as overdue_tasks,
    COALESCE(task_stats.avg_completion_hours, 0) as avg_task_completion_hours,
    
    -- Performance metrics
    CASE 
        WHEN COALESCE(task_stats.total_tasks, 0) = 0 THEN 0
        ELSE ROUND((COALESCE(task_stats.completed_tasks, 0)::DECIMAL / task_stats.total_tasks * 100), 2)
    END as completion_rate_percent,
    
    -- Disciplinary record
    COALESCE(disc_stats.total_actions, 0) as disciplinary_actions,
    COALESCE(disc_stats.total_points_deducted, 0) as points_deducted,
    
    -- Recent activity
    last_task_completion.last_task_completed,
    last_task_completion.days_since_last_task,
    
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN (
    SELECT 
        assignee_id,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
        AVG(CASE 
            WHEN completed_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (completed_at - created_at))/3600 
        END) as avg_completion_hours
    FROM tasks 
    WHERE assignee_id IS NOT NULL
    GROUP BY assignee_id
) task_stats ON u.id = task_stats.assignee_id
LEFT JOIN (
    SELECT 
        target_user_id,
        COUNT(*) as total_actions,
        SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as total_points_deducted
    FROM disciplinary_actions 
    GROUP BY target_user_id
) disc_stats ON u.id = disc_stats.target_user_id
LEFT JOIN (
    SELECT 
        assignee_id,
        MAX(completed_at) as last_task_completed,
        EXTRACT(DAYS FROM CURRENT_TIMESTAMP - MAX(completed_at)) as days_since_last_task
    FROM tasks 
    WHERE status = 'done' AND assignee_id IS NOT NULL
    GROUP BY assignee_id
) last_task_completion ON u.id = last_task_completion.assignee_id
WHERE u.start_date IS NOT NULL
ORDER BY u.points DESC, u.name;

-- User skills matrix with proficiency levels
CREATE VIEW reporting.user_skills_matrix AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.station,
    s.id as skill_id,
    s.name as skill_name,
    s.category as skill_category,
    us.proficiency_level,
    us.certified,
    us.certification_date,
    CASE us.proficiency_level
        WHEN 1 THEN 'Beginner'
        WHEN 2 THEN 'Basic' 
        WHEN 3 THEN 'Intermediate'
        WHEN 4 THEN 'Advanced'
        WHEN 5 THEN 'Expert'
    END as proficiency_label,
    us.created_at as skill_acquired_date,
    us.notes
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
WHERE u.start_date IS NOT NULL
ORDER BY u.name, s.category, s.name;

-- ==================== TASK MANAGEMENT VIEWS ====================

-- Comprehensive task dashboard
CREATE VIEW reporting.task_dashboard AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.station,
    t.status,
    t.due_date,
    t.due_time,
    t.base_points,
    t.final_points,
    t.multiplier,
    t.adjustment,
    t.overdue_days,
    t.proof_type,
    t.repeat_schedule,
    
    -- User information
    assigner.name as assigner_name,
    assigner.roles as assigner_roles,
    assignee.name as assignee_name,
    assignee.station as assignee_station,
    assignee.roles as assignee_roles,
    
    -- Timing metrics
    t.created_at,
    t.completed_at,
    t.approved_at,
    CASE 
        WHEN t.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 
    END as completion_hours,
    CASE 
        WHEN t.approved_at IS NOT NULL AND t.completed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (t.approved_at - t.completed_at))/3600 
    END as approval_hours,
    
    -- Status indicators
    CASE 
        WHEN t.status = 'done' THEN 'Completed'
        WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('done') THEN 'Overdue'
        WHEN t.due_date = CURRENT_DATE AND t.status NOT IN ('done') THEN 'Due Today'
        WHEN t.due_date = CURRENT_DATE + 1 AND t.status NOT IN ('done') THEN 'Due Tomorrow'
        WHEN t.status = 'in-progress' THEN 'In Progress'
        ELSE 'Pending'
    END as urgency_status,
    
    -- Calculated final points
    COALESCE(t.final_points, t.base_points * t.multiplier + t.adjustment) as calculated_points,
    
    t.updated_at
FROM tasks t
JOIN users assigner ON t.assigner_id = assigner.id
LEFT JOIN users assignee ON t.assignee_id = assignee.id
ORDER BY 
    CASE t.status 
        WHEN 'overdue' THEN 1
        WHEN 'in-progress' THEN 2
        WHEN 'open' THEN 3
        WHEN 'on-hold' THEN 4
        WHEN 'pending-review' THEN 5
        WHEN 'done' THEN 6
    END,
    t.due_date ASC,
    t.created_at DESC;

-- Task completion analytics
CREATE VIEW reporting.task_completion_analytics AS
SELECT 
    t.station,
    DATE_TRUNC('week', t.completed_at) as completion_week,
    DATE_TRUNC('month', t.completed_at) as completion_month,
    
    COUNT(*) as tasks_completed,
    AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_completion_hours,
    SUM(COALESCE(t.final_points, t.base_points * t.multiplier + t.adjustment)) as total_points_earned,
    AVG(COALESCE(t.final_points, t.base_points * t.multiplier + t.adjustment)) as avg_points_per_task,
    
    -- Quality metrics
    COUNT(CASE WHEN t.overdue_days = 0 THEN 1 END) as on_time_completions,
    COUNT(CASE WHEN t.overdue_days > 0 THEN 1 END) as late_completions,
    ROUND(COUNT(CASE WHEN t.overdue_days = 0 THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as on_time_rate,
    
    -- Top performers
    STRING_AGG(DISTINCT u.name, ', ' ORDER BY u.name) as completing_staff
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.status = 'done' AND t.completed_at IS NOT NULL
GROUP BY t.station, DATE_TRUNC('week', t.completed_at), DATE_TRUNC('month', t.completed_at)
ORDER BY completion_month DESC, completion_week DESC, t.station;

-- ==================== FINANCIAL VIEWS ====================

-- Staff meal cost analysis
CREATE VIEW reporting.staff_meal_costs AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.station,
    DATE_TRUNC('month', sm.meal_date) as cost_month,
    DATE_TRUNC('week', sm.meal_date) as cost_week,
    
    COUNT(*) as total_meals,
    SUM(COALESCE(sm.cost, 0)) as total_cost,
    AVG(COALESCE(sm.cost, 0)) as avg_meal_cost,
    MAX(COALESCE(sm.cost, 0)) as max_meal_cost,
    
    -- Meal type breakdown
    COUNT(CASE WHEN sm.meal_type = 'breakfast' THEN 1 END) as breakfast_count,
    COUNT(CASE WHEN sm.meal_type = 'lunch' THEN 1 END) as lunch_count,
    COUNT(CASE WHEN sm.meal_type = 'dinner' THEN 1 END) as dinner_count,
    COUNT(CASE WHEN sm.meal_type = 'snack' THEN 1 END) as snack_count,
    
    SUM(CASE WHEN sm.meal_type = 'breakfast' THEN COALESCE(sm.cost, 0) END) as breakfast_cost,
    SUM(CASE WHEN sm.meal_type = 'lunch' THEN COALESCE(sm.cost, 0) END) as lunch_cost,
    SUM(CASE WHEN sm.meal_type = 'dinner' THEN COALESCE(sm.cost, 0) END) as dinner_cost,
    SUM(CASE WHEN sm.meal_type = 'snack' THEN COALESCE(sm.cost, 0) END) as snack_cost
FROM staff_meals sm
JOIN users u ON sm.user_id = u.id
WHERE sm.cost IS NOT NULL
GROUP BY u.id, u.name, u.station, DATE_TRUNC('month', sm.meal_date), DATE_TRUNC('week', sm.meal_date)
ORDER BY cost_month DESC, cost_week DESC, total_cost DESC;

-- Purchase analysis and supplier performance
CREATE VIEW reporting.purchase_analysis AS
SELECT 
    p.supplier,
    p.category,
    DATE_TRUNC('month', p.purchase_date) as purchase_month,
    
    COUNT(*) as total_purchases,
    SUM(p.total_price) as total_spent,
    AVG(p.total_price) as avg_purchase_amount,
    SUM(p.quantity) as total_quantity,
    
    -- Delivery performance
    COUNT(CASE WHEN p.status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN p.status = 'cancelled' THEN 1 END) as cancelled_count,
    AVG(CASE 
        WHEN p.delivery_date IS NOT NULL AND p.purchase_date IS NOT NULL 
        THEN p.delivery_date - p.purchase_date 
    END) as avg_delivery_days,
    
    -- Quality metrics
    ROUND(COUNT(CASE WHEN p.status = 'delivered' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as delivery_success_rate,
    COUNT(CASE WHEN p.delivery_date > p.purchase_date + INTERVAL '7 days' THEN 1 END) as late_deliveries,
    
    -- Cost trends
    STRING_AGG(DISTINCT u.name, ', ') as ordering_staff
FROM purchases p
LEFT JOIN users u ON p.ordered_by_id = u.id
WHERE p.supplier IS NOT NULL
GROUP BY p.supplier, p.category, DATE_TRUNC('month', p.purchase_date)
ORDER BY purchase_month DESC, total_spent DESC;

-- Cash reconciliation summary
CREATE VIEW reporting.cash_reconciliation_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.station,
    DATE_TRUNC('month', cr.reconciliation_date) as reconciliation_month,
    
    COUNT(*) as total_reconciliations,
    SUM(cr.expected_amount) as total_expected,
    SUM(cr.actual_amount) as total_actual,
    SUM(cr.difference) as total_difference,
    ABS(SUM(cr.difference)) as total_abs_difference,
    AVG(cr.difference) as avg_difference,
    
    -- Accuracy metrics
    COUNT(CASE WHEN ABS(cr.difference) <= 5.00 THEN 1 END) as accurate_reconciliations,
    COUNT(CASE WHEN cr.difference > 0 THEN 1 END) as surplus_count,
    COUNT(CASE WHEN cr.difference < 0 THEN 1 END) as shortage_count,
    ROUND(COUNT(CASE WHEN ABS(cr.difference) <= 5.00 THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as accuracy_rate,
    
    -- Approval status
    COUNT(CASE WHEN cr.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN cr.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) as pending_count,
    
    MAX(cr.reconciliation_date) as last_reconciliation_date
FROM cash_reconciliations cr
JOIN users u ON cr.user_id = u.id
GROUP BY u.id, u.name, u.station, DATE_TRUNC('month', cr.reconciliation_date)
ORDER BY reconciliation_month DESC, total_abs_difference DESC;

-- ==================== OPERATIONAL VIEWS ====================

-- Order management dashboard
CREATE VIEW reporting.order_management AS
SELECT 
    oo.id,
    oo.order_number,
    oo.customer_name,
    oo.customer_phone,
    oo.customer_email,
    oo.status,
    oo.total_amount,
    oo.order_time,
    oo.delivery_time,
    
    -- Staff assignment
    assigned_staff.name as assigned_to_name,
    assigned_staff.station as assigned_to_station,
    
    -- Order timing
    EXTRACT(EPOCH FROM (oo.delivery_time - oo.order_time))/60 as total_processing_minutes,
    CASE 
        WHEN oo.status = 'delivered' AND oo.delivery_time IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (oo.delivery_time - oo.order_time))/60
    END as actual_delivery_time_minutes,
    
    -- Status indicators
    CASE 
        WHEN oo.status = 'cancelled' THEN 'Cancelled'
        WHEN oo.status = 'delivered' THEN 'Completed'
        WHEN oo.delivery_time < CURRENT_TIMESTAMP AND oo.status != 'delivered' THEN 'Late'
        WHEN oo.delivery_time IS NOT NULL AND oo.delivery_time <= CURRENT_TIMESTAMP + INTERVAL '30 minutes' THEN 'Due Soon'
        ELSE 'On Track'
    END as delivery_status,
    
    -- Order items summary
    jsonb_array_length(oo.items) as item_count,
    
    oo.created_at,
    oo.updated_at
FROM online_orders oo
LEFT JOIN users assigned_staff ON oo.assigned_to_id = assigned_staff.id
ORDER BY 
    CASE oo.status 
        WHEN 'preparing' THEN 1
        WHEN 'ready' THEN 2
        WHEN 'out-for-delivery' THEN 3
        WHEN 'confirmed' THEN 4
        WHEN 'pending' THEN 5
        WHEN 'delivered' THEN 6
        WHEN 'cancelled' THEN 7
    END,
    oo.delivery_time ASC NULLS LAST,
    oo.order_time DESC;

-- Waste and disposal analysis
CREATE VIEW reporting.waste_disposal_analysis AS
SELECT 
    d.category,
    DATE_TRUNC('month', d.disposal_date) as disposal_month,
    DATE_TRUNC('week', d.disposal_date) as disposal_week,
    
    COUNT(*) as disposal_count,
    SUM(d.quantity) as total_quantity_disposed,
    SUM(COALESCE(d.estimated_value, 0)) as total_estimated_value,
    AVG(COALESCE(d.estimated_value, 0)) as avg_item_value,
    
    -- Reason analysis
    COUNT(CASE WHEN LOWER(d.reason) LIKE '%expired%' THEN 1 END) as expiry_disposals,
    COUNT(CASE WHEN LOWER(d.reason) LIKE '%damaged%' THEN 1 END) as damage_disposals,
    COUNT(CASE WHEN LOWER(d.reason) LIKE '%contaminated%' THEN 1 END) as contamination_disposals,
    COUNT(CASE WHEN LOWER(d.reason) LIKE '%excess%' OR LOWER(d.reason) LIKE '%surplus%' THEN 1 END) as excess_disposals,
    
    -- Staff involved
    STRING_AGG(DISTINCT disposer.name, ', ') as disposing_staff,
    STRING_AGG(DISTINCT verifier.name, ', ') as verifying_staff,
    
    -- Top disposal reasons
    MODE() WITHIN GROUP (ORDER BY d.reason) as most_common_reason
FROM disposals d
LEFT JOIN users disposer ON d.disposed_by_id = disposer.id
LEFT JOIN users verifier ON d.verified_by_id = verifier.id
GROUP BY d.category, DATE_TRUNC('month', d.disposal_date), DATE_TRUNC('week', d.disposal_date)
ORDER BY disposal_month DESC, disposal_week DESC, total_estimated_value DESC;

-- Issue tracking and resolution
CREATE VIEW reporting.issue_tracking AS
SELECT 
    i.id,
    i.title,
    i.description,
    i.category,
    i.priority,
    i.status,
    i.location,
    
    -- People involved
    reporter.name as reported_by_name,
    reporter.station as reporter_station,
    assignee.name as assigned_to_name,
    assignee.station as assignee_station,
    
    -- Timing metrics
    i.created_at,
    i.resolved_at,
    CASE 
        WHEN i.resolved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600 
    END as resolution_hours,
    EXTRACT(EPOCH FROM (COALESCE(i.resolved_at, CURRENT_TIMESTAMP) - i.created_at))/24 as age_days,
    
    -- Status indicators
    CASE 
        WHEN i.status = 'resolved' THEN 'Resolved'
        WHEN i.status = 'closed' THEN 'Closed'
        WHEN i.priority = 'critical' AND i.status NOT IN ('resolved', 'closed') THEN 'Critical Open'
        WHEN i.priority = 'high' AND i.status NOT IN ('resolved', 'closed') THEN 'High Priority Open'
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - i.created_at))/24 > 7 AND i.status NOT IN ('resolved', 'closed') THEN 'Overdue'
        ELSE 'Active'
    END as urgency_status,
    
    i.resolution,
    i.updated_at
FROM issues i
JOIN users reporter ON i.reported_by_id = reporter.id
LEFT JOIN users assignee ON i.assigned_to_id = assignee.id
ORDER BY 
    CASE i.priority 
        WHEN 'critical' THEN 1
        WHEN 'urgent' THEN 2
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 4
        WHEN 'low' THEN 5
    END,
    CASE i.status 
        WHEN 'open' THEN 1
        WHEN 'in-progress' THEN 2
        WHEN 'on-hold' THEN 3
        WHEN 'resolved' THEN 4
        WHEN 'closed' THEN 5
    END,
    i.created_at DESC;

-- ==================== AUDIT AND COMPLIANCE VIEWS ====================

-- Recent activity log
CREATE VIEW reporting.recent_activity AS
SELECT 
    cl.id,
    cl.table_name,
    cl.record_id,
    CASE cl.operation 
        WHEN 'I' THEN 'Created'
        WHEN 'U' THEN 'Updated' 
        WHEN 'D' THEN 'Deleted'
    END as operation_type,
    cl.changed_fields,
    cl.user_id,
    u.name as user_name,
    cl.user_role,
    cl.timestamp,
    cl.application_name,
    
    -- Extract meaningful information from the changes
    CASE cl.table_name
        WHEN 'tasks' THEN 
            COALESCE(cl.new_values->>'title', cl.old_values->>'title', 'Unknown Task')
        WHEN 'users' THEN 
            COALESCE(cl.new_values->>'name', cl.old_values->>'name', 'Unknown User')
        WHEN 'online_orders' THEN 
            COALESCE(cl.new_values->>'order_number', cl.old_values->>'order_number', 'Unknown Order')
        ELSE 'Record'
    END as record_description,
    
    -- Summary of changes
    CASE 
        WHEN cl.operation = 'I' THEN 'New record created'
        WHEN cl.operation = 'D' THEN 'Record deleted'
        WHEN cl.operation = 'U' AND cl.changed_fields IS NOT NULL THEN 
            'Updated: ' || array_to_string(cl.changed_fields, ', ')
        ELSE 'Modified'
    END as change_summary
FROM audit.change_log cl
LEFT JOIN users u ON cl.user_id = u.id
WHERE cl.timestamp >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY cl.timestamp DESC;

-- Sensitive data access report
CREATE VIEW reporting.sensitive_data_access AS
SELECT 
    sfa.id,
    sfa.table_name,
    sfa.field_name,
    sfa.record_id,
    sfa.access_type,
    u.name as accessor_name,
    u.roles as accessor_roles,
    sfa.old_value,
    sfa.new_value,
    sfa.reason,
    sfa.timestamp,
    
    -- Context from related tables
    CASE sfa.table_name
        WHEN 'users' THEN target_user.name
        ELSE 'N/A'
    END as target_record_name
FROM audit.sensitive_field_access sfa
LEFT JOIN users u ON sfa.user_id = u.id
LEFT JOIN users target_user ON sfa.table_name = 'users' AND sfa.record_id = target_user.id
ORDER BY sfa.timestamp DESC;

-- ==================== PERFORMANCE AND ANALYTICS VIEWS ====================

-- Daily operational metrics
CREATE VIEW reporting.daily_metrics AS
SELECT 
    metric_date,
    
    -- Task metrics
    total_tasks_created,
    total_tasks_completed,
    avg_task_completion_hours,
    overdue_tasks,
    
    -- Order metrics
    total_orders,
    total_order_value,
    avg_order_processing_minutes,
    cancelled_orders,
    
    -- Staff metrics
    active_staff_count,
    total_staff_meals,
    total_meal_costs,
    
    -- Operational metrics
    new_issues_reported,
    issues_resolved,
    total_disposals_value,
    
    -- Financial metrics
    total_purchases_value,
    cash_reconciliation_accuracy
FROM (
    SELECT 
        CURRENT_DATE as metric_date,
        
        -- Task metrics
        (SELECT COUNT(*) FROM tasks WHERE DATE(created_at) = CURRENT_DATE) as total_tasks_created,
        (SELECT COUNT(*) FROM tasks WHERE DATE(completed_at) = CURRENT_DATE) as total_tasks_completed,
        (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) 
         FROM tasks WHERE DATE(completed_at) = CURRENT_DATE) as avg_task_completion_hours,
        (SELECT COUNT(*) FROM tasks WHERE status = 'overdue') as overdue_tasks,
        
        -- Order metrics
        (SELECT COUNT(*) FROM online_orders WHERE DATE(order_time) = CURRENT_DATE) as total_orders,
        (SELECT SUM(total_amount) FROM online_orders WHERE DATE(order_time) = CURRENT_DATE) as total_order_value,
        (SELECT AVG(EXTRACT(EPOCH FROM (delivery_time - order_time))/60) 
         FROM online_orders WHERE DATE(order_time) = CURRENT_DATE AND delivery_time IS NOT NULL) as avg_order_processing_minutes,
        (SELECT COUNT(*) FROM online_orders WHERE DATE(order_time) = CURRENT_DATE AND status = 'cancelled') as cancelled_orders,
        
        -- Staff metrics
        (SELECT COUNT(*) FROM users WHERE start_date IS NOT NULL) as active_staff_count,
        (SELECT COUNT(*) FROM staff_meals WHERE meal_date = CURRENT_DATE) as total_staff_meals,
        (SELECT SUM(cost) FROM staff_meals WHERE meal_date = CURRENT_DATE) as total_meal_costs,
        
        -- Operational metrics
        (SELECT COUNT(*) FROM issues WHERE DATE(created_at) = CURRENT_DATE) as new_issues_reported,
        (SELECT COUNT(*) FROM issues WHERE DATE(resolved_at) = CURRENT_DATE) as issues_resolved,
        (SELECT SUM(estimated_value) FROM disposals WHERE disposal_date = CURRENT_DATE) as total_disposals_value,
        
        -- Financial metrics
        (SELECT SUM(total_price) FROM purchases WHERE purchase_date = CURRENT_DATE) as total_purchases_value,
        (SELECT ROUND(COUNT(CASE WHEN ABS(difference) <= 5.00 THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) 
         FROM cash_reconciliations WHERE reconciliation_date = CURRENT_DATE) as cash_reconciliation_accuracy
) metrics;

-- Grant appropriate permissions on views
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO PUBLIC;

-- Create materialized views for expensive queries (refresh periodically)
CREATE MATERIALIZED VIEW reporting.monthly_performance_summary AS
SELECT 
    DATE_TRUNC('month', CURRENT_DATE) as month,
    
    -- Task performance
    COUNT(t.*) as total_tasks,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
    AVG(CASE WHEN t.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 END) as avg_completion_hours,
    SUM(COALESCE(t.final_points, t.base_points)) as total_points_earned,
    
    -- Financial summary
    SUM(oo.total_amount) as total_revenue,
    SUM(p.total_price) as total_purchases,
    SUM(sm.cost) as total_meal_costs,
    SUM(d.estimated_value) as total_waste_value,
    
    -- Staff metrics
    COUNT(DISTINCT t.assignee_id) as active_staff,
    COUNT(DISTINCT da.target_user_id) as staff_with_disciplinary_actions,
    
    -- Operational metrics
    COUNT(i.*) as total_issues,
    COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as resolved_issues
FROM tasks t
FULL OUTER JOIN online_orders oo ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', oo.order_time)
FULL OUTER JOIN purchases p ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', p.purchase_date)  
FULL OUTER JOIN staff_meals sm ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', sm.meal_date)
FULL OUTER JOIN disposals d ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', d.disposal_date)
FULL OUTER JOIN disciplinary_actions da ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', da.created_at)
FULL OUTER JOIN issues i ON DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', i.created_at)
WHERE DATE_TRUNC('month', COALESCE(t.created_at, oo.order_time, p.purchase_date, sm.meal_date, d.disposal_date, da.created_at, i.created_at)) 
      >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', CURRENT_DATE);

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW reporting.monthly_performance_summary;
    -- Add other materialized views here as they're created
    
    RAISE NOTICE 'Materialized views refreshed at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Schedule regular refresh (requires pg_cron)
-- SELECT cron.schedule('refresh-materialized-views', '0 1 * * *', 'SELECT refresh_materialized_views();');

COMMIT;