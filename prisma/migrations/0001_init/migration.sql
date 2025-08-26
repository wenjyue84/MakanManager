-- Initial migration creating staff and task tables
CREATE TABLE "Staff" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "roles" TEXT NOT NULL,
  "gender" TEXT,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "startDate" TIMESTAMP,
  "status" TEXT DEFAULT 'active',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Task" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT DEFAULT 'open',
  "dueDate" TIMESTAMP,
  "basePoints" INTEGER DEFAULT 0,
  "assignerId" TEXT,
  "assigneeId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_assigner_fkey" FOREIGN KEY ("assignerId") REFERENCES "Staff"("id"),
  CONSTRAINT "Task_assignee_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Staff"("id")
);
