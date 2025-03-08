/*
  Warnings:

  - You are about to drop the `Google` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Google" DROP CONSTRAINT "Google_communityId_fkey";

-- DropTable
DROP TABLE "Google";
