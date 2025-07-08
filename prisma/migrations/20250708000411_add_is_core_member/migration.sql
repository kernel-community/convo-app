-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isCoreMember" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_CollectionToEvent" ADD CONSTRAINT "_CollectionToEvent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CollectionToEvent_AB_unique";
