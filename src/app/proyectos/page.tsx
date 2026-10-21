import type { Metadata } from "next";
import { getAllProjects, getBoardStickers, getProjectTeasers } from "@/lib/projects";
import { ProjectsBoard } from "@/components/proyectos/ProjectsBoard";
import { IdeaCallout } from "@/components/home/IdeaCallout";
import { buildMetadata } from "@/lib/seo";
import "./styles.css";

export const metadata: Metadata = buildMetadata({
  title: "Proyectos, AIR Club UdeSA",
  description:
    "El tablero de proyectos del AIR Club UdeSA: un corcho con todo lo que el club está construyendo. Mirá en qué estamos trabajando y sumate.",
  path: "/proyectos",
});

export default async function ProyectosPage() {
  const [projects, teasers, stickers] = await Promise.all([getAllProjects(), getProjectTeasers(), getBoardStickers()]);

  return (
    <>
      <ProjectsBoard projects={projects} teasers={teasers} stickers={stickers} />
      <IdeaCallout />
    </>
  );
}
