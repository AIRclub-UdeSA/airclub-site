import {
  collaborators as seedCollaborators,
  founders as seedFounders,
  type SeedTeamMember,
} from "../../prisma/seed-data/team";

export type TeamMemberItem = SeedTeamMember;

// Fase 1: lee de los arrays tipados en prisma/seed-data. Cuando se conecte Postgres estas funciones pasan a consultar
// Prisma, pero la firma no cambia.
export async function getFounders(): Promise<TeamMemberItem[]> {
  return [...seedFounders];
}

export async function getCollaborators(): Promise<TeamMemberItem[]> {
  return [...seedCollaborators];
}
