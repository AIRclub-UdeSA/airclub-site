import { ArrowUpRight } from "lucide-react";
import { JAR_SITE_URL, JAR_WORKSHOPS_REPO, type AsyncWorkshop, type WorkshopLevel } from "@/lib/workshops";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading } from "@/components/shared/CountHeading";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

const LEVEL_LABEL: Record<WorkshopLevel, string> = {
  inicial: "Inicial",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

/**
 * Nodo de la ruta: el relleno dice el nivel (vacío = inicial, medio = intermedio, macizo = avanzado), como el color dice
 * el estado en /talks. Cuadrado y con contorno de 1px, igual que los nodos del cronograma.
 */
function LevelNode({ level, className = "" }: { level: WorkshopLevel; className?: string }) {
  const fill =
    level === "avanzado"
      ? "bg-crimson border-crimson"
      : level === "intermedio"
        ? "border-crimson-text bg-[linear-gradient(to_top,var(--crimson)_50%,var(--bg)_50%)]"
        : "border-crimson-text bg-bg";
  return <span className={`block size-3.5 shrink-0 border ${fill} ${className}`} aria-hidden="true" />;
}

/**
 * Recorrido asincrónico del Challenge JAR: las guías en orden, sobre una ruta vertical con un nodo por semana. El orden es
 * el diseño: cada guía deja andando algo que la siguiente da por hecho, y "Requiere" enlaza a esas semanas. La 01 va en
 * carmesí macizo (es por donde se entra). La guía completa vive en el sitio del JAR y el código en jar_workshops.
 */
export function AsyncRoute({ workshops, totalHours }: { workshops: AsyncWorkshop[]; totalHours: string }) {
  const first = workshops[0];

  return (
    <section id="asincronicos" className="scroll-mt-24 bg-bg2 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          <CountHeading
            n={workshops.length}
            title="Talleres asincrónicos"
            aside={
              <p className="pb-1.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.18em] text-mauve lg:ml-auto">
                Challenge JAR 2026
              </p>
            }
          />

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-4">
            <div className="min-w-0 lg:col-span-5">
              <p className="max-w-[52ch] text-[1.02rem] leading-[1.7] text-text2">
                Guías paso a paso para hacer a tu ritmo contra el simulador, con el código de cada semana en GitHub. Cada
                una deja andando algo que la siguiente da por hecho: hacelas en orden. En total, {totalHours}.
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
            </div>

            {first && <SetupBlock firstPackage={first.ros2Package} className="lg:col-span-6 lg:col-start-7" />}
          </div>

          <ol className="relative mt-12 grid min-w-0 grid-cols-1 gap-3 md:mt-16">
            {/* La ruta: una línea de 1px que une los nodos de todas las semanas. */}
            <span className="absolute bottom-8 left-[6px] top-8 w-px bg-text/30" aria-hidden="true" />
            {workshops.map((w, i) => (
              <RouteStop key={w.slug} workshop={w} start={i === 0} />
            ))}
          </ol>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function RouteStop({ workshop: w, start }: { workshop: AsyncWorkshop; start: boolean }) {
  return (
    <li id={`semana-${w.week}`} className="relative grid scroll-mt-28 grid-cols-[14px_minmax(0,1fr)] items-start gap-4 sm:gap-6">
      <LevelNode level={w.level} className="relative mt-8 sm:mt-10" />

      <article
        className={`group grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 p-5 transition-colors sm:grid-cols-[auto_minmax(0,1fr)] sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)_17rem] ${
          start ? "bg-crimson text-white" : "border border-text bg-bg text-text hover:border-crimson-text"
        }`}
      >
        <span className="font-logo text-[clamp(3.2rem,6vw,5rem)] leading-[0.8]" aria-hidden="true">
          {w.week}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3
              className={`font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-bold leading-[1.1] tracking-tight transition-colors ${
                start ? "" : "group-hover:text-crimson-text"
              }`}
            >
              <span className="sr-only">Semana {w.week}: </span>
              {w.title}
            </h3>
            {start && (
              <span className="-rotate-3 border border-white px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
                Empezá acá
              </span>
            )}
          </div>

          <p className={`mt-2 max-w-[62ch] text-[.98rem] leading-[1.65] ${start ? "text-white/85" : "text-text2"}`}>
            {w.outcome}
          </p>
        </div>

        {/* Datos y enlaces: debajo del texto en celular y tablet, en su propia columna en escritorio. */}
        <div
          className={`flex min-w-0 flex-col gap-4 sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:border-l lg:pl-8 ${
            start ? "border-white/35" : "border-text/20"
          }`}
        >
          <p
            className={`flex flex-wrap gap-x-4 gap-y-1 font-mono text-[.72rem] uppercase tracking-[.14em] ${
              start ? "text-white/80" : "text-text3"
            }`}
          >
            <span>{w.durationLabel}</span>
            <span>{LEVEL_LABEL[w.level]}</span>
            <span className="normal-case tracking-normal [overflow-wrap:anywhere]">{w.ros2Package}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={w.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[.74rem] font-semibold uppercase tracking-[.14em] transition-colors ${
                start
                  ? "bg-white text-crimson hover:bg-[#f5e8ec]"
                  : "border border-text hover:border-crimson hover:bg-crimson hover:text-white"
              }`}
            >
              <span>Guía</span>
              <ArrowUpRight size={14} aria-hidden="true" />
              {NEW_TAB_HINT}
            </a>
            <a
              href={w.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[.74rem] uppercase tracking-[.12em] underline decoration-current/35 underline-offset-[6px] transition-colors hover:decoration-current"
            >
              Código
              {NEW_TAB_HINT}
            </a>
          </div>

          {w.requires.length > 0 && (
            <p className="font-mono text-[.72rem] uppercase tracking-[.14em] text-text3">
              Requiere{" "}
              {w.requires.map((week, i) => (
                <span key={week}>
                  {i > 0 && " · "}
                  <a
                    href={`#semana-${week}`}
                    className="text-text underline decoration-text/30 underline-offset-4 transition-colors hover:text-crimson-text"
                  >
                    {week}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </article>
    </li>
  );
}

/**
 * Lo que hay que correr una vez antes de la 01: clonar jar_workshops dentro del workspace y compilar el paquete de la
 * semana. Va en un bloque oscuro fijo (igual en claro y oscuro), con los comentarios apagados y el comando en rosa.
 */
function SetupBlock({ firstPackage, className = "" }: { firstPackage: string; className?: string }) {
  const lines: { comment?: string; cmd?: string; args?: string }[] = [
    { comment: "# dentro de tu workspace de ROS 2" },
    { cmd: "cd", args: "~/rosmaster_ws/src" },
    { cmd: "git", args: `clone ${JAR_WORKSHOPS_REPO}.git` },
    { cmd: "cd", args: "~/rosmaster_ws" },
    { cmd: "colcon", args: `build --packages-select ${firstPackage}` },
    { cmd: "source", args: "install/setup.bash" },
  ];

  return (
    <figure className={`min-w-0 self-start border border-[#f5e8ec]/15 bg-[#0e0407] text-[#f5e8ec] ${className}`}>
      <figcaption className="flex items-center justify-between border-b border-[#f5e8ec]/15 px-4 py-2.5 font-mono text-[.66rem] sm:px-6 uppercase tracking-[.18em] text-[#f5e8ec]/60">
        <span>Antes de la 01</span>
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
