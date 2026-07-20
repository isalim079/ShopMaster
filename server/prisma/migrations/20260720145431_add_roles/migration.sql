-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_slug_idx" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- Seed system roles (stable ids for migration mapping)
INSERT INTO "Role" ("id", "name", "slug", "description", "isSystem", "createdAt", "updatedAt")
VALUES
  ('role_super_admin', 'Super Admin', 'SUPER_ADMIN', 'Full system access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_admin', 'Admin', 'ADMIN', 'Administrative access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_manager', 'Manager', 'MANAGER', 'Operational management access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role_employee', 'Employee', 'EMPLOYEE', 'Standard employee access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add nullable roleId first
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Backfill from legacy enum column
UPDATE "User"
SET "roleId" = CASE "role"::text
  WHEN 'SUPER_ADMIN' THEN 'role_super_admin'
  WHEN 'ADMIN' THEN 'role_admin'
  WHEN 'MANAGER' THEN 'role_manager'
  WHEN 'EMPLOYEE' THEN 'role_employee'
  ELSE 'role_employee'
END;

-- Default any nulls (should not happen)
UPDATE "User" SET "roleId" = 'role_employee' WHERE "roleId" IS NULL;

-- Drop legacy enum column
ALTER TABLE "User" DROP COLUMN "role";

-- Enforce NOT NULL + FK
ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;

CREATE INDEX "User_roleId_idx" ON "User"("roleId");

ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "UserRole";
