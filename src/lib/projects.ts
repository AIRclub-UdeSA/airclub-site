import {
  projects as seedProjects,
  boardStickers as seedStickers,
  type SeedProject,
  type BoardSticker,
  type ProjectLink,
  type ProjectPin,
} from "../../prisma/seed-data/projects";

export type ProjectItem = SeedProject;
export type { BoardSticker, ProjectLink, ProjectPin };

export async function getAllProjects(): Promise<ProjectItem[]> {
  return [...seedProjects];
}

export async function getBoardStickers(): Promise<BoardSticker[]> {
  return [...seedStickers];
}
