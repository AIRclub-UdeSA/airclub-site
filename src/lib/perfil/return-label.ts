/**
 * A dónde vuelve la persona al terminar de completar el perfil (el `next` de /perfil/completar), dicho en una frase
 * ("a Contacto"), para avisárselo en la pantalla. null si vuelve al perfil, que ya es donde se espera terminar.
 */
const DESTINATIONS: [prefix: string, phrase: string][] = [
  ["/contacto", "a Contacto"],
  ["/equipo", "a Equipo"],
  ["/talks", "a AIR Talks"],
  ["/eventos", "a Eventos"],
  ["/workshops", "a Workshops"],
];

export function returnPhrase(target: string): string | null {
  const [path, query = ""] = target.split("#")[0].split("?");
  // Después de entrar desde "Inscribirme", lo que sigue es el diálogo de la charla o del taller.
  if (new URLSearchParams(query).has("inscribir")) return "a tu inscripción";
  if (path === "/") return "al inicio";
  const found = DESTINATIONS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return found ? found[1] : null;
}
