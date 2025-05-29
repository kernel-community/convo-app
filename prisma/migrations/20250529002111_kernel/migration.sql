-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "socialHandle" TEXT;

-- CreateTable
CREATE TABLE "ProfileHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "keywords" TEXT[],
    "url" TEXT,
    "Handle" TEXT,
    "currentAffiliation" TEXT,
    "changedBy" TEXT,

    CONSTRAINT "ProfileHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProfileHistory" ADD CONSTRAINT "ProfileHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
