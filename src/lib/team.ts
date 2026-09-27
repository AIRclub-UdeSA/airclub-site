import { prisma } from "./prisma";

export type TeamMemberItem = {
  name: string;
  role?: string;
  photoUrl?: string;
  links?: {
    linkedin?: string;
    linkedinPhoto?: string;
    github?: string;
  };
};

type TeamMemberRow = {
  name: string;
  role: string | null;
  photoUrl: string | null;
  linkedin: string | null;
  linkedinPhoto: string | null;
  github: string | null;
};

function toTeamMemberItem(row: TeamMemberRow): TeamMemberItem {
  const hasLinks = row.linkedin || row.linkedinPhoto || row.github;
  return {
    name: row.name,
    role: row.role ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    links: hasLinks
      ? {
          linkedin: row.linkedin ?? undefined,
          linkedinPhoto: row.linkedinPhoto ?? undefined,
          github: row.github ?? undefined,
        }
      : undefined,
  };
}

export async function getFounders(): Promise<TeamMemberItem[]> {
  const rows = await prisma.teamMember.findMany({
    where: { role: "Fundador", active: true },
    orderBy: { order: "asc" },
  });
  return rows.map(toTeamMemberItem);
}

export async function getCollaborators(): Promise<TeamMemberItem[]> {
  const rows = await prisma.teamMember.findMany({
    where: { role: "Colaborador", active: true },
    orderBy: { order: "asc" },
  });
  return rows.map(toTeamMemberItem);
}
