-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "customData" JSONB,
ADD COLUMN     "project" TEXT,
ADD COLUMN     "projectDescription" TEXT,
ADD COLUMN     "projectUrl" TEXT,
ADD COLUMN     "uploadFileName" TEXT,
ADD COLUMN     "uploadMimeType" TEXT,
ADD COLUMN     "uploadUrl" TEXT;
