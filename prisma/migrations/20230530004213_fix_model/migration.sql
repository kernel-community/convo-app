/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `Google` will be added. If there are existing duplicate values, this will fail.
  - Made the column `accessToken` on table `Google` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `Google` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scope` on table `Google` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenType` on table `Google` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiryDate` on table `Google` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Google" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL,
ALTER COLUMN "scope" SET NOT NULL,
ALTER COLUMN "tokenType" SET NOT NULL,
ALTER COLUMN "expiryDate" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Google_clientId_key" ON "Google"("clientId");
