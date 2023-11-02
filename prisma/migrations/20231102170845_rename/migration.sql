/*
  Warnings:

  - You are about to drop the `Collections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CollectionsToEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collections" DROP CONSTRAINT "Collections_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionsToEvent" DROP CONSTRAINT "_CollectionsToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionsToEvent" DROP CONSTRAINT "_CollectionsToEvent_B_fkey";

-- DropTable
DROP TABLE "Collections";

-- DropTable
DROP TABLE "_CollectionsToEvent";

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToEvent_AB_unique" ON "_CollectionToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToEvent_B_index" ON "_CollectionToEvent"("B");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToEvent" ADD CONSTRAINT "_CollectionToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToEvent" ADD CONSTRAINT "_CollectionToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
