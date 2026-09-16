"use client";

import { useEffect } from "react";
import { Button } from "@/components/shared/Button";
import { SectionLabel } from "@/components/shared/SectionLabel";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-15 py-24 text-center max-md:px-5.5">
      <SectionLabel>Error</SectionLabel>
      <h1 className="mb-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold tracking-tight text-text">
        Algo salió mal
      </h1>
      <p className="mb-8 max-w-[480px] text-[.95rem] leading-[1.75] text-text2">
        Tuvimos un problema mostrando esta página. Podés intentar de nuevo, o volver más tarde.
      </p>
      <Button onClick={reset} variant="primary">
        Intentar de nuevo
      </Button>
    </section>
  );
}
