/*
  Warnings:

  - The values [ARCHIEVED] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tastStatus` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,organizationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
ALTER TABLE "public"."Project" ALTER COLUMN "projectStatus" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "projectStatus" TYPE "ProjectStatus_new" USING ("projectStatus"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "Project" ALTER COLUMN "projectStatus" SET DEFAULT 'PLANNING';
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "logoUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "dueDate" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "tastStatus",
ADD COLUMN     "taskStatus" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "organizationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_organizationId_key" ON "User"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
