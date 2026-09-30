-- Hasta la migración 20260930000000_team_member_group_slug, `role` guardaba el grupo de /equipo
-- ("Fundador" / "Colaborador"). Ahora el grupo vive en `group` y `role` es el cargo de cada
-- persona, así que esos valores viejos se vacían. Va en una migración aparte porque había que
-- esperar a que producción dejara de agrupar por `role` (PR #29).
UPDATE "TeamMember" SET "role" = NULL WHERE "role" IN ('Fundador', 'Colaborador');
