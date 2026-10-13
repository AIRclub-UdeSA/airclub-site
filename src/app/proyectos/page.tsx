import type { Metadata } from "next";
import { ProjectBoard } from "@/components/proyectos/ProjectBoard";
import { IdeaCallout } from "@/components/home/IdeaCallout";
import { buildMetadata } from "@/lib/seo";
import "./styles.css";

export const metadata: Metadata = buildMetadata({
  title: "Proyectos, AIR Club UdeSA",
  description:
    "El tablero de proyectos del AIR Club UdeSA: navegación autónoma, visión, simulación y más. Mirá en qué estamos trabajando y sumate.",
  path: "/proyectos",
});

export default function ProyectosPage() {
  return (
    <>
      <ProjectBoard />
      <IdeaCallout />
    </>
  );
}
