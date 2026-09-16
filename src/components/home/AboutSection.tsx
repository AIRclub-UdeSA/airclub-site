import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

const CARDS = [
  {
    icon: (
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    ),
    title: "Comunidad primero",
    desc: "El club es un espacio de colaboración entre estudiantes: charlas, cursos, proyectos y competencias donde cada uno aporta lo suyo y todos crecemos juntos.",
  },
  {
    icon: <path d="M21 12a9 9 0 11-6.2-8.6M21 3v6h-6" />,
    title: "IA + Robótica",
    desc: "No es solo robótica: trabajamos en toda la intersección, percepción, navegación autónoma, aprendizaje automático y modelos de IA aplicados a problemas reales.",
  },
  {
    icon: <path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5" />,
    title: "Acompañamiento académico",
    desc: "Contamos con el acompañamiento de docentes del Departamento de Ingeniería de UdeSA, que brindan orientación académica y apoyo institucional a nuestros proyectos.",
  },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
      <RevealOnScroll>
        <h2 className="mb-4 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.05] tracking-tight text-text">
          El Club
        </h2>
        <p className="mb-11 max-w-[600px] text-[.95rem] leading-[1.75] text-text2">
          Somos estudiantes de la Universidad de San Andrés que nos juntamos a construir cosas con inteligencia
          artificial y robótica. Creemos que se aprende mejor entre pares: compartimos lo que sabemos, nos
          potenciamos entre nosotros y encaramos proyectos que ninguno podría hacer solo, desde robots autónomos
          hasta IA aplicada.
        </p>
      </RevealOnScroll>
      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
        {CARDS.map((card, i) => (
          <RevealOnScroll key={card.title} delay={(i + 1) as 1 | 2 | 3}>
            <div className="group relative h-full overflow-hidden rounded-lg border-[1.5px] border-border bg-white p-8 transition-all duration-400 ease-club hover:-translate-y-1 hover:border-crimson/25 hover:shadow-[0_16px_40px_rgba(164,12,76,0.08)] dark:bg-[#1a0810]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[rgba(164,12,76,0.08)] text-crimson-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
                  {card.icon}
                </svg>
              </div>
              <h3 className="mb-2.5 font-display text-[1.05rem] font-bold text-text">{card.title}</h3>
              <p className="text-[.87rem] leading-[1.65] text-text2">{card.desc}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
