/*
  Warnings:

  - You are about to drop the column `isAddedToGoogleCalendar` on the `Rsvp` table. All the data in the column will be lost.
  - You are about to drop the `_EventToGoogle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventToSlack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventToGoogle" DROP CONSTRAINT "_EventToGoogle_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToGoogle" DROP CONSTRAINT "_EventToGoogle_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSlack" DROP CONSTRAINT "_EventToSlack_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSlack" DROP CONSTRAINT "_EventToSlack_B_fkey";

-- AlterTable
ALTER TABLE "Rsvp" DROP COLUMN "isAddedToGoogleCalendar";

-- DropTable
DROP TABLE "_EventToGoogle";

-- DropTable
DROP TABLE "_EventToSlack";
