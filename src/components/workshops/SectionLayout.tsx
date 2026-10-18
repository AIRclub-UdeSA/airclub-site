import { SECTION_TITLE } from "@/components/shared/CountHeading";

/**
 * La forma de cada sección de la página de un workshop: a la izquierda, fija mientras se scrollea la lista, el título, una
 * frase y lo que acompaña (progreso, leyenda); a la derecha, la lista. En celular, una columna. Igual para guías y
 * talleres presenciales: así cualquier workshop se lee igual.
 */
export function SectionLayout({
  title,
  intro,
  aside,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <h2 className={`${SECTION_TITLE} lg:text-[clamp(1.2rem,1.9vw,2rem)] [overflow-wrap:anywhere]`}>{title}</h2>
          <p className="mt-5 max-w-[34ch] text-[1.05rem] leading-[1.6] text-text2">{intro}</p>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  );
}
