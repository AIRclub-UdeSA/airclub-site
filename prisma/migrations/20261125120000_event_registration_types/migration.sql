-- Eventos en la base con tipo de inscripción. Solo suma (columnas, enums y una fila); no borra ni renombra nada.
-- `rsvpEnabled` queda en desuso y se retira en un PR aparte.

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WORKSHOP', 'COMPETITION', 'MEETUP', 'TALK');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('NONE', 'EXTERNAL_LINK', 'INDIVIDUAL', 'TEAM');

-- AlterTable
ALTER TABLE "Event"
    ADD COLUMN "category" "EventCategory" NOT NULL DEFAULT 'MEETUP',
    ADD COLUMN "dateLabel" TEXT,
    ADD COLUMN "instructor" TEXT,
    ADD COLUMN "prerequisites" TEXT,
    ADD COLUMN "track" TEXT,
    ADD COLUMN "ctaLabel" TEXT,
    ADD COLUMN "registrationType" "RegistrationType" NOT NULL DEFAULT 'NONE',
    ADD COLUMN "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "registrationDeadline" TIMESTAMP(3),
    ADD COLUMN "audience" "Audience" NOT NULL DEFAULT 'ALL',
    ADD COLUMN "teamMinSize" INTEGER,
    ADD COLUMN "teamMaxSize" INTEGER;

-- AlterTable: la inscripción individual no guarda nombre (sale del perfil), como TalkRegistration.
ALTER TABLE "EventRegistration" ALTER COLUMN "name" DROP NOT NULL;

-- Challenge JAR 2026 (el evento que hasta ahora vivía en el array de prisma/seed-data/events.ts). Se copia acá y no en el
-- seed para que quede en la base en el mismo deploy que lee de ella, sin depender de que alguien corra `db:seed` contra
-- producción. Si la fila ya existía, solo se completan las columnas nuevas y no se pisa nada de lo ya cargado.
INSERT INTO "Event" (
    "id", "slug", "title", "tagline", "description", "category", "location", "startsAt", "endsAt", "dateLabel",
    "status", "externalUrl", "ctaLabel", "registrationType", "featuredForCountdown", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'jar-2026',
    'Challenge JAR 2026, Rosario',
    'Jornadas Argentinas de Robótica',
    'El AIR Club UdeSA organiza un challenge interuniversitario de robótica móvil autónoma con robots ROSMASTER X3 en pista física de competencia.',
    'COMPETITION',
    'Rosario, Santa Fe',
    '2026-11-03T12:00:00.000Z',
    '2026-11-06T21:00:00.000Z',
    '3 al 6 de Noviembre de 2026',
    'PUBLISHED',
    'https://airclub-udesa.github.io/jar_site/',
    'Web Oficial Challenge JAR 2026',
    'EXTERNAL_LINK',
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "category" = 'COMPETITION',
    "dateLabel" = '3 al 6 de Noviembre de 2026',
    "ctaLabel" = 'Web Oficial Challenge JAR 2026',
    "registrationType" = 'EXTERNAL_LINK';
