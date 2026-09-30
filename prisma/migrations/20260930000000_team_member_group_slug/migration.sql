-- Separa el grupo de /equipo (group) del cargo de cada persona (role), y agrega un slug estable
-- para que el seed actualice en vez de borrar y recrear.
--
-- Solo agrega columnas: no toca `role`. El código anterior agrupa por role = 'Fundador' /
-- 'Colaborador' y la base es compartida con producción, así que vaciar role acá dejaría /equipo
-- vacío en el sitio en vivo hasta el deploy. La limpieza de role va en una migración aparte,
-- después del deploy.

-- CreateEnum
CREATE TYPE "TeamGroup" AS ENUM ('FOUNDER', 'COLLABORATOR');

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "group" "TeamGroup",
ADD COLUMN "slug" TEXT;

-- Backfill
UPDATE "TeamMember" SET "group" = CASE WHEN "role" = 'Colaborador' THEN 'COLLABORATOR'::"TeamGroup" ELSE 'FOUNDER'::"TeamGroup" END;
UPDATE "TeamMember" SET "slug" = trim(both '-' from lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')));

ALTER TABLE "TeamMember" ALTER COLUMN "group" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");
