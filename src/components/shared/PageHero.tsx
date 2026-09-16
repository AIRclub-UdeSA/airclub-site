import { ScrambleText } from "@/components/shared/ScrambleText";
import { SectionLabel } from "@/components/shared/SectionLabel";

export function PageHero({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <section className="page-hero">
      <SectionLabel>{label}</SectionLabel>
      <ScrambleText
        as="h1"
        text={title}
        className="mb-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-text"
      />
      <p className="max-w-[600px] text-[.95rem] leading-[1.75] text-text2">{description}</p>
    </section>
  );
}
