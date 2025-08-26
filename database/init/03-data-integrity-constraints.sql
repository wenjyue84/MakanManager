-- Advanced Data Integrity Constraints and Validation
-- Enterprise-level data quality enforcement

-- ==================== DOMAIN CONSTRAINTS ====================

-- Create custom domains for common data types
CREATE DOMAIN email_address AS VARCHAR(255)
CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN phone_number AS VARCHAR(50)
CHECK (VALUE ~* '^\+?[1-9]\d{1,14}$' OR VALUE ~* '^\d{8,15}$');

CREATE DOMAIN currency_amount AS DECIMAL(10,2)
CHECK (VALUE >= 0);

CREATE DOMAIN percentage AS DECIMAL(5,2)
CHECK (VALUE >= 0 AND VALUE <= 100);

CREATE DOMAIN rating AS INTEGER
CHECK (VALUE >= 1 AND VALUE <= 5);

-- ==================== USERS TABLE CONSTRAINTS ====================

-- Enhanced user data validation
ALTER TABLE users 
  ALTER COLUMN phone TYPE phone_number USING phone::phone_number,
  ADD CONSTRAINT chk_users_name_not_empty CHECK (TRIM(name) != ''),
  ADD CONSTRAINT chk_users_name_length CHECK (LENGTH(TRIM(name)) >= 2),
  ADD CONSTRAINT chk_users_roles_not_empty CHECK (cardinality(roles) > 0),
  ADD CONSTRAINT chk_users_start_date_reasonable 
    CHECK (start_date >= '2020-01-01' AND start_date <= CURRENT_DATE + INTERVAL '30 days'),
  ADD CONSTRAINT chk_users_points_non_negative CHECK (points >= 0),
  ADD CONSTRAINT chk_users_weekly_points_non_negative CHECK (weekly_points >= 0),
  ADD CONSTRAINT chk_users_monthly_points_non_negative CHECK (monthly_points >= 0),
  ADD CONSTRAINT chk_users_points_reasonable 
    CHECK (points <= 100000 AND weekly_points <= 10000 AND monthly_points <= 50000),
  ADD CONSTRAINT chk_users_avatar_url_format 
    CHECK (avatar IS NULL OR avatar ~* '^https?://'),
  ADD CONSTRAINT chk_users_photo_url_format 
    CHECK (photo IS NULL OR photo ~* '^https?://');

-- Create unique constraint on active users with same phone
CREATE UNIQUE INDEX idx_users_phone_active ON users(phone) 
WHERE phone IS NOT NULL AND start_date IS NOT NULL;

-- ==================== TASKS TABLE CONSTRAINTS ====================

-- Enhanced task validation
ALTER TABLE tasks
  ADD CONSTRAINT chk_tasks_title_not_empty CHECK (TRIM(title) != ''),
  ADD CONSTRAINT chk_tasks_title_length CHECK (LENGTH(TRIM(title)) >= 3),
  ADD CONSTRAINT chk_tasks_due_date_reasonable 
    CHECK (due_date >= CURRENT_DATE - INTERVAL '1 year' AND due_date <= CURRENT_DATE + INTERVAL '2 years'),
  ADD CONSTRAINT chk_tasks_base_points_reasonable CHECK (base_points > 0 AND base_points <= 1000),
  ADD CONSTRAINT chk_tasks_final_points_reasonable 
    CHECK (final_points IS NULL OR (final_points >= 0 AND final_points <= 2000)),
  ADD CONSTRAINT chk_tasks_multiplier_reasonable CHECK (multiplier > 0 AND multiplier <= 5.0),
  ADD CONSTRAINT chk_tasks_adjustment_reasonable CHECK (adjustment >= -500 AND adjustment <= 500),
  ADD CONSTRAINT chk_tasks_overdue_days_non_negative CHECK (overdue_days >= 0),
  ADD CONSTRAINT chk_tasks_status_completed_date 
    CHECK (
      CASE 
        WHEN status = 'done' THEN completed_at IS NOT NULL
        WHEN status != 'done' THEN completed_at IS NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_tasks_completion_sequence 
    CHECK (completed_at IS NULL OR completed_at >= created_at),
  ADD CONSTRAINT chk_tasks_approval_sequence 
    CHECK (approved_at IS NULL OR (approved_at >= completed_at AND completed_at IS NOT NULL)),
  ADD CONSTRAINT chk_tasks_self_assignment 
    CHECK (assigner_id != assignee_id OR assignee_id IS NULL),
  ADD CONSTRAINT chk_tasks_proof_data_with_type 
    CHECK (
      CASE 
        WHEN proof_type = 'none' THEN proof_data IS NULL
        WHEN proof_type != 'none' THEN proof_data IS NOT NULL
        ELSE true
      END
    );

-- ==================== TASK REMINDERS CONSTRAINTS ====================

ALTER TABLE task_reminders
  ADD CONSTRAINT chk_task_reminders_message_not_empty CHECK (message IS NULL OR TRIM(message) != ''),
  ADD CONSTRAINT chk_task_reminders_future CHECK (remind_at > CURRENT_TIMESTAMP),
  ADD CONSTRAINT chk_task_reminders_quiet_hours CHECK (
    EXTRACT(HOUR FROM remind_at) NOT BETWEEN 22 AND 23 AND
    EXTRACT(HOUR FROM remind_at) NOT BETWEEN 0 AND 7
  );

-- ==================== DISCIPLINARY ACTIONS CONSTRAINTS ====================

ALTER TABLE disciplinary_actions
  ADD CONSTRAINT chk_disciplinary_type_not_empty CHECK (TRIM(type) != ''),
  ADD CONSTRAINT chk_disciplinary_reason_not_empty CHECK (TRIM(reason) != ''),
  ADD CONSTRAINT chk_disciplinary_points_reasonable CHECK (points >= -1000 AND points <= 1000),
  ADD CONSTRAINT chk_disciplinary_self_action CHECK (target_user_id != created_by_id);

-- ==================== POINT ENTRIES CONSTRAINTS ====================

ALTER TABLE point_entries
  ADD CONSTRAINT chk_point_entries_source_not_empty CHECK (TRIM(source_type) != ''),
  ADD CONSTRAINT chk_point_entries_points_reasonable CHECK (points >= -1000 AND points <= 1000),
  ADD CONSTRAINT chk_point_entries_manager_target_diff CHECK (manager_id <> target_user_id);

-- ==================== RECIPES TABLE CONSTRAINTS ====================

ALTER TABLE recipes
  ADD CONSTRAINT chk_recipes_name_not_empty CHECK (TRIM(name) != ''),
  ADD CONSTRAINT chk_recipes_name_length CHECK (LENGTH(TRIM(name)) >= 2),
  ADD CONSTRAINT chk_recipes_category_not_empty CHECK (TRIM(category) != ''),
  ADD CONSTRAINT chk_recipes_cuisine_not_empty CHECK (TRIM(cuisine) != ''),
  ADD CONSTRAINT chk_recipes_yield_not_empty CHECK (TRIM(yield) != ''),
  ADD CONSTRAINT chk_recipes_prep_time_reasonable CHECK (prep_time > 0 AND prep_time <= 1440),
  ADD CONSTRAINT chk_recipes_ingredients_not_empty 
    CHECK (jsonb_array_length(ingredients) > 0),
  ADD CONSTRAINT chk_recipes_steps_not_empty CHECK (cardinality(steps) > 0),
  ADD CONSTRAINT chk_recipes_photo_url_format 
    CHECK (photo IS NULL OR photo ~* '^https?://'),
  ADD CONSTRAINT chk_recipes_self_update CHECK (created_by = updated_by OR updated_by != created_by);

-- Validate ingredients JSON structure
ALTER TABLE recipes ADD CONSTRAINT chk_recipes_ingredients_structure
CHECK (
  ingredients::text = '[]' OR (
    SELECT bool_and(
      ingredient ? 'name' AND 
      ingredient ? 'quantity' AND 
      ingredient ? 'unit' AND
      LENGTH(TRIM(ingredient->>'name')) > 0
    )
    FROM jsonb_array_elements(ingredients) AS ingredient
  )
);

-- ==================== STAFF MEALS CONSTRAINTS ====================

ALTER TABLE staff_meals
  ALTER COLUMN cost TYPE currency_amount USING cost::currency_amount,
  ADD CONSTRAINT chk_staff_meals_date_reasonable 
    CHECK (meal_date >= CURRENT_DATE - INTERVAL '1 year' AND meal_date <= CURRENT_DATE + INTERVAL '7 days'),
  ADD CONSTRAINT chk_staff_meals_time_reasonable 
    CHECK (meal_time >= '00:00:00' AND meal_time <= '23:59:59'),
  ADD CONSTRAINT chk_staff_meals_cost_reasonable CHECK (cost IS NULL OR cost <= 100.00),
  ADD CONSTRAINT chk_staff_meals_type_valid 
    CHECK (meal_type IS NULL OR meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'break')),
  ADD CONSTRAINT chk_staff_meals_items_not_empty 
    CHECK (items IS NULL OR cardinality(items) > 0);

-- Prevent duplicate meals for same user at same time
CREATE UNIQUE INDEX idx_staff_meals_user_datetime ON staff_meals(user_id, meal_date, meal_time);

-- ==================== CASH RECONCILIATION CONSTRAINTS ====================

ALTER TABLE cash_reconciliations
  ALTER COLUMN expected_amount TYPE currency_amount USING expected_amount::currency_amount,
  ALTER COLUMN actual_amount TYPE currency_amount USING actual_amount::currency_amount,
  ADD CONSTRAINT chk_cash_recon_date_reasonable 
    CHECK (reconciliation_date >= CURRENT_DATE - INTERVAL '1 year' AND reconciliation_date <= CURRENT_DATE),
  ADD CONSTRAINT chk_cash_recon_amounts_reasonable 
    CHECK (expected_amount <= 100000 AND actual_amount <= 100000),
  ADD CONSTRAINT chk_cash_recon_status_valid 
    CHECK (status IN ('pending', 'approved', 'rejected', 'under-review')),
  ADD CONSTRAINT chk_cash_recon_approval_logic 
    CHECK (
      CASE 
        WHEN status = 'approved' THEN approved_by_id IS NOT NULL AND approved_at IS NOT NULL
        WHEN status = 'rejected' THEN approved_by_id IS NOT NULL AND approved_at IS NOT NULL
        ELSE approved_by_id IS NULL OR approved_at IS NULL
      END
    ),
  ADD CONSTRAINT chk_cash_recon_self_approval CHECK (user_id != approved_by_id OR approved_by_id IS NULL);

-- Prevent duplicate reconciliations for same user/date
CREATE UNIQUE INDEX idx_cash_recon_user_date ON cash_reconciliations(user_id, reconciliation_date);

-- ==================== ONLINE ORDERS CONSTRAINTS ====================

ALTER TABLE online_orders
  ALTER COLUMN total_amount TYPE currency_amount USING total_amount::currency_amount,
  ADD CONSTRAINT chk_orders_number_format CHECK (order_number ~* '^[A-Z0-9-]{5,20}$'),
  ADD CONSTRAINT chk_orders_customer_info 
    CHECK (customer_name IS NOT NULL OR customer_phone IS NOT NULL OR customer_email IS NOT NULL),
  ADD CONSTRAINT chk_orders_total_reasonable CHECK (total_amount > 0 AND total_amount <= 10000),
  ADD CONSTRAINT chk_orders_status_valid 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled')),
  ADD CONSTRAINT chk_orders_time_sequence 
    CHECK (delivery_time IS NULL OR delivery_time >= order_time),
  ADD CONSTRAINT chk_orders_delivery_assignment 
    CHECK (
      CASE 
        WHEN status IN ('out-for-delivery', 'delivered') THEN assigned_to_id IS NOT NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_orders_items_not_empty CHECK (jsonb_array_length(items) > 0);

-- Validate customer email format
ALTER TABLE online_orders 
  ADD CONSTRAINT chk_orders_email_format 
    CHECK (customer_email IS NULL OR customer_email::email_address IS NOT NULL);

-- Validate customer phone format  
ALTER TABLE online_orders 
  ADD CONSTRAINT chk_orders_phone_format 
    CHECK (customer_phone IS NULL OR customer_phone::phone_number IS NOT NULL);

-- ==================== PURCHASES CONSTRAINTS ====================

ALTER TABLE purchases
  ALTER COLUMN unit_price TYPE currency_amount USING unit_price::currency_amount,
  ADD CONSTRAINT chk_purchases_item_name_not_empty CHECK (TRIM(item_name) != ''),
  ADD CONSTRAINT chk_purchases_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT chk_purchases_quantity_reasonable CHECK (quantity <= 100000),
  ADD CONSTRAINT chk_purchases_unit_not_empty CHECK (TRIM(unit) != ''),
  ADD CONSTRAINT chk_purchases_price_reasonable CHECK (unit_price <= 10000),
  ADD CONSTRAINT chk_purchases_total_reasonable CHECK (total_price <= 1000000),
  ADD CONSTRAINT chk_purchases_date_reasonable 
    CHECK (purchase_date >= CURRENT_DATE - INTERVAL '1 year' AND purchase_date <= CURRENT_DATE + INTERVAL '30 days'),
  ADD CONSTRAINT chk_purchases_delivery_sequence 
    CHECK (delivery_date IS NULL OR delivery_date >= purchase_date),
  ADD CONSTRAINT chk_purchases_status_valid 
    CHECK (status IN ('pending', 'ordered', 'partially-delivered', 'delivered', 'cancelled', 'returned')),
  ADD CONSTRAINT chk_purchases_supplier_not_empty 
    CHECK (supplier IS NULL OR TRIM(supplier) != '');

-- ==================== SUPPLIERS CONSTRAINTS ====================

ALTER TABLE suppliers
  ADD CONSTRAINT chk_suppliers_name_not_empty CHECK (TRIM(name) != ''),
  ADD CONSTRAINT chk_suppliers_name_length CHECK (LENGTH(TRIM(name)) >= 2),
  ADD CONSTRAINT chk_suppliers_categories_not_empty 
    CHECK (categories IS NULL OR cardinality(categories) > 0),
  ADD CONSTRAINT chk_suppliers_email_format 
    CHECK (email IS NULL OR email::email_address IS NOT NULL),
  ADD CONSTRAINT chk_suppliers_phone_format 
    CHECK (phone IS NULL OR phone::phone_number IS NOT NULL);

-- Unique supplier names for active suppliers
CREATE UNIQUE INDEX idx_suppliers_name_active ON suppliers(LOWER(TRIM(name))) 
WHERE active = true;

-- ==================== DISPOSALS CONSTRAINTS ====================

ALTER TABLE disposals
  ALTER COLUMN estimated_value TYPE currency_amount USING estimated_value::currency_amount,
  ADD CONSTRAINT chk_disposals_item_name_not_empty CHECK (TRIM(item_name) != ''),
  ADD CONSTRAINT chk_disposals_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT chk_disposals_quantity_reasonable CHECK (quantity <= 100000),
  ADD CONSTRAINT chk_disposals_reason_not_empty CHECK (TRIM(reason) != ''),
  ADD CONSTRAINT chk_disposals_reason_length CHECK (LENGTH(TRIM(reason)) >= 5),
  ADD CONSTRAINT chk_disposals_date_reasonable 
    CHECK (disposal_date >= CURRENT_DATE - INTERVAL '1 year' AND disposal_date <= CURRENT_DATE + INTERVAL '1 day'),
  ADD CONSTRAINT chk_disposals_time_reasonable 
    CHECK (disposal_time IS NULL OR (disposal_time >= '00:00:00' AND disposal_time <= '23:59:59')),
  ADD CONSTRAINT chk_disposals_value_reasonable 
    CHECK (estimated_value IS NULL OR estimated_value <= 50000),
  ADD CONSTRAINT chk_disposals_photo_url_format 
    CHECK (photo IS NULL OR photo ~* '^https?://'),
  ADD CONSTRAINT chk_disposals_verification_logic 
    CHECK (verified_by_id IS NULL OR verified_by_id != disposed_by_id);

-- ==================== ISSUES CONSTRAINTS ====================

ALTER TABLE issues
  ADD CONSTRAINT chk_issues_title_not_empty CHECK (TRIM(title) != ''),
  ADD CONSTRAINT chk_issues_title_length CHECK (LENGTH(TRIM(title)) >= 5),
  ADD CONSTRAINT chk_issues_description_not_empty CHECK (TRIM(description) != ''),
  ADD CONSTRAINT chk_issues_description_length CHECK (LENGTH(TRIM(description)) >= 10),
  ADD CONSTRAINT chk_issues_priority_valid 
    CHECK (priority IN ('low', 'medium', 'high', 'critical', 'urgent')),
  ADD CONSTRAINT chk_issues_status_valid 
    CHECK (status IN ('open', 'in-progress', 'on-hold', 'resolved', 'closed', 'cancelled')),
  ADD CONSTRAINT chk_issues_category_valid 
    CHECK (category IS NULL OR category IN (
      'equipment', 'safety', 'customer', 'staff', 'cleanliness', 
      'inventory', 'maintenance', 'security', 'quality', 'process'
    )),
  ADD CONSTRAINT chk_issues_resolution_logic 
    CHECK (
      CASE 
        WHEN status IN ('resolved', 'closed') THEN resolution IS NOT NULL AND resolved_at IS NOT NULL
        WHEN status NOT IN ('resolved', 'closed') THEN resolution IS NULL AND resolved_at IS NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_issues_assignment_logic 
    CHECK (assigned_to_id IS NULL OR assigned_to_id != reported_by_id),
  ADD CONSTRAINT chk_issues_resolution_time 
    CHECK (resolved_at IS NULL OR resolved_at >= created_at);

-- ==================== NOTIFICATIONS CONSTRAINTS ====================

ALTER TABLE notifications
  ADD CONSTRAINT chk_notifications_title_not_empty CHECK (TRIM(title) != ''),
  ADD CONSTRAINT chk_notifications_message_not_empty CHECK (TRIM(message) != ''),
  ADD CONSTRAINT chk_notifications_type_valid 
    CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder', 'alert')),
  ADD CONSTRAINT chk_notifications_read_logic 
    CHECK (
      CASE 
        WHEN read = true THEN read_at IS NOT NULL
        WHEN read = false THEN read_at IS NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_notifications_read_time 
    CHECK (read_at IS NULL OR read_at >= created_at),
  ADD CONSTRAINT chk_notifications_action_url_format 
    CHECK (action_url IS NULL OR action_url ~* '^(https?://|/)');

-- ==================== SKILLS CONSTRAINTS ====================

ALTER TABLE skills
  ADD CONSTRAINT chk_skills_name_not_empty CHECK (TRIM(name) != ''),
  ADD CONSTRAINT chk_skills_name_length CHECK (LENGTH(TRIM(name)) >= 2);

-- Unique skill names within same category
CREATE UNIQUE INDEX idx_skills_name_category ON skills(LOWER(TRIM(name)), COALESCE(category, ''));

-- ==================== USER_SKILLS CONSTRAINTS ====================

ALTER TABLE user_skills
  ADD CONSTRAINT chk_user_skills_certification_logic 
    CHECK (
      CASE 
        WHEN certified = true THEN certification_date IS NOT NULL
        WHEN certified = false THEN certification_date IS NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_user_skills_certification_date 
    CHECK (certification_date IS NULL OR certification_date <= CURRENT_DATE);

-- ==================== SALARY RECORDS CONSTRAINTS ====================

ALTER TABLE salary_records
  ALTER COLUMN base_salary TYPE currency_amount USING base_salary::currency_amount,
  ALTER COLUMN overtime_rate TYPE currency_amount USING overtime_rate::currency_amount,
  ALTER COLUMN bonuses TYPE currency_amount USING bonuses::currency_amount,
  ALTER COLUMN deductions TYPE currency_amount USING deductions::currency_amount,
  ADD CONSTRAINT chk_salary_period_valid CHECK (period_end > period_start),
  ADD CONSTRAINT chk_salary_period_reasonable 
    CHECK (
      period_end - period_start >= INTERVAL '1 week' AND 
      period_end - period_start <= INTERVAL '2 months'
    ),
  ADD CONSTRAINT chk_salary_overtime_reasonable CHECK (overtime_hours >= 0 AND overtime_hours <= 200),
  ADD CONSTRAINT chk_salary_amounts_reasonable 
    CHECK (base_salary <= 50000 AND overtime_rate <= 500 AND bonuses <= 20000 AND deductions <= 20000),
  ADD CONSTRAINT chk_salary_status_valid 
    CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  ADD CONSTRAINT chk_salary_approval_logic 
    CHECK (
      CASE 
        WHEN status IN ('approved', 'paid') THEN approved_by_id IS NOT NULL
        ELSE true
      END
    ),
  ADD CONSTRAINT chk_salary_self_approval CHECK (user_id != approved_by_id OR approved_by_id IS NULL);

-- Prevent overlapping salary periods for same user
CREATE UNIQUE INDEX idx_salary_user_period ON salary_records(user_id, period_start, period_end);

-- ==================== CROSS-TABLE REFERENTIAL INTEGRITY ====================

-- Ensure task assignee has appropriate role for the station
CREATE OR REPLACE FUNCTION check_task_assignee_station()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE id = NEW.assignee_id 
      AND (station = NEW.station OR station IS NULL)
      AND ('manager' = ANY(roles) OR 'head-of-kitchen' = ANY(roles) OR 'staff' = ANY(roles))
    ) THEN
      RAISE EXCEPTION 'Assignee must have appropriate role and station for this task';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_task_assignee_station
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_task_assignee_station();

-- Ensure recipe creator has kitchen-related role
CREATE OR REPLACE FUNCTION check_recipe_creator_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.created_by 
    AND ('head-of-kitchen' = ANY(roles) OR 'manager' = ANY(roles) OR 'owner' = ANY(roles))
  ) THEN
    RAISE EXCEPTION 'Only kitchen managers or owners can create recipes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_recipe_creator_role
  BEFORE INSERT ON recipes
  FOR EACH ROW EXECUTE FUNCTION check_recipe_creator_role();

-- Ensure disciplinary actions are created by managers
CREATE OR REPLACE FUNCTION check_disciplinary_creator_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.created_by_id 
    AND ('manager' = ANY(roles) OR 'front-desk-manager' = ANY(roles) OR 'head-of-kitchen' = ANY(roles) OR 'owner' = ANY(roles))
  ) THEN
    RAISE EXCEPTION 'Only managers can create disciplinary actions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_disciplinary_creator_role
  BEFORE INSERT ON disciplinary_actions
  FOR EACH ROW EXECUTE FUNCTION check_disciplinary_creator_role();

-- ==================== DATA QUALITY FUNCTIONS ====================

-- Function to validate JSON structure for specific types
CREATE OR REPLACE FUNCTION validate_json_structure(data JSONB, structure_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE structure_type
    WHEN 'order_items' THEN
      RETURN (
        SELECT bool_and(
          item ? 'name' AND 
          item ? 'quantity' AND 
          item ? 'price' AND
          LENGTH(TRIM(item->>'name')) > 0 AND
          (item->>'quantity')::NUMERIC > 0 AND
          (item->>'price')::NUMERIC >= 0
        )
        FROM jsonb_array_elements(data) AS item
      );
    WHEN 'recipe_ingredients' THEN
      RETURN (
        SELECT bool_and(
          ingredient ? 'name' AND 
          ingredient ? 'quantity' AND 
          ingredient ? 'unit' AND
          LENGTH(TRIM(ingredient->>'name')) > 0 AND
          LENGTH(TRIM(ingredient->>'unit')) > 0
        )
        FROM jsonb_array_elements(data) AS ingredient
      );
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing constraints to use the validation function
ALTER TABLE online_orders DROP CONSTRAINT IF EXISTS chk_orders_items_not_empty;
ALTER TABLE online_orders ADD CONSTRAINT chk_orders_items_structure
CHECK (validate_json_structure(items, 'order_items'));

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS chk_recipes_ingredients_structure;
ALTER TABLE recipes ADD CONSTRAINT chk_recipes_ingredients_structure
CHECK (validate_json_structure(ingredients, 'recipe_ingredients'));

-- ==================== ENABLE ROW LEVEL SECURITY (Preparation) ====================

-- Enable RLS on sensitive tables (actual policies will be defined later)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_reconciliations ENABLE ROW LEVEL SECURITY;

COMMIT;