/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,userId]` on the table `MembershipInvite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,name]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MembershipInvite_organizationId_userId_key" ON "MembershipInvite"("organizationId", "userId") WHERE (status = 'PENDING');

-- CreateIndex
CREATE UNIQUE INDEX "Project_organizationId_name_key" ON "Project"("organizationId", "name") WHERE ("projectStatus" <> 'ARCHIVED' );
