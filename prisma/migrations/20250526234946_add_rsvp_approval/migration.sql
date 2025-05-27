-- CreateEnum
CREATE TYPE "RSVP_APPROVAL_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailType" ADD VALUE 'APPROVAL_REQUESTED';
ALTER TYPE "EmailType" ADD VALUE 'APPROVAL_APPROVED';
ALTER TYPE "EmailType" ADD VALUE 'APPROVAL_REJECTED';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RsvpApprovalRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rsvpType" "RSVP_TYPE" NOT NULL,
    "status" "RSVP_APPROVAL_STATUS" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewMessage" TEXT,

    CONSTRAINT "RsvpApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RsvpApprovalRequest_eventId_userId_key" ON "RsvpApprovalRequest"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "RsvpApprovalRequest" ADD CONSTRAINT "RsvpApprovalRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpApprovalRequest" ADD CONSTRAINT "RsvpApprovalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpApprovalRequest" ADD CONSTRAINT "RsvpApprovalRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
