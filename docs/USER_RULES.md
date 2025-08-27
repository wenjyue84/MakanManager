# MakanManager User Rules & Quick Reference
## Context Engineering Guide for Developers

> **Purpose**: This document provides quick-access rules and context for efficient development on the MakanManager system. Use this as your primary reference during coding sessions.

---

## 🎯 **CORE SYSTEM RULES (Always Remember)**

### **Role Hierarchy & Permissions**
- **Owner** = God mode (can't receive discipline, can only claim Owner-created tasks)
- **Management** = Owner + Manager + HoK + FDM (all have similar powers)
- **Staff** = Basic users (create tasks, submit proofs, view leaderboard)
- **Multi-role users** = Can hold multiple roles simultaneously

### **Task Lifecycle (Critical Path)**
```
Open (blue) → In Progress (gray) → Pending Review (purple) → Done (green)
     ↓              ↓                    ↓
  Unassigned    Work ongoing        Awaiting approval
     ↓              ↓                    ↓
  Claimable    Can submit proof    Approve → Points awarded
```

### **Points System Rules**
- **Default task points**: 50 (Owner configurable min/max)
- **Daily budget**: 500 points per management user (consumed by adjustments + discipline)
- **Multiplier range**: 0.5× to 3× (Owner configurable)
- **Discipline**: Never against Owner, predefined types with negative points
- **Skills**: First-time verification = +50 points (doesn't consume budget)

---

## 🚀 **DEVELOPMENT CONTEXT RULES**

### **Tech Stack Quick Reference**
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Fastify/Express + Prisma ORM + PostgreSQL
- **Database**: PostgreSQL 14+ with Prisma migrations
- **Auth**: Username/password + JWT + RBAC middleware
- **PWA**: Service worker + local notifications + offline support

### **Database Schema Patterns**
- **User**: `id, username, passwordHash, name, phone, email?, roles[], purchasingPerm, status, photoUrl, startDate, emergencyContact, station`
- **Task**: `id, title, description, station, points, dueAt, status, assignerId, assigneeId?, proofType, allowMultiplier, overdueDays`
- **PointEntry**: `id, userId, source, taskId?, value, multiplier?, adjustment?, reason, approvedById, createdAt`
- **Status enums**: Always use exact status strings from PRD (Open, In Progress, On Hold, Pending Review, Overdue, Done)

### **API Design Rules**
- **REST endpoints**: Follow the pattern in PRD section 11
- **Validation**: Use Zod schemas for all inputs
- **RBAC**: Server-side checks for ALL protected routes
- **Audit logs**: Log sensitive actions (approvals, point awards, discipline, spending locks)
- **Error handling**: Structured error responses with appropriate HTTP status codes

---

## 🔧 **CODING STANDARDS & PATTERNS**

### **Frontend Components**
- **Status chips**: Use consistent colors (blue=Open, gray=In Progress, yellow=On Hold, purple=Pending Review, orange=Overdue, green=Done)
- **Modals**: Always show budget meter for approval actions
- **Forms**: Include photo upload where required (proofs, receipts, staff photos)
- **i18n**: All user-facing text via i18n catalog (EN/ID/VI/MY)

### **Backend Services**
- **Task service**: Handle status transitions, repeat spawning, overdue marking
- **Points service**: Budget validation, multiplier application, audit logging
- **File service**: Photo upload/delete with 6-month retention policy
- **Notification service**: Task-linked reminders with quiet hours (22:00-08:00)

### **Database Operations**
- **Indexes**: Always include status+date combinations for filtering
- **Transactions**: Use for multi-table operations (task approval, point awards)
- **Soft deletes**: Implement for user data, hard deletes for attachments
- **Audit trails**: Log all point changes, status changes, approvals

---

## 📋 **FEATURE IMPLEMENTATION CHECKLIST**

### **Core Features (MVP Required)**
- [ ] Task lifecycle with all 6 statuses
- [ ] Points system with daily budgets and multipliers
- [ ] Disciplinary actions (not vs Owner)
- [ ] Leaderboard Top 10 with filters
- [ ] Staff directory with mandatory fields
- [ ] Skills verification with first-time awards
- [ ] Recipes with required photos + print cards
- [ ] All 5 ops modules (Staff Meal, Disposal, Issues, Purchase List, Spending)
- [ ] Task-linked reminders with quiet hours
- [ ] i18n for EN/ID/VI/MY locales
- [ ] CSV/PDF exports where specified

### **System Jobs (Background Processing)**
- [ ] `spawnRepeatedTasks` (midnight/custom)
- [ ] `markOverdueAndReturnToAssigner` (hourly)
- [ ] `purgeExpiredPhotos` (daily - 6 month retention)
- [ ] `recalcLeaderboards` (nightly optional)

---

## 🚨 **CRITICAL BUSINESS RULES (Never Violate)**

### **Task Management**
- **Owner restriction**: Can only claim tasks created by Owner
- **Overdue handling**: Return to Assigner after grace period (default 7 days)
- **Repeat tasks**: Spawn at midnight, no holiday skips
- **Proof types**: Photo/text/checkbox/none (configurable per task)

### **Points & Budgets**
- **Daily budget**: Hard limit per management user
- **Approval flow**: Points only awarded on Approve, not Submit
- **Multiplier application**: Within Owner-set range, plus manual adjustment
- **Discipline points**: Consume budget (absolute value)

### **Data Integrity**
- **Photo requirements**: Staff photos, task proofs, receipts, disposal items
- **Audit logging**: All point changes, status changes, approvals
- **Retention policy**: Photos/receipts purged after 6 months
- **Status transitions**: Only valid state changes allowed

---

## 🔍 **QUICK DEBUGGING RULES**

### **Common Issues to Check First**
1. **RBAC violations**: Check user roles and permissions
2. **Budget exceeded**: Verify daily point budget limits
3. **Invalid status transitions**: Check task lifecycle rules
4. **Photo upload failures**: Verify file size and type restrictions
5. **Database constraints**: Check foreign key relationships

### **Performance Considerations**
- **API response time**: Target P95 < 250ms for core APIs
- **Database queries**: Use indexes on status+date combinations
- **File uploads**: Implement retry logic and progress indicators
- **Caching**: Cache leaderboards and frequently accessed data

---

## 📚 **ESSENTIAL DOCUMENTATION REFERENCES**

### **Primary Sources**
- **PRD.md**: Complete business logic and requirements
- **database-schema.md**: Database structure and relationships
- **setup.md**: Development environment configuration
- **architecture.md**: System component overview

### **Quick Lookups**
- **Permissions Matrix**: PRD section 9 (table format)
- **API Endpoints**: PRD section 11 (REST examples)
- **Data Model**: PRD section 10 (SQL/Prisma schema)
- **Status Definitions**: PRD section 3 (task lifecycle)

---

## 🎨 **UI/UX CONSISTENCY RULES**

### **Visual Design**
- **Neutral theme**: Professional, restaurant-appropriate styling
- **Status colors**: Consistent across all modules
- **Mobile-first**: Responsive design with mobile-optimized interactions
- **Accessibility**: Proper contrast ratios and screen reader support

### **User Experience**
- **Approval modals**: Show budget meter and point calculations
- **WhatsApp integration**: Purchase list grouping by supplier
- **Photo requirements**: Clear upload instructions and preview
- **Multi-language**: Easy language toggle in header

---

## 🚀 **DEVELOPMENT WORKFLOW RULES**

### **Before Starting Work**
1. **Read relevant PRD sections** for the feature you're implementing
2. **Check existing code** for similar patterns to follow
3. **Verify database schema** matches the requirements
4. **Review permission matrix** for the user roles involved

### **During Development**
1. **Follow established patterns** from existing components/services
2. **Implement RBAC checks** for all protected operations
3. **Add audit logging** for sensitive actions
4. **Include proper error handling** and user feedback

### **Before Committing**
1. **Test all user roles** and permission combinations
2. **Verify status transitions** follow business rules
3. **Check budget validation** for point operations
4. **Ensure i18n keys** are properly set for all text

---

## 💡 **PRO TIPS FOR EFFICIENT DEVELOPMENT**

### **Context Switching**
- Keep this document open while coding
- Use PRD section numbers for quick navigation
- Reference the permissions matrix before implementing new features
- Check the data model when designing new components

### **Common Patterns to Remember**
- **Task approval flow**: Submit → Pending Review → Approve/Reject
- **Point calculations**: Base × Multiplier + Adjustment = Total
- **File handling**: Upload → Store → Link → Retention → Purge
- **Status management**: Validate transitions, log changes, update UI

### **Testing Strategy**
- **Unit tests**: Business logic and validation rules
- **Integration tests**: API endpoints and database operations
- **User acceptance**: Test all role combinations and workflows
- **Performance tests**: API response times and database queries

---

*This document is your primary reference for MakanManager development. Update it as you discover new patterns or requirements that would help future development sessions.*
