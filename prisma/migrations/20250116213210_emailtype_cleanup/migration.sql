/*
  Warnings:

  - You are about to drop the `ReminderEmail` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('CREATE', 'INVITE', 'UPDATE', 'REMINDER24HR', 'REMINDER1HR', 'REMINDER1MIN', 'REMINDER1HRPROPOSER');

-- DropForeignKey
ALTER TABLE "ReminderEmail" DROP CONSTRAINT "ReminderEmail_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ReminderEmail" DROP CONSTRAINT "ReminderEmail_userId_fkey";

-- DropTable
DROP TABLE "ReminderEmail";

-- DropEnum
DROP TYPE "ReminderType";

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Email_reminderId_key" ON "Email"("reminderId");

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
