-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Normalize existing string values to uppercase to match enum
UPDATE "Task" SET "priority" = UPPER("priority");

-- AlterTable: cast existing text column to new enum
ALTER TABLE "Task"
  ALTER COLUMN "priority" TYPE "TaskPriority"
  USING "priority"::"TaskPriority";

-- CreateIndex
CREATE INDEX "Hospital_deletedAt_idx" ON "Hospital"("deletedAt");

-- CreateIndex
CREATE INDEX "Task_hospitalId_idx" ON "Task"("hospitalId");

-- CreateIndex
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");
