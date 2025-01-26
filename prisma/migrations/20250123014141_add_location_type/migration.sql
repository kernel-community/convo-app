-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ONLINE', 'MAP', 'CUSTOM');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "locationType" "LocationType" NOT NULL DEFAULT 'ONLINE';
