import type { Metadata } from "next";
import { getAllTalks, talksHubProps } from "@/lib/talks";
import { TalksHub } from "@/components/talks/TalksHub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AIR Talks, AIR Club UdeSA",
  description:
    "Divulgación y discusión técnica: tesistas, estudiantes e investigadores invitados hablan de IA y robótica. Archivo histórico, slides interactivas y próxima charla.",
  path: "/talks",
});

// ISR: se pre-renderiza como página estática para navegación instantánea y se revalida
// cada 60s en segundo plano, o al instante ante cambios desde /admin vía revalidatePath("/talks").
export const revalidate = 60;

export default async function TalksPage() {
  return <TalksHub {...talksHubProps(await getAllTalks())} />;
}
