-- AlterTable: la primera vez que el perfil quedó completo (ser miembro de la comunidad). NULL-able: lo completa saveProfileAction.
ALTER TABLE "UserProfile" ADD COLUMN     "communityJoinedAt" TIMESTAMP(3);

-- Los perfiles que ya estaban completos (mismo criterio que isProfileComplete) toman la fecha en que aceptaron el aviso.
-- Los incompletos quedan en NULL hasta que lo completen.
UPDATE "UserProfile"
SET "communityJoinedAt" = "consentAcceptedAt"
WHERE "consentAcceptedAt" IS NOT NULL
  AND btrim(COALESCE("fullName", '')) <> ''
  AND "affiliation" IS NOT NULL
  AND ("affiliation" NOT IN ('OTHER_UNIVERSITY', 'WORK') OR btrim(COALESCE("institution", '')) <> '');
