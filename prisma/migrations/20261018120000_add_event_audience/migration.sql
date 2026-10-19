-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('UDESA', 'ALL');

-- AlterTable: lo que ya existe queda "solo UdeSA"; las nuevas filas no traen valor por defecto, se elige a propósito.
ALTER TABLE "Talk" ADD COLUMN     "audience" "Audience" NOT NULL DEFAULT 'UDESA';
ALTER TABLE "Talk" ALTER COLUMN "audience" DROP DEFAULT;

ALTER TABLE "WorkshopSession" ADD COLUMN     "audience" "Audience" NOT NULL DEFAULT 'UDESA';
ALTER TABLE "WorkshopSession" ALTER COLUMN "audience" DROP DEFAULT;
