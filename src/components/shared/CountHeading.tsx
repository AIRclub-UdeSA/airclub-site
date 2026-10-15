/** Anton monumental con la cantidad real de la lista: el dato es el ancla visual (como la fecha en /talks). */
export function Count({ n }: { n: number }) {
  return (
    <span
      className="font-logo text-[clamp(5.5rem,13vw,11rem)] leading-[0.8] text-crimson-text"
      aria-hidden="true"
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

// Syne extra-bold en mayúsculas es muy ancha (~1.2em por letra): el mínimo del clamp tiene que ser chico o "COLABORADORES"
// ensancha todo el viewport a 320px.
const TITLE =
  "font-display text-[clamp(1.05rem,5.4vw,3rem)] font-black uppercase leading-[0.98] tracking-tight text-text";

/** Cabecera de banda: el conteo en Anton junto al título de la sección (y, opcional, una nota a la derecha). */
export function CountHeading({ n, title, aside }: { n: number; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <Count n={n} />
      <h2 className={`${TITLE} pb-1`}>{title}</h2>
      {aside}
    </div>
  );
}
