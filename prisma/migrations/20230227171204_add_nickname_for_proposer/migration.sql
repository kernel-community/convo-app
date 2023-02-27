-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "nickname" TEXT NOT NULL DEFAULT 'Anonymous';

/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
DROP COLUMN "name";
