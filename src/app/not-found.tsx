import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { SectionLabel } from "@/components/shared/SectionLabel";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-15 py-24 text-center max-md:px-5.5">
      <SectionLabel>404</SectionLabel>
      <h1 className="mb-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold tracking-tight text-text">
        Esta página no existe
      </h1>
      <p className="mb-8 max-w-[480px] text-[.95rem] leading-[1.75] text-text2">
        Puede que el link esté roto o que la página se haya movido. Volvé al inicio o mirá los{" "}
        <Link href="/eventos" className="font-semibold text-crimson-text">
          eventos
        </Link>{" "}
        del club.
      </p>
      <Button href="/" variant="primary">
        Volver al inicio
      </Button>
    </section>
  );
}
