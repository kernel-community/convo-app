/*
  Warnings:

  - You are about to drop the column `googleServiceId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `slackServiceId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_googleServiceId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_slackServiceId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "googleServiceId",
DROP COLUMN "slackServiceId";

-- CreateTable
CREATE TABLE "_EventToSlack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EventToGoogle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventToSlack_AB_unique" ON "_EventToSlack"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToSlack_B_index" ON "_EventToSlack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToGoogle_AB_unique" ON "_EventToGoogle"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToGoogle_B_index" ON "_EventToGoogle"("B");

-- AddForeignKey
ALTER TABLE "_EventToSlack" ADD CONSTRAINT "_EventToSlack_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSlack" ADD CONSTRAINT "_EventToSlack_B_fkey" FOREIGN KEY ("B") REFERENCES "Slack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToGoogle" ADD CONSTRAINT "_EventToGoogle_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToGoogle" ADD CONSTRAINT "_EventToGoogle_B_fkey" FOREIGN KEY ("B") REFERENCES "Google"("id") ON DELETE CASCADE ON UPDATE CASCADE;
