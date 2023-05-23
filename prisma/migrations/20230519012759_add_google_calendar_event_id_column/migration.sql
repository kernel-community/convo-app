-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "gCalEventId" TEXT;
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "gCalEventRequested" BOOLEAN NOT NULL DEFAULT false;
