# Product Requirements Document (PRD)
## Project: Makan Moments Cafe — Full Operations PWA
**Owner:** Lew Wen Jyue  
**Date:** 26 Aug 2025 (GMT+8, Asia/Kuala_Lumpur)  
**Platform:** Progressive Web App (PWA), mobile-first; desktop-friendly  
**Hosting:** Replit.com  
**Environments:**
- **Testing/Dev:** in-memory data store (ephemeral)
- **Production:** PostgreSQL (Prisma ORM)

---

## 1) Problem & Objectives
**Problem**  
Daily operations need a transparent way to assign/approve tasks, reward/punish via points, standardize recipes, and track kitchen/front-of-house events (meals, disposals, issues, purchases, spending) in one system.

**Objectives**
1. **Tasks + Points** with assigner/assignee, approvals, repeats, templates, stations.  
2. **Ranking & Rewards** with budgets, multipliers, adjustments, disciplinary actions.  
3. **Directory & Skills** for staff details, documents, and skill verification (with point awards).  
4. **Recipes** library with required photos.  
5. **Ops Modules:** Staff Meal, Disposal, Issues (with point suggestions), Purchase List (WhatsApp builder), Spending (all cash out).  
6. **Reminders** (task-linked) with quiet hours.  
7. **Multilingual** UI (MVP: EN/ID/VI/MY*).  
8. **PWA** installable app with minimal offline (notification) behavior.

> *MY here refers to Burmese (မြန်မာ) for MVP; Malay (ms) and Chinese (zh) planned post‑MVP.

**Non-goals (MVP):** Payroll, roster/scheduling, POS integration, inventory costing (except basic categories), advanced recipe versioning.

---

## 2) Roles, Definitions & Core Rules
**Roles:** Owner, Manager, Head of Kitchen (HoK), Front Desk Manager (FDM), Staff.  
**Management =** Owner + Manager + HoK + FDM.  
**Multi‑role:** A user may hold multiple roles.  
**Optional capability flag:** **Purchasing** (grants Purchaser tools; typically Manager/Owner, configurable per user).

**Key Definitions**  
- **Assigner:** Creator of a task (always recorded).  
- **Assignee:** Performer of a task (optional for open tasks).  
- **Disciplinary Action:** Non‑task negative points for misconduct.  
- **Daily Points Budget:** Points a management user can allocate per day (default 500). Consumed by bonus/penalty **adjustments** and **disciplinary** actions.

**Owner Special Rules**  
- Cannot receive disciplinary action.  
- May **only claim/accept** tasks that were **created by an Owner**.  
- Sole authority to set **default/min/max** task points, **daily budget default**, **multiplier range**, **quiet hours**, and global settings.

---

## 3) Tasks & Points (MVP)
**Statuses**  
- **Open (blue):** Unassigned; visible to eligible claimants. Owner can only claim Owner‑created tasks.  
- **In Progress (gray):** Assigned/claimed; work ongoing.  
- **On Hold (yellow):** Paused by management; SLA timers pause; cannot approve while on hold.  
- **Pending Review (purple):** Assignee submitted proof; awaiting assigner/management approval.  
- **Overdue (orange):** Past due; task returns to **Assigner** for action (reassign/extend/cancel).  
- **Done (green):** Approved; closed; points posted.  
- **Reject flow:** Reject sends task back to **Assignee** → status becomes **In Progress** with feedback.

**Creation & Fields**  
Title, description, station (Kitchen/Front/Store/Outdoor), due date/time, repeat (None/Daily/Weekly/Monthly/Custom), spawn time (default midnight), overdue after (default 7d; Owner can set global default; Assigner may override), **points** (default 50; within Owner’s min/max), proof type (photo/text/checkbox/none), allow multiplier toggle, optional template, Assignee (optional → Open). Assigner is always the creator.

**Repeat & Overdue**  
- Repeats spawn at midnight by default or at a specified time; **no holiday skips**.  
- At due+grace (default 7d), mark **Overdue** and return to **Assigner** to act.

**Approval & Points**  
- Completion → **Pending Review**; points only awarded on **Approve**.  
- Approver (management) can apply **multiplier** (Owner‑set range, e.g., 0.5×–3×) and a **manual adjustment (±)**, subject to their **daily budget**.  
- All point events are immutable and audit‑logged (who/when/why, link to task).

**Disciplinary Actions**  
- Management may post negative points for misconduct (never vs Owner).  
- Predefined types (editable by Owner): Sudden Absence (−200), Late Arrival (>15m) (−30), Phone Use on Duty (−20), Uniform Violation (−10), Safety Breach (−100).  
- Consumes approver’s daily budget (absolute value).  
- Visible to target staff with reasons.

**Leaderboard**  
Top 10 by period (Weekly/Monthly/All‑time). Tie‑breaker: earliest timestamp reaching total. Filters by role/station.

**Rewards**  
Points → rewards per Owner’s scheme. **Default reward:** Extra day off (threshold configurable).

---

## 4) Staff Directory & Skills
**Staff Directory**  
- Mandatory: **Photo**, **Phone**, **Role(s)**, **Start Date**, **Emergency Contact**.  
- Staff may edit own photo/phone/email/start date/emergency contact/station; Management may edit all (incl. roles/status).  
- Documents: upload/delete (management) for passport/IC, contract, certificates.

**Skills Module**  
- Dictionary of skills (e.g., Brew Coffee, Tom Yam Prep, Curry Mee Base, Cashier, POS Closing, Knife Skills, Food Safety).  
- Per staff: level (None/Basic/Proficient/Expert), verified flag, verifier, date.  
- **Award:** First‑time **Verified** skill grants **+50** points (Owner‑configurable). Base award does **not** consume budget; any **extra** adjustment does.  
- Staff can **request verification**; management can verify/deny.

---

## 5) Recipes
- Required fields: **Photo**, name, category, ingredients (name/qty/unit), steps (timers optional), allergens (icons), tags, prep time, station, yield/servings.  
- Printable A4 recipe card.  
- Editors: Owner/Manager/HoK; FDM read‑only; Staff view/print.  
- Versioning: not in MVP (planned).

---

## 6) Ops Modules
### 6.1 Staff Meal
Track staff lunch/dinner: **Meal Type**, date/time, dish name, **Cooked By**, **Eaters** (multi‑select), **Approx Cost (MYR)**, **Photo** (required), notes.  
All staff can create; management edit/delete. Weekly totals & cost widgets.

### 6.2 Disposal
Track thrown‑away items: time, **Item**, **Qty/Unit**, **Reason** (Expired/Spoiled/Overcooked/Prep Error/Other), **Station**, **Thrown by**, **Photo** (required), notes.  
Filters by date/reason/station; list & detail.

### 6.3 Issues (with default points)
Staff log problems: **Category** (Complaint/Hygiene/Wastage/Recipe/Disciplinary/Stock‑out), title, station, description, photo/attachment (optional), **Target Staff** (optional), **Default Points** by category (editable by management):  
- Complaint −50 | Hygiene −80 | Wastage −30 | Recipe −40 | Disciplinary −100 | Stock‑out −60  
**Manager Extra:** ±10–50; **Owner Extra:** ±10–100.  
**Total** = Default + Extras. Applying points posts a **PointEntry** to Target Staff and consumes the approver’s budget (for the extra components).  
Statuses: Open / Investigating / Resolved / Dismissed.  
Action: **Create Follow‑up Task** (prefilled).

### 6.4 Purchase List (with WhatsApp builder)
Any staff can add items to buy: **Item**, photo (optional), **Qty/Unit**, **Preferred Supplier**, Needed‑by date, **Urgency** (Low/Med/High), notes.  
Users with **Purchasing** permission (e.g., Manager/Owner) review, group by supplier, set status (New/Reviewed/Ordered/Received), and generate **WhatsApp‑friendly** message text per supplier.

### 6.5 Spending (all cash out)
One place for every money‑out event: **Type** (Expense/Stock Purchase/Asset Purchase/Reimbursement), date/time, **Supplier/Payee**, **Amount (MYR)**, **Tax (SST)** with inclusive/exclusive math, **Method** (Cash/Bank/eWallet/Card), **Station**, **Paid by**, reference no., **Category** (per type), links to Purchase List items, **Attachments** (receipt photo/PDF), notes.  
Statuses: **Draft → Approved → Locked**.  
- **Staff:** create/edit own Draft; submit for approval.  
- **Manager:** approve/reject, edit any, export CSV/PDF (monthly).  
- **Owner:** lock/unlock (read‑only when locked), settings (tax defaults, categories).  
WhatsApp summary copy; supplier grouping; export CSV + monthly PDF.

---

## 7) Reminders & Notifications
- **Task‑linked** reminders only.  
- **Quiet hours:** 22:00–08:00 (Owner‑configurable).  
- **Offline behavior:** Only notifications need offline support (local scheduled notifications). Other flows require network.

---

## 8) Internationalization (i18n)
**MVP locales:** English (`en`), Indonesian (`id`), Vietnamese (`vi`), Burmese (`my`).  
**Planned:** Malay (`ms`), Chinese (`zh`).  
All labels via i18n catalog; date/time localized; role/station names localized.

---

## 9) Permissions Matrix (high level)
| Capability | Owner | Manager | HoK | FDM | Staff |
|---|---:|---:|---:|---:|---:|
| Create/Open Task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign/Claim Task | ✅* / ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit/Approve/Reject | Submit/Approve | Submit/Approve | Submit/Approve | Submit/Approve | Submit only |
| Put On Hold / Resume | ✅ | ✅ | ✅ | ✅ | ❌ |
| Disciplinary Action (not vs Owner) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Adjust Points on Approval | ✅ | ✅ | ✅ | ✅ | ❌ |
| Staff Meal CRUD | ✅ | ✅ | ✅ | ✅ | Create self |
| Disposal CRUD | ✅ | ✅ | ✅ | ✅ | Create self |
| Issues: create / apply points | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | ✅ / ✅ | Create only |
| Purchase List: add | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase List: review/WA order (Purchasing) | ✅ | ✅ | ✅(opt) | ✅(opt) | ❌ |
| Spending: draft / approve / lock | Draft/Approve/Lock | Draft/Approve | Draft | Draft | Draft (own) |
| Staff Directory (manage) | ✅ | ✅ | ✅ | ✅ | own profile |
| Skills verify / award | ✅ | ✅ | ✅ | (opt) | request |
| Recipes edit | ✅ | ✅ | ✅ | RO | RO |
| Leaderboard view | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export CSV/PDF | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configure global settings | ✅ | ❌ | ❌ | ❌ | ❌ |

\*Owner may claim tasks **only if** created by Owner.

---

## 10) Data Model (SQL/Prisma)
**User**(id, username, passwordHash, name, phone, email?, roles[], purchasingPerm(bool), department?, status, photoUrl, startDate, emergencyContact{name,phone}, station?, createdAt, updatedAt)

**Task**(id, title, description, station, points, dueAt, status, assignerId, assigneeId?, proofType, allowMultiplier, overdueDays?, templateId?, createdAt, updatedAt)

**TaskEvent**(id, taskId, actorId, type[Create/Assign/Claim/Submit/Approve/Reject/Hold/Resume/AutoOverdue/Edit], meta json, createdAt)

**PointEntry**(id, userId, source[Task/Discipline/Skill/Manual/Issue], taskId?, issueId?, value int(±), multiplier float?, adjustment int?, reason, approvedById, createdAt)

**DisciplinaryType**(id, name, defaultPoints negative, active)

**DisciplinaryAction**(id, targetUserId, typeId, points negative, reason, createdById, createdAt, attachmentIds[])

**Recipe**(id, name, category, cuisine?, photoUrl, ingredients json, steps json, allergens json, tags json, prepTimeMins, station, yieldText, createdById, createdAt, updatedAt)

**StaffMeal**(id, mealType[Lunch/Dinner], at, dishName, cookedById, eaterIds[], approxCost, photoUrl, notes, createdAt)

**Disposal**(id, at, item, qty, unit, reason, station, thrownById, photoUrl, notes, createdAt)

**Issue**(id, code e.g. ISS-101, title, category, station, description, photoUrl?, reportedById, targetUserId?, defaultPoints, managerExtra int, ownerExtra int, status[Open/Investigating/Resolved/Dismissed], createdAt, updatedAt)

**PurchaseItem**(id, name, qty, unit, preferredSupplier, neededBy, urgency, notes, addedById, status[New/Reviewed/Ordered/Received], photoUrl, createdAt)

**Spending**(id, type[Expense/Stock/Asset/Reimb], at, supplier, category, amount, sstPercent, sstMode[Inclusive/Exclusive], method[Cash/Bank/eWallet/Card], station, paidById, approvedById?, referenceNo?, status[Draft/Approved/Locked], notes, createdAt)

**SpendingPurchaseLink**(spendingId, purchaseItemId)

**Skill**(id, name, active)

**UserSkill**(id, userId, skillId, level[None/Basic/Proficient/Expert], verified bool, verifiedById?, verifiedAt?)

**Reminder**(id, userId, taskId, remindAt, createdAt)

**Settings**(id, defaultTaskPoints=50, minTaskPoints, maxTaskPoints, multiplierMin, multiplierMax, dailyBudgetDefault=500, overdueDaysDefault=7, quietHoursStart=22:00, quietHoursEnd=08:00, rewardScheme json, skillAwardDefault=50, photoRetentionMonths=6)

**Attachment**(id, ownerType[Task/Discipline/Recipe/Issue/Spending], ownerId, url, mime, createdById, createdAt, expiryAt?)

**Indexes**: Task(status+dueAt, assigneeId, assignerId), PointEntry(userId+createdAt), Issue(status+category), Spending(at+type), PurchaseItem(status+preferredSupplier)

**Retention Job**: purge Attachments after **6 months** (proofs/receipts).

---

## 11) API Surface (example REST)
Auth: `POST /auth/login`, `GET /me`

Tasks:  
- `GET/POST /tasks` ; `PATCH /tasks/:id`  
- `POST /tasks/:id/claim` ; `POST /tasks/:id/submit` ; `POST /tasks/:id/approve` ; `POST /tasks/:id/reject`  
- `POST /tasks/:id/hold` ; `POST /tasks/:id/resume`

Discipline/Points:  
- `POST /discipline` ; `GET /discipline?userId=`  
- `POST /points/adjust` (manual, if enabled)

Leaderboard/Reports:  
- `GET /leaderboard?range=weekly|monthly|alltime&role=&station=`  
- `GET /reports/top-performers.csv`

Staff & Skills:  
- `GET/POST /staff` ; `PATCH /staff/:id` ; `POST /staff/:id/docs`  
- `GET/POST /skills` ; `POST /skills/verify`

Recipes:  
- `GET/POST /recipes` ; `GET /recipes/:id` ; `PATCH /recipes/:id` ; `POST /recipes/:id/print`

Staff Meal:  
- `GET/POST /meals` ; `GET /meals/:id` ; `PATCH /meals/:id`

Disposal:  
- `GET/POST /disposals` ; `PATCH /disposals/:id`

Issues:  
- `GET/POST /issues` ; `PATCH /issues/:id` ; `POST /issues/:id/apply-points` ; `POST /issues/:id/create-task`

Purchase List:  
- `GET/POST /purchases` ; `PATCH /purchases/:id` ; `POST /purchases/whatsapp-preview`

Spending:  
- `GET/POST /spending` ; `PATCH /spending/:id` ; `POST /spending/:id/approve` ; `POST /spending/:id/lock` ; `GET /spending/export.csv` ; `GET /spending/monthly.pdf`

Reminders:  
- `POST /reminders` ; `DELETE /reminders/:id`

Attachments:  
- `POST /attachments` ; `DELETE /attachments/:id`

---

## 12) System Jobs & PWA
**Schedulers:**  
- `spawnRepeatedTasks` (midnight/custom)  
- `markOverdueAndReturnToAssigner` (hourly)  
- `purgeExpiredPhotos` (daily)  
- `recalcLeaderboards` (nightly optional)

**PWA:**  
- Installable; minimal SW: app shell cache + local notifications.  
- Offline requirement: **only** local notifications must work offline; other flows online.

---

## 13) Security & NFR
- **Auth:** Username/password; salted hash; rate limiting; session TTL.  
- **RBAC:** Server‑side checks for all protected routes.  
- **Audit logs:** Sensitive actions (approvals, point awards, discipline, spending locks).  
- **Performance:** P95 < 250ms core APIs; CDN for assets.  
- **Reliability:** Retry for uploads; background purge; idempotent approvals.  
- **Observability:** Structured logs, error tracking; exportable audit.  
- **Scalability:** 100 active users, 10k tasks/month target.

---

## 14) UI/UX Notes
- Neutral theme; status chips for Tasks/Issues/Spending.  
- Approve modal shows base points, multiplier, adjustment, **computed total**, and **remaining budget** meter; hard‑block if over budget.  
- Purchase List WhatsApp builder groups by supplier with copy buttons.  
- Skills: skill matrix (desktop), per‑staff list (mobile), “points awarded” toast on first verification.  
- Spending: math preview for Net/Tax/Gross when switching inclusive/exclusive.  
- i18n toggle (EN/ID/VI/MY) in header; key strings centralized.

---

## 15) Analytics & KPIs
- % tasks completed on time; average approval time; weekly active staff.  
- Points issued vs. management **budget utilization**.  
- Leaderboard views/day; Top 10 churn.  
- Staff Meal: weekly count & cost; Disposal: daily waste qty/value (manual).  
- Issues: time‑to‑resolve, points applied per category.  
- Purchase List → Ordered lead time; Spending totals by type/month.

---

## 16) Acceptance Criteria (MVP)
- Task lifecycle + approvals + statuses exactly as specified.  
- Point system with Owner‑only settings, daily budgets, multipliers, adjustments.  
- Disciplinary actions (not vs Owner) with audit logs.  
- Leaderboard Top 10 with filters/time ranges.  
- Staff Directory with mandatory fields & documents.  
- Skills with verification and first‑time award.  
- Recipes with required photo + print card.  
- **Ops modules** live: Staff Meal, Disposal, Issues (points with manager/owner extras), Purchase List (WhatsApp builder), Spending (draft→approved→locked, receipts).  
- Task‑linked reminders, quiet hours 22:00–08:00.  
- i18n MVP locales enabled.  
- CSV/PDF exports where specified.  
- Photo/receipt retention: purge after 6 months.

---

## 17) Dev Plan for Cursor (scaffold checklist)
1. Monorepo (frontend React+TS+Vite, backend Fastify/Express).  
2. Prisma schema from Data Model; seed: roles, stations, disciplinary types, skills, templates.  
3. Auth (username/password), sessions, RBAC middleware.  
4. REST endpoints as listed; zod validators; error handling.  
5. UI Routes: Dashboard, Tasks, Leaderboard, Staff, Recipes, Staff Meal, Disposal, Issues, Purchase List, Spending, Reports, Admin.  
6. Approvals: modal with budget check and audit log write.  
7. Jobs: repeats spawn, overdue sweep, retention purge, optional leaderboard materialize.  
8. PWA shell + local notifications + quiet hours guard.  
9. i18n (en/id/vi/my) with keys; status labels and CTAs localized.  
10. Exports: CSV for Top performers/Spending; monthly PDF summary for Spending.

---

## 18) Open Items (minor)
- Reward thresholds (points → extra day off) initial values.  
- Default multiplier range (proposal 0.5×–3×).  
- Tax percentages for Spending (SST default set) and category lists confirmation.  
- Which users get **Purchasing** capability by default (suggest: Owner/Manager; HoK/FDM optional).

