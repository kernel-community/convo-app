/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('JUNTO');

-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionText" TEXT,
    "descriptionHtml" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "series" BOOLEAN NOT NULL,
    "limit" INTEGER NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'JUNTO',
    "proposerId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_eventId_attendeeId_key" ON "Rsvp"("eventId", "attendeeId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
