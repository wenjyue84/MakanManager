# Database Schema Documentation

## Overview

This document describes the database structure, relationships, and business rules for the MakanManager system. The database is built using PostgreSQL with Drizzle ORM for type-safe operations.

## Database Connection

### Connection Configuration
```typescript
// Database connection parameters
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'makanmanager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production'
}
```

### Connection Pool
```typescript
// Connection pool configuration
const poolConfig = {
  max: 20,           // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

## Core Tables

### 1. Users Table
**Purpose**: Store system users and authentication information

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Username must be unique across the system
- Email must be unique and valid format
- Role must be one of: 'admin', 'manager', 'staff', 'user'
- Password must be hashed using bcrypt

**Indexes**:
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Recipes Table
**Purpose**: Store menu items and cooking instructions

```sql
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  preparation_time INTEGER, -- in minutes
  cooking_time INTEGER,     -- in minutes
  servings INTEGER,
  difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  image_url VARCHAR(500),
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Recipe name must be unique within the same category
- Preparation and cooking times must be positive integers
- Ingredients and instructions must be valid JSON
- Price must be positive decimal

**Indexes**:
```sql
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty_level);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_active ON recipes(is_active);
```

### 3. Staff Table
**Purpose**: Store employee information and work details

```sql
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  phone VARCHAR(20),
  address TEXT,
  emergency_contact JSONB,
  skills JSONB,
  availability JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Each user can have only one staff record
- Employee ID must be unique across the system
- Hire date cannot be in the future
- Salary must be positive decimal

**Indexes**:
```sql
CREATE INDEX idx_staff_position ON staff(position);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_active ON staff(is_active);
```

### 4. Tasks Table
**Purpose**: Store work assignments and task management

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL, -- 'cooking', 'cleaning', 'serving', 'maintenance'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  assigned_to INTEGER REFERENCES staff(id),
  assigned_by INTEGER REFERENCES users(id),
  due_date TIMESTAMP,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER,   -- in minutes
  location VARCHAR(100),
  requirements JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Task must have a valid type and priority
- Due date must be in the future when created
- Estimated duration must be positive
- Status transitions must follow workflow rules

**Indexes**:
```sql
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 5. Orders Table
**Purpose**: Store customer orders and transactions

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  order_type VARCHAR(20) NOT NULL, -- 'dine_in', 'takeaway', 'delivery'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  items JSONB NOT NULL, -- Array of order items with recipe_id, quantity, special_instructions
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  special_instructions TEXT,
  estimated_ready_time TIMESTAMP,
  actual_ready_time TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Order number must be unique and auto-generated
- Total amount must equal sum of items + tax - discount
- Status transitions must follow order workflow
- Payment status must be updated when payment is received

**Indexes**:
```sql
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_phone, customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 6. Inventory Table
**Purpose**: Track stock levels and inventory management

```sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL, -- 'kg', 'pieces', 'liters', 'boxes'
  current_stock DECIMAL(10,3) DEFAULT 0,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  maximum_stock DECIMAL(10,3),
  unit_price DECIMAL(10,2),
  supplier VARCHAR(255),
  location VARCHAR(100),
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Rules**:
- Current stock cannot be negative
- Minimum stock must be less than maximum stock
- Unit price must be positive
- Expiry date must be in the future when created

**Indexes**:
```sql
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_supplier ON inventory(supplier);
CREATE INDEX idx_inventory_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
```

## Junction Tables

### 1. Recipe_Ingredients Table
**Purpose**: Link recipes with inventory items for cost calculation

```sql
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  inventory_id INTEGER REFERENCES inventory(id),
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  cost_per_unit DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
```sql
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_inventory ON recipe_ingredients(inventory_id);
```

### 2. Staff_Skills Table
**Purpose**: Track staff skills and certifications

```sql
CREATE TABLE staff_skills (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  skill_level VARCHAR(20) DEFAULT 'basic', -- 'basic', 'intermediate', 'advanced', 'expert'
  certification VARCHAR(255),
  certified_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
```sql
CREATE INDEX idx_staff_skills_staff ON staff_skills(staff_id);
CREATE INDEX idx_staff_skills_skill ON staff_skills(skill_name);
```

## Views

### 1. Active_Recipes View
```sql
CREATE VIEW active_recipes AS
SELECT 
  r.*,
  u.username as created_by_username,
  COUNT(ri.inventory_id) as ingredient_count
FROM recipes r
LEFT JOIN users u ON r.created_by = u.id
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
WHERE r.is_active = true
GROUP BY r.id, u.username;
```

### 2. Staff_Summary View
```sql
CREATE VIEW staff_summary AS
SELECT 
  s.*,
  u.username,
  u.email,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
FROM staff s
JOIN users u ON s.user_id = u.id
LEFT JOIN tasks t ON s.id = t.assigned_to
GROUP BY s.id, u.username, u.email;
```

### 3. Order_Summary View
```sql
CREATE VIEW order_summary AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(final_amount) as total_revenue,
  AVG(final_amount) as average_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;
```

## Stored Procedures

### 1. Calculate_Recipe_Cost
```sql
CREATE OR REPLACE FUNCTION calculate_recipe_cost(recipe_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_cost DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(ri.quantity * ri.cost_per_unit), 0)
  INTO total_cost
  FROM recipe_ingredients ri
  WHERE ri.recipe_id = $1;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;
```

### 2. Update_Inventory_Stock
```sql
CREATE OR REPLACE FUNCTION update_inventory_stock(
  inventory_id INTEGER,
  quantity_change DECIMAL(10,3)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE inventory 
  SET current_stock = current_stock + quantity_change,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = $1;
  
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### 1. Update_Timestamp_Trigger
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### 2. Inventory_Low_Stock_Alert
```sql
CREATE OR REPLACE FUNCTION inventory_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= NEW.minimum_stock THEN
    -- Log low stock alert
    INSERT INTO system_alerts (type, message, related_id, created_at)
    VALUES ('low_stock', 'Inventory item ' || NEW.item_name || ' is low on stock', NEW.id, CURRENT_TIMESTAMP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_low_stock_trigger
  AFTER UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_low_stock_alert();
```

## Data Integrity Constraints

### 1. Check Constraints
```sql
-- Recipe time constraints
ALTER TABLE recipes ADD CONSTRAINT check_preparation_time 
  CHECK (preparation_time > 0);

ALTER TABLE recipes ADD CONSTRAINT check_cooking_time 
  CHECK (cooking_time > 0);

-- Task duration constraints
ALTER TABLE tasks ADD CONSTRAINT check_estimated_duration 
  CHECK (estimated_duration > 0);

-- Price constraints
ALTER TABLE recipes ADD CONSTRAINT check_price 
  CHECK (price >= 0);

ALTER TABLE inventory ADD CONSTRAINT check_unit_price 
  CHECK (unit_price >= 0);
```

### 2. Foreign Key Constraints
```sql
-- Ensure referential integrity
ALTER TABLE recipes ADD CONSTRAINT fk_recipes_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE staff ADD CONSTRAINT fk_staff_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES staff(id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id);
```

## Performance Optimization

### 1. Composite Indexes
```sql
-- Optimize common query patterns
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
CREATE INDEX idx_recipes_category_active ON recipes(category, is_active);
```

### 2. Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_active_recipes ON recipes(id) WHERE is_active = true;
CREATE INDEX idx_active_staff ON staff(id) WHERE is_active = true;
CREATE INDEX idx_pending_tasks ON tasks(id) WHERE status = 'pending';
```

## Backup and Recovery

### 1. Backup Strategy
```bash
# Daily full backup
pg_dump -h localhost -U username -d makanmanager > backup_$(date +%Y%m%d).sql

# Hourly incremental backup (using WAL archiving)
# Configure in postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /path/to/archive/%f'
```

### 2. Recovery Procedures
```sql
-- Restore from backup
-- psql -h localhost -U username -d makanmanager < backup_file.sql

-- Point-in-time recovery
-- pg_restore --point-in-time-recovery --target-time "2025-08-28 10:00:00"
```

## Monitoring and Maintenance

### 1. Database Statistics
```sql
-- Update table statistics
ANALYZE;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Index Usage Analysis
```sql
-- Check unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

---

*This schema documentation should be updated whenever the database structure changes.*
