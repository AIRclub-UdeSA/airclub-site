import { prisma } from "./prisma";
import {
  founders as seedFounders,
  collaborators as seedCollaborators,
  type SeedTeamMember,
} from "../../prisma/seed-data/team";

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

function fromSeed({ name, role, photoUrl, links }: SeedTeamMember): TeamMemberItem {
  return { name, role, photoUrl, links };
}

// Igual que talks.ts: lee de Prisma con fallback a seed-data si no hay conexión a base.
export async function getFounders(): Promise<TeamMemberItem[]> {
  try {
    const rows = await prisma.teamMember.findMany({
      where: { group: "FOUNDER", active: true },
      orderBy: { order: "asc" },
    });
    return rows.map(toTeamMemberItem);
  } catch {
    return seedFounders.map(fromSeed);
  }
}

export async function getCollaborators(): Promise<TeamMemberItem[]> {
  try {
    const rows = await prisma.teamMember.findMany({
      where: { group: "COLLABORATOR", active: true },
      orderBy: { order: "asc" },
    });
    return rows.map(toTeamMemberItem);
  } catch {
    return seedCollaborators.map(fromSeed);
  }
}

/** Foto grupal de Fundadores y el texto de su cartel. */
export type GroupPhoto = { photo: string; caption: string };

/** Lo fijo del código, que se usa mientras no se cambie desde /admin/equipo. */
export const DEFAULT_FOUNDERS_PHOTO: GroupPhoto = { photo: "/equipo.jpg", caption: "Los fundadores del AIR Club" };

export async function getFoundersPhoto(): Promise<GroupPhoto> {
  try {
    const row = await prisma.teamGroupPhoto.findUnique({ where: { group: "FOUNDER" } });
    return row ? { photo: row.photoUrl, caption: row.caption } : DEFAULT_FOUNDERS_PHOTO;
  } catch {
    return DEFAULT_FOUNDERS_PHOTO;
  }
}
