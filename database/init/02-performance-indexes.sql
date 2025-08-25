-- Advanced Performance Indexes
-- Created by DBA-level optimization

-- Drop existing basic indexes if they exist (will be replaced with better ones)
DROP INDEX IF EXISTS idx_users_roles;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_station;
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_online_orders_status;
DROP INDEX IF EXISTS idx_cash_reconciliations_date;
DROP INDEX IF EXISTS idx_staff_meals_user_date;

-- ==================== USERS TABLE INDEXES ====================

-- Composite index for role-based queries with station
CREATE INDEX idx_users_roles_station_active ON users USING GIN(roles) INCLUDE (station, created_at) 
WHERE created_at IS NOT NULL;

-- Index for user lookup by phone (unique users by phone)
CREATE UNIQUE INDEX idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;

-- Index for points leaderboard queries
CREATE INDEX idx_users_points_desc ON users(points DESC, weekly_points DESC, monthly_points DESC);

-- Partial index for active staff with start date
CREATE INDEX idx_users_active_staff ON users(start_date, station, roles) 
WHERE start_date IS NOT NULL AND 'staff' = ANY(roles);

-- Text search index for user names
CREATE INDEX idx_users_name_gin ON users USING GIN(to_tsvector('english', name));

-- ==================== TASKS TABLE INDEXES ====================

-- Comprehensive composite index for task management dashboard
CREATE INDEX idx_tasks_status_station_due ON tasks(status, station, due_date, assignee_id) 
INCLUDE (title, base_points, final_points);

-- Index for overdue tasks analysis
CREATE INDEX idx_tasks_overdue ON tasks(due_date, status, overdue_days) 
WHERE status IN ('open', 'in-progress', 'on-hold') AND due_date < CURRENT_DATE;

-- Index for assignee workload analysis
CREATE INDEX idx_tasks_assignee_status_points ON tasks(assignee_id, status) 
INCLUDE (base_points, final_points, due_date) WHERE assignee_id IS NOT NULL;

-- Index for assigner task creation patterns
CREATE INDEX idx_tasks_assigner_created ON tasks(assigner_id, created_at DESC) 
INCLUDE (station, status, base_points);

-- Index for repeat task scheduling
CREATE INDEX idx_tasks_repeat_schedule ON tasks(repeat_schedule, due_date) 
WHERE repeat_schedule IS NOT NULL;

-- Partial index for completed tasks with timing analysis
CREATE INDEX idx_tasks_completed_timing ON tasks(completed_at, approved_at) 
WHERE completed_at IS NOT NULL;

-- Index for proof verification workflow
CREATE INDEX idx_tasks_proof_verification ON tasks(proof_type, status) 
WHERE proof_type != 'none' AND status IN ('pending-review', 'done');

-- ==================== RECIPES TABLE INDEXES ====================

-- Composite index for recipe search and filtering
CREATE INDEX idx_recipes_category_cuisine_station ON recipes(category, cuisine, station) 
INCLUDE (name, yield, prep_time);

-- GIN index for ingredient searches
CREATE INDEX idx_recipes_ingredients_gin ON recipes USING GIN(ingredients);

-- GIN index for tags search
CREATE INDEX idx_recipes_tags_gin ON recipes USING GIN(tags);

-- Index for allergen filtering
CREATE INDEX idx_recipes_allergens_gin ON recipes USING GIN(allergens) 
WHERE cardinality(allergens) > 0;

-- Text search for recipe names and notes
CREATE INDEX idx_recipes_text_search ON recipes USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(notes, ''))
);

-- Index for recipe creation/modification tracking
CREATE INDEX idx_recipes_author_date ON recipes(created_by, created_at DESC, updated_by, updated_at DESC);

-- ==================== STAFF MEALS TABLE INDEXES ====================

-- Composite index for meal cost analysis
CREATE INDEX idx_staff_meals_user_date_cost ON staff_meals(user_id, meal_date DESC) 
INCLUDE (meal_type, cost, meal_time);

-- Index for daily meal planning and cost tracking
CREATE INDEX idx_staff_meals_date_type_cost ON staff_meals(meal_date, meal_type) 
INCLUDE (cost) WHERE cost IS NOT NULL;

-- Index for monthly cost aggregations
CREATE INDEX idx_staff_meals_monthly_cost ON staff_meals(date_trunc('month', meal_date), cost) 
WHERE cost IS NOT NULL;

-- ==================== ONLINE ORDERS TABLE INDEXES ====================

-- Composite index for order management
CREATE INDEX idx_orders_status_time ON online_orders(status, order_time DESC) 
INCLUDE (customer_name, total_amount, assigned_to_id);

-- Index for delivery scheduling
CREATE INDEX idx_orders_delivery_assigned ON online_orders(delivery_time, assigned_to_id) 
WHERE delivery_time IS NOT NULL;

-- Index for customer order history
CREATE INDEX idx_orders_customer_history ON online_orders(customer_phone, customer_email, order_time DESC) 
WHERE customer_phone IS NOT NULL OR customer_email IS NOT NULL;

-- Index for revenue analysis
CREATE INDEX idx_orders_daily_revenue ON online_orders(DATE(order_time), status) 
INCLUDE (total_amount) WHERE status = 'delivered';

-- GIN index for order items analysis
CREATE INDEX idx_orders_items_gin ON online_orders USING GIN(items);

-- ==================== PURCHASES TABLE INDEXES ====================

-- Index for purchase analysis by supplier and category
CREATE INDEX idx_purchases_supplier_category ON purchases(supplier, category, purchase_date DESC) 
INCLUDE (total_price, status);

-- Index for cost analysis and budgeting
CREATE INDEX idx_purchases_date_category_cost ON purchases(purchase_date DESC, category) 
INCLUDE (total_price, ordered_by_id);

-- Index for delivery tracking
CREATE INDEX idx_purchases_delivery_status ON purchases(delivery_date, status) 
WHERE delivery_date IS NOT NULL;

-- Index for supplier performance analysis
CREATE INDEX idx_purchases_supplier_performance ON purchases(supplier, status, delivery_date, purchase_date);

-- ==================== DISCIPLINARY ACTIONS INDEXES ====================

-- Index for employee disciplinary history
CREATE INDEX idx_disciplinary_user_date ON disciplinary_actions(target_user_id, created_at DESC) 
INCLUDE (type, points, reason);

-- Index for management reporting
CREATE INDEX idx_disciplinary_creator_type ON disciplinary_actions(created_by_id, type, created_at DESC);

-- ==================== CASH RECONCILIATION INDEXES ====================

-- Index for reconciliation tracking and analysis
CREATE INDEX idx_cash_recon_date_status ON cash_reconciliations(reconciliation_date DESC, status) 
INCLUDE (user_id, difference, actual_amount);

-- Index for user reconciliation history
CREATE INDEX idx_cash_recon_user_history ON cash_reconciliations(user_id, reconciliation_date DESC) 
INCLUDE (status, difference);

-- ==================== ISSUES TABLE INDEXES ====================

-- Composite index for issue management dashboard
CREATE INDEX idx_issues_status_priority ON issues(status, priority, created_at DESC) 
INCLUDE (category, assigned_to_id, reported_by_id);

-- Index for location-based issue tracking
CREATE INDEX idx_issues_location_status ON issues(location, status) 
WHERE location IS NOT NULL;

-- Index for assignment workflow
CREATE INDEX idx_issues_assigned_status ON issues(assigned_to_id, status, created_at DESC) 
WHERE assigned_to_id IS NOT NULL;

-- ==================== NOTIFICATIONS TABLE INDEXES ====================

-- Optimized index for user notification retrieval
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, read, created_at DESC) 
INCLUDE (title, type);

-- Index for notification cleanup and maintenance
CREATE INDEX idx_notifications_cleanup ON notifications(read, created_at) 
WHERE read = true;

-- ==================== SKILLS AND USER_SKILLS INDEXES ====================

-- Index for skills search and categorization
CREATE INDEX idx_skills_category_name ON skills(category, name) 
INCLUDE (description);

-- Index for user skill matrix queries
CREATE INDEX idx_user_skills_proficiency ON user_skills(user_id, proficiency_level DESC, certified) 
INCLUDE (skill_id, certification_date);

-- Index for skill gap analysis
CREATE INDEX idx_user_skills_skill_proficiency ON user_skills(skill_id, proficiency_level DESC, certified);

-- ==================== SALARY RECORDS INDEXES ====================

-- Index for payroll processing and period queries
CREATE INDEX idx_salary_period_user ON salary_records(period_end DESC, period_start, user_id) 
INCLUDE (total_salary, status);

-- Index for approval workflow
CREATE INDEX idx_salary_status_approval ON salary_records(status, approved_by_id) 
WHERE status = 'pending';

-- ==================== SUPPLIERS TABLE INDEXES ====================

-- Index for active supplier management
CREATE INDEX idx_suppliers_active_categories ON suppliers(active, categories) 
USING GIN(categories) WHERE active = true;

-- Text search for supplier information
CREATE INDEX idx_suppliers_text_search ON suppliers USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(contact_person, '') || ' ' || COALESCE(address, ''))
) WHERE active = true;

-- ==================== DISPOSALS TABLE INDEXES ====================

-- Index for disposal tracking and analysis
CREATE INDEX idx_disposals_date_category ON disposals(disposal_date DESC, category) 
INCLUDE (estimated_value, disposed_by_id);

-- Index for waste analysis by user
CREATE INDEX idx_disposals_user_value ON disposals(disposed_by_id, disposal_date DESC) 
INCLUDE (estimated_value) WHERE estimated_value IS NOT NULL;

-- ==================== SPECIALIZED FUNCTIONAL INDEXES ====================

-- Functional index for task completion rate analysis
CREATE INDEX idx_task_completion_rate ON tasks((
  CASE 
    WHEN status = 'done' AND completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (completed_at - created_at))/3600 
    ELSE NULL 
  END
)) WHERE status = 'done';

-- Functional index for order processing time
CREATE INDEX idx_order_processing_time ON online_orders((
  CASE 
    WHEN status = 'delivered' AND delivery_time IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (delivery_time - order_time))/3600 
    ELSE NULL 
  END
)) WHERE status = 'delivered';

-- Functional index for user activity score
CREATE INDEX idx_user_activity_score ON users((
  points + weekly_points + monthly_points
)) WHERE points > 0;

-- Index for profit analysis (estimated value vs actual cost)
CREATE INDEX idx_disposals_waste_ratio ON disposals((
  CASE 
    WHEN estimated_value > 0 
    THEN estimated_value 
    ELSE 0 
  END
), disposal_date DESC);

ANALYZE;