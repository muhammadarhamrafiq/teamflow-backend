-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "avatarUrl" TEXT;
