export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 font-mono text-[.65rem] uppercase tracking-[.2em] text-mauve">
      {/* el "//" es texto de diseño visible (imita un comentario de código), no un comentario JSX */}
      {"// "}
      {children}
    </div>
  );
}
