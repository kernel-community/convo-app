/*
  Warnings:

  - You are about to drop the column `connectedUserId` on the `Connections` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Connections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fromId,toId]` on the table `Connections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fromId` to the `Connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `Connections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Connections" DROP CONSTRAINT "Connections_connectedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Connections" DROP CONSTRAINT "Connections_userId_fkey";

-- DropIndex
DROP INDEX "Connections_connectedUserId_userId_key";

-- AlterTable
ALTER TABLE "Connections" DROP COLUMN "connectedUserId",
DROP COLUMN "userId",
ADD COLUMN     "fromId" TEXT NOT NULL,
ADD COLUMN     "toId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Connections_fromId_toId_key" ON "Connections"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
