/**
 * Cabecera de las pantallas del perfil (/perfil, /perfil/aprendizaje y /perfil/completar): el título va en Anton,
 * centrado y en carmesí, como el de las demás subpáginas (/talks, /equipo, /contacto, /privacidad), pero a un tamaño
 * de pantalla de formulario, no de afiche. El texto de ayuda va debajo, centrado y en una columna de lectura.
 */
export function PerfilHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col items-center text-center">
      <p className="font-mono text-xs uppercase tracking-[.14em] text-text3 [overflow-wrap:anywhere]">{eyebrow}</p>
      <h1 className="mt-5 text-balance font-logo text-[clamp(3rem,10vw,6rem)] uppercase leading-[0.92] tracking-tight text-crimson-text">
        {title}
      </h1>
      {children && <div className="mt-6 flex max-w-[52ch] flex-col gap-3">{children}</div>}
    </header>
  );
}
