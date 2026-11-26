-- Marca explícita de "todo el día" en un evento (sin horario en el sitio). Solo suma una columna.

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "allDay" BOOLEAN NOT NULL DEFAULT false;

-- Los eventos que ya estaban cargados "de todo el día" (el panel los guardaba de 00:00 a 23:59 de Buenos Aires, que en
-- UTC son las 03:00 del día y las 02:59 del siguiente) quedan marcados. Argentina no tiene horario de verano.
UPDATE "Event"
SET "allDay" = true
WHERE "startsAt"::time = '03:00:00'
  AND "endsAt" IS NOT NULL
  AND "endsAt"::time = '02:59:00';
