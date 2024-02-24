/*
  Warnings:

  - You are about to drop the `_CommunityToEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[communityId]` on the table `Google` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[communityId]` on the table `Slack` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CommunityToEvent" DROP CONSTRAINT "_CommunityToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CommunityToEvent" DROP CONSTRAINT "_CommunityToEvent_B_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "communityId" TEXT;

-- DropTable
DROP TABLE "_CommunityToEvent";

-- CreateIndex
CREATE UNIQUE INDEX "Google_communityId_key" ON "Google"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Slack_communityId_key" ON "Slack"("communityId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;
