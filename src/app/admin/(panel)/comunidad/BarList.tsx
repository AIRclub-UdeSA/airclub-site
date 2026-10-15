import type { Bucket } from "@/lib/admin/community-stats";

/**
 * Barras horizontales con CSS: una sola magnitud (cantidad de personas), así que un solo tono
 * (carmesí) y la cifra escrita al lado, en tinta de texto. Todas las barras de un mismo gráfico
 * comparten escala (el máximo del grupo), no la de cada fila.
 */
export function BarList({ title, buckets, total }: { title: string; buckets: Bucket[]; total: number }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-xs uppercase tracking-[.12em] text-text3">{title}</figcaption>
      {buckets.length === 0 ? (
        <p className="text-sm text-text3">Sin datos.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {buckets.map((b) => (
            <li
              key={b.label}
              title={`${b.label}: ${b.count} de ${total} (${Math.round((b.count / Math.max(1, total)) * 100)}%)`}
              className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_2rem]"
            >
              <span className="break-words leading-tight text-text2">{b.label}</span>
              <span className="h-2.5 rounded-r-[4px] bg-crimson" style={{ width: `${(b.count / max) * 100}%`, minWidth: 4 }} aria-hidden="true" />
              <span className="text-right font-mono text-xs text-text">{b.count}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
