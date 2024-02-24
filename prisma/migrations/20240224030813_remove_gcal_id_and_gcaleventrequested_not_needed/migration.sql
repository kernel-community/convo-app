/*
  Warnings:

  - You are about to drop the column `gCalEventRequested` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `gCalId` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "gCalEventRequested",
DROP COLUMN "gCalId";
