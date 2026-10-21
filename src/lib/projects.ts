import {
  projects as seedProjects,
  teasers as seedTeasers,
  boardStickers as seedStickers,
  type SeedProject,
  type SeedTeaser,
  type BoardSticker,
} from "../../prisma/seed-data/projects";

export { AREAS, PAPER_SHADES } from "../../prisma/seed-data/projects";
export type { Area, Fastener, MilestoneState, ProjectStatus } from "../../prisma/seed-data/projects";

export type ProjectItem = SeedProject;
export type TeaserItem = SeedTeaser;
export type { BoardSticker };

export async function getAllProjects(): Promise<ProjectItem[]> {
  return [...seedProjects];
}

/** Papeles de relleno del tablero: proyectos "en proceso" y la invitación a proponer uno. */
export async function getProjectTeasers(): Promise<TeaserItem[]> {
  return [...seedTeasers];
}

export async function getBoardStickers(): Promise<BoardSticker[]> {
  return [...seedStickers];
}
