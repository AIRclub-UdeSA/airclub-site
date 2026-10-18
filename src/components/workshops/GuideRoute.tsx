import { ArrowUpRight } from "lucide-react";
import type { AsyncWorkshop } from "@/lib/workshops";
import { RouteProgress } from "./RouteProgress";
import { RouteSteps } from "./RouteSteps";
import { SectionLayout } from "./SectionLayout";
import { LevelLegend } from "./level";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Recorrido asincrónico de una línea (hoy, el del Challenge JAR): las guías en orden, sobre una ruta vertical con un nodo
 * por semana. El orden es el diseño: cada guía deja andando algo que la siguiente da por hecho, y "Requiere" enlaza a esas
 * semanas. Cada tarjeta lleva a la página del workshop; el color sigue el progreso de la persona (ver RouteSteps).
 */
export function GuideRoute({
  guides,
  totalHours,
  back,
  setupUrl,
  repoUrl,
}: {
  guides: AsyncWorkshop[];
  totalHours: string;
  back: string;
  /** Guía de instalación del workshop (el setup del simulador del JAR). */
  setupUrl?: string;
  /** Repositorio que se clona antes de la primera guía. */
  repoUrl?: string;
}) {
  const first = guides[0];

  return (
    <SectionLayout
      title="Guías a tu ritmo"
      intro={introOf(guides, totalHours)}
      aside={
        <div className="flex flex-col gap-6">
          <RouteProgress guides={guides} back={back} />
          <LevelLegend />
        </div>
      }
    >
      <RouteSteps
        guides={guides}
        before={
          first?.ros2Package ? (
            <div className="min-w-0">
              <SetupBlock ros2Package={first.ros2Package} caption={`Antes de la ${first.week}`} repoUrl={repoUrl} />
              {setupUrl && (
                <a
                  href={setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.12em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
                >
                  Guía de instalación del simulador
                  <ArrowUpRight size={13} aria-hidden="true" />
                  {NEW_TAB_HINT}
                </a>
              )}
            </div>
          ) : undefined
        }
      />
    </SectionLayout>
  );
}

/** La intro de la ruta. El texto de las guías del JAR se mantiene; una sola guía no tiene orden que explicar. */
function introOf(guides: AsyncWorkshop[], totalHours: string): string {
  if (guides.length === 1) return `Lleva ${totalHours}.`;
  const code = guides.every((g) => g.codeUrl) ? "Cada guía tiene su código en GitHub y deja" : "Cada guía deja";
  return `${code} andando algo que la siguiente da por hecho: hacelas en orden. En total, ${totalHours}.`;
}

/**
 * Comandos de terminal: clonar el repositorio del workshop dentro del workspace (solo antes de la primera guía, cuando se
 * pasa `repoUrl`) y compilar el paquete de la semana. Va en un bloque oscuro fijo (igual en claro y oscuro), con los
 * comentarios apagados y el comando en rosa.
 */
export function SetupBlock({
  ros2Package,
  caption,
  repoUrl,
  className = "",
}: {
  ros2Package: string;
  caption: string;
  repoUrl?: string;
  className?: string;
}) {
  const lines: { comment?: string; cmd?: string; args?: string }[] = [
    { comment: "# dentro de tu workspace de ROS 2" },
    ...(repoUrl
      ? [
          { cmd: "cd", args: "~/rosmaster_ws/src" },
          { cmd: "git", args: `clone ${repoUrl}.git` },
        ]
      : []),
    { cmd: "cd", args: "~/rosmaster_ws" },
    { cmd: "colcon", args: `build --packages-select ${ros2Package}` },
    { cmd: "source", args: "install/setup.bash" },
  ];

  return (
    <figure className={`min-w-0 self-start border border-[#f5e8ec]/15 bg-[#0e0407] text-[#f5e8ec] ${className}`}>
      <figcaption className="flex items-center justify-between border-b border-[#f5e8ec]/15 px-4 py-2.5 font-mono text-[.66rem] uppercase tracking-[.18em] text-[#f5e8ec]/60 sm:px-6">
        <span>{caption}</span>
        <span>bash</span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[.78rem] leading-[1.8] sm:px-6 sm:text-[.84rem]">
        <code>
          {lines.map((l, i) => (
            <span key={i} className="block whitespace-pre">
              {l.comment ? (
                <span className="text-[#f5e8ec]/45">{l.comment}</span>
              ) : (
                <>
                  <span className="text-[#f0357f]">{l.cmd}</span> {l.args}
                </>
              )}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
