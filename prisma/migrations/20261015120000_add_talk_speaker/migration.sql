-- Varios oradores por charla. Migración aditiva: no borra ni modifica columnas de "Talk".
-- Es idempotente (IF NOT EXISTS, WHERE NOT EXISTS), así que se puede volver a correr si quedó a medias.

-- CreateTable
CREATE TABLE IF NOT EXISTS "TalkSpeaker" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "affiliation" TEXT,
    "avatar" TEXT,
    "linkedin" TEXT,
    "bio" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TalkSpeaker_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TalkSpeaker_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "Talk"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TalkSpeaker_talkId_idx" ON "TalkSpeaker"("talkId");

-- Copia el orador único de cada charla que lo tiene (rol vacío si no tenía: la columna nueva es obligatoria).
INSERT INTO "TalkSpeaker" ("id", "talkId", "name", "role", "affiliation", "avatar", "linkedin", "bio", "order")
SELECT gen_random_uuid()::text, t."id", t."speakerName", COALESCE(t."speakerRole", ''),
       t."speakerAffiliation", t."speakerAvatar", t."speakerLinkedin", t."speakerBio", 0
FROM "Talk" t
WHERE t."speakerName" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "TalkSpeaker" s WHERE s."talkId" = t."id");
