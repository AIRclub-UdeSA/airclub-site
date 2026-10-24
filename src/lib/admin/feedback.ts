import "server-only";
import { prisma } from "@/lib/prisma";

/** Feedback que todavía nadie miró, para el contador de la barra del panel y de la tarjeta de /admin (#123). */
export function countNewFeedback(): Promise<number> {
  return prisma.feedback.count({ where: { status: "NUEVO" } });
}
