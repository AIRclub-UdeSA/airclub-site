import type { Metadata } from "next";
import { getAllProjects, getBoardStickers } from "@/lib/projects";
import { ProjectsBoard } from "@/components/proyectos/ProjectsBoard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Proyectos, AIR Club UdeSA",
  description:
    "El tablero interactivo de proyectos de AIR Club: navegación autónoma, visión artificial, gemelo digital y desarrollo robótico.",
  path: "/proyectos",
});

export default async function ProyectosPage() {
  const [projects, stickers] = await Promise.all([getAllProjects(), getBoardStickers()]);

  return <ProjectsBoard projects={projects} stickers={stickers} />;
}
