-- CreateEnum
CREATE TYPE "ProfileAffiliation" AS ENUM ('UDESA', 'OTHER_UNIVERSITY', 'WORK', 'INDEPENDENT');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "affiliation" "ProfileAffiliation",
ADD COLUMN     "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "institution" TEXT;
