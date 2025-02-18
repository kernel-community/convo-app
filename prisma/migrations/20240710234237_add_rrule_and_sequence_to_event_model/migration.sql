-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "rrule" TEXT,
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;
