/*
  Warnings:

  - You are about to drop the column `scheduled1hrEmailReminderId` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled1minEmailReminderId` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled24hrEmailReminderId` on the `Rsvp` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('REMINDER24HR', 'REMINDER1HR', 'REMINDER1MIN', 'REMINDER1HRPROPOSER');

-- AlterTable
ALTER TABLE "Rsvp" DROP COLUMN "scheduled1hrEmailReminderId",
DROP COLUMN "scheduled1minEmailReminderId",
DROP COLUMN "scheduled24hrEmailReminderId";

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_reminderId_key" ON "Reminder"("reminderId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
