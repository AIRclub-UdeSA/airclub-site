import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg2 px-15 py-8 max-md:px-5.5 max-md:py-7">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="AIR Club UdeSA" width={34} height={34} className="h-[34px] w-auto opacity-90" />
          <div>
            <h3 className="font-display text-[.95rem] font-bold text-text">AIR Club UdeSA</h3>
            <p className="text-[.75rem] text-text3">
              Artificial Intelligence &amp; Robotics Club
              <br />
              Universidad de San Andrés
            </p>
          </div>
        </div>
        <div className="text-right max-md:text-left">
          <p className="mb-1 text-[.75rem] text-text3">Contacto</p>
          <a href="mailto:airclub@udesa.edu.ar" className="block font-mono text-[.78rem] text-crimson-text transition-opacity hover:opacity-75">
            airclub@udesa.edu.ar
          </a>
          <a
            href="https://www.instagram.com/AIRClub_UdeSA"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[.78rem] text-crimson-text transition-opacity hover:opacity-75"
          >
            @AIRClub_UdeSA
          </a>
          <a
            href="https://chat.whatsapp.com/Dz7CNt3Zdt25u4hqPd2fLK?s=cl&p=i&mlu=4"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[.78rem] text-crimson-text transition-opacity hover:opacity-75"
          >
            Comunidad WhatsApp
          </a>
        </div>
      </div>
      <div className="mt-5 flex justify-between border-t border-border pt-4 text-[.7rem] text-text3 max-md:flex-col max-md:gap-1.5">
        <span>© {new Date().getFullYear()} AIR Club UdeSA</span>
        <span>Think. Build. Compete.</span>
      </div>
    </footer>
  );
}
