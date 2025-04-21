/*
  Warnings:

  - You are about to drop the column `proposerId` on the `Event` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'WAITLISTED';

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_proposerId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "proposerId";

-- CreateTable
CREATE TABLE "EventProposer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventProposer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventProposer_eventId_userId_key" ON "EventProposer"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventProposer" ADD CONSTRAINT "EventProposer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventProposer" ADD CONSTRAINT "EventProposer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
