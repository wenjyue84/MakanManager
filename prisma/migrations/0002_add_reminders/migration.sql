-- Migration to add Reminder table linked to Task
CREATE TABLE "Reminder" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL,
  "remindAt" TIMESTAMP NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reminder_task_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
);
