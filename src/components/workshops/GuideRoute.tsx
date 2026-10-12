import { ArrowUpRight } from "lucide-react";
import { JAR_SITE_URL, JAR_WORKSHOPS_REPO, type AsyncWorkshop, type WorkshopLevel } from "@/lib/workshops";
import { LEVEL_LABEL, LevelNode } from "./level";
import { RouteProgress } from "./RouteProgress";
import { RouteSteps } from "./RouteSteps";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Recorrido asincrónico de una línea (hoy, el del Challenge JAR): las guías en orden, sobre una ruta vertical con un nodo
 * por semana. El orden es el diseño: cada guía deja andando algo que la siguiente da por hecho, y "Requiere" enlaza a esas
 * semanas. Cada tarjeta lleva a la página del workshop; el color sigue el progreso de la persona (ver RouteSteps).
 */
export function GuideRoute({ guides, totalHours, back }: { guides: AsyncWorkshop[]; totalHours: string; back: string }) {
  const first = guides[0];

  return (
    <div id="asincronicos" className="scroll-mt-24">
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-4">
        <div className="min-w-0 lg:col-span-5">
          <p className="max-w-[52ch] text-[1.02rem] leading-[1.7] text-text2">
            Guías asincrónicas paso a paso para hacer a tu ritmo contra el simulador, con el código de cada semana en
            GitHub. Cada una deja andando algo que la siguiente da por hecho: hacelas en orden. En total, {totalHours}.
          </p>

          <a
            href={`${JAR_SITE_URL}/setup/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.12em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
          >
            Guía de instalación del simulador
            <ArrowUpRight size={13} aria-hidden="true" />
            {NEW_TAB_HINT}
          </a>

          <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[.7rem] uppercase tracking-[.16em] text-text3">
            {(Object.keys(LEVEL_LABEL) as WorkshopLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <dt>
                  <LevelNode level={level} />
                </dt>
                <dd>{LEVEL_LABEL[level]}</dd>
              </div>
            ))}
          </dl>

          <RouteProgress guides={guides} back={back} />
        </div>

        {first && (
          <SetupBlock ros2Package={first.ros2Package} caption="Antes de la 01" clone className="lg:col-span-6 lg:col-start-7" />
        )}
      </div>

      <RouteSteps guides={guides} />
    </div>
  );
}

/**
 * Comandos de terminal: clonar jar_workshops dentro del workspace (solo antes de la 01) y compilar el paquete de la
 * semana. Va en un bloque oscuro fijo (igual en claro y oscuro), con los comentarios apagados y el comando en rosa.
 */
export function SetupBlock({
  ros2Package,
  caption,
  clone = false,
  className = "",
}: {
  ros2Package: string;
  caption: string;
  clone?: boolean;
  className?: string;
}) {
  const lines: { comment?: string; cmd?: string; args?: string }[] = [
    { comment: "# dentro de tu workspace de ROS 2" },
    ...(clone
      ? [
          { cmd: "cd", args: "~/rosmaster_ws/src" },
          { cmd: "git", args: `clone ${JAR_WORKSHOPS_REPO}.git` },
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
