-- CreateEnum
CREATE TYPE "TalkStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Talk" DROP COLUMN "details",
DROP COLUMN "placeholder",
ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "TalkStatus" NOT NULL DEFAULT 'PUBLISHED';

