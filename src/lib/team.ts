import { team as seedTeam, type SeedTeamMember } from "../../prisma/seed-data/team";

export type TeamMemberItem = SeedTeamMember;

export async function getTeamMembers(): Promise<TeamMemberItem[]> {
  return [...seedTeam];
}
