/*
  Warnings:

  - A unique constraint covering the columns `[userId,communityId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProfileHistory" DROP CONSTRAINT "ProfileHistory_profileId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "communityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_communityId_key" ON "Profile"("userId", "communityId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHistory" ADD CONSTRAINT "ProfileHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
