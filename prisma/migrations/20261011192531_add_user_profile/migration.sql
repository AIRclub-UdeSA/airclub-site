-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('STUDENT', 'PROFESSOR', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('STUDYING', 'GRADUATED');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ProfileRole" NOT NULL,
    "otherRole" TEXT,
    "careers" TEXT[],
    "startYear" INTEGER,
    "studentStatus" "StudentStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
