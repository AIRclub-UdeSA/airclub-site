import Link from "next/link";
import Image from "next/image";
import type { RobotItem } from "@/lib/robots";
import { TiltCard } from "@/components/shared/TiltCard";

export function RobotCard({ robot }: { robot: RobotItem }) {
  return (
    <TiltCard className="h-full rounded-lg">
      <Link href={`/plataformas/${robot.slug}`} className="block h-full">
        <div className="group h-full overflow-hidden rounded-lg border-[1.5px] border-border bg-white transition-all duration-450 ease-club hover:border-crimson/30 hover:shadow-[0_20px_50px_rgba(164,12,76,0.1)] dark:bg-[#1a0810]">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image src={robot.imageUrl} alt={robot.imageAlt} fill className="object-cover" />
          </div>
          <div className="p-6.5">
            <span className="mb-3 inline-block rounded-full bg-[rgba(164,12,76,0.07)] px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em] text-crimson-text">
              {robot.status}
            </span>
            <h3 className="mb-1.5 font-display text-[1.15rem] font-bold text-text">{robot.name}</h3>
            <p className="mb-4 text-[.86rem] leading-[1.6] text-text2">{robot.description}</p>
            <div className="flex items-center gap-2 text-[.84rem] font-semibold text-crimson-text transition-[gap] duration-300 group-hover:gap-3.5">
              Ver detalle
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
