import { Button } from "@/components/shared/Button";

export function SponsorStrip() {
  return (
    <div className="relative z-[1] flex flex-wrap items-center justify-between gap-6 border-t border-border bg-bg2 px-15 py-8.5 max-md:px-5.5">
      <div>
        <h4 className="mb-1 font-display text-[1rem] font-bold text-text">¿Tu empresa quiere apoyar la robótica estudiantil?</h4>
        <p className="max-w-[520px] text-[.84rem] text-text2">
          Buscamos aliados para financiar hardware, competencias y divulgación. Escribinos y te contamos las
          modalidades de colaboración.
        </p>
      </div>
      <Button href="mailto:airclub@udesa.edu.ar?subject=Sponsorship AIR Club UdeSA" className="shrink-0">
        Contactar al club
      </Button>
    </div>
  );
}
