import { robots as seedRobots, type SeedRobot } from "../../prisma/seed-data/robots";

export type RobotItem = SeedRobot;

export async function getRobots(): Promise<RobotItem[]> {
  return [...seedRobots];
}

export async function getRobotBySlug(slug: string): Promise<RobotItem | undefined> {
  const all = await getRobots();
  return all.find((r) => r.slug === slug);
}
