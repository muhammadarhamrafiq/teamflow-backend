-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "description" SET DEFAULT 'No description available for this organization';

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" SET DEFAULT 'No description available for this project';

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "description" SET DEFAULT 'No description available for this task';
