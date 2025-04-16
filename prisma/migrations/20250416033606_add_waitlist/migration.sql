-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'OFF_WAITLIST';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RSVP_TYPE" ADD VALUE 'REMINDER72HR';
ALTER TYPE "RSVP_TYPE" ADD VALUE 'REMINDER72HRPROPOSER';
ALTER TYPE "RSVP_TYPE" ADD VALUE 'OFF_WAITLIST';

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Waitlist_eventId_createdAt_idx" ON "Waitlist"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_eventId_userId_key" ON "Waitlist"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
