export type SeedTeamMember = {
  /** Identificador estable de la persona (no cambiarlo aunque cambie el nombre): el seed actualiza por slug. */
  slug: string;
  name: string;
  /** Cargo de la persona (ej. "Presidente"). No define en qué lista aparece: eso lo da el array (founders/collaborators). */
  role?: string;
  photoUrl?: string;
  /** Perfiles públicos. Cada uno es opcional; se aceptan links con o sin "https://". */
  links?: {
    linkedin?: string;
    /** Foto de LinkedIn: no se puede traer automáticamente, hay que subirla (URL o ruta). */
    linkedinPhoto?: string;
    github?: string;
  };
};

export const founders: SeedTeamMember[] = [
  {
    slug: "juan-kaplan",
    name: "Juan Kaplan",
    links: {
      linkedin: "https://www.linkedin.com/in/juan-kaplan/",
      linkedinPhoto: "/equipo/linkedin/juan.jpeg",
      github: "https://github.com/juan-kaplan",
    },
  },
  {
    slug: "lucio-luque-materazzi",
    name: "Lucio Luque Materazzi",
    links: {
      linkedin: "https://www.linkedin.com/in/lucio-luque-materazzi",
      linkedinPhoto: "/equipo/linkedin/lucio.jpeg",
      github: "https://github.com/LucioLuque",
    },
  },
  {
    slug: "camila-guerrero",
    name: "Camila Guerrero",
    links: {
      linkedin: "https://www.linkedin.com/in/camila-guerrero-ia/",
      linkedinPhoto: "/equipo/linkedin/camila.jpeg",
      github: "https://github.com/cguerreroudesa",
    },
  },
  {
    slug: "zoe-velazquez",
    name: "Zoe Velazquez",
    links: {
      linkedin: "https://www.linkedin.com/in/zoe-velazquez-zorzi/",
      linkedinPhoto: "/equipo/linkedin/zoe.jpeg",
      github: "https://github.com/Zoevelazquez0430",
    },
  },
  {
    slug: "francesca-ragonesi",
    name: "Francesca Ragonesi",
    links: {
      linkedin: "https://www.linkedin.com/in/francesca-ragonesi-14a961290/",
      linkedinPhoto: "/equipo/linkedin/francesca.jpeg",
      github: "https://github.com/fragonesi",
    },
  },
  {
    slug: "teo-kaucher",
    name: "Teo Kaucher",
    links: {
      linkedin: "https://www.linkedin.com/in/teo-manuel-kaucher/",
      linkedinPhoto: "/equipo/linkedin/teo.jpeg",
      github: "https://github.com/teomk",
    },
  },
  {
    slug: "tomas-diaz",
    name: "Tomas Diaz",
    links: {
      linkedin: "https://www.linkedin.com/in/tomas-diaz-b369a2270/",
      github: "https://github.com/TomasD1az",
    },
  },
];

export const collaborators: SeedTeamMember[] = [
  {
    slug: "ciro-russi",
    name: "Ciro Russi",
    links: {
      linkedin: "https://www.linkedin.com/in/ciro-russi-718533349/",
      linkedinPhoto: "/equipo/linkedin/ciro.jpg",
      github: "https://github.com/Ciror3",
    },
  },
  {
    slug: "martina-grunewald",
    name: "Martina Grunewald",
    links: {
      linkedin: "https://www.linkedin.com/in/martina-grunewald/",
      linkedinPhoto: "/equipo/linkedin/martina.jpeg",
      github: "https://github.com/mgrunewald",
    },
  },
  {
    slug: "lisandro-morales-arce",
    name: "Lisandro Morales Arce",
    links: {
      linkedin: "https://www.linkedin.com/in/lisandro-morales-arce/",
      linkedinPhoto: "/equipo/linkedin/lisandro.jpeg",
      github: "https://github.com/TatoMorales",
    },
  },
  {
    slug: "manuela-gomez-pazos",
    name: "Manuela Gomez Pazos",
    links: {
      linkedin: "https://www.linkedin.com/in/manuelagomezpazos/",
      linkedinPhoto: "/equipo/linkedin/manuela.jpeg",
      github: "https://github.com/mgomezpazos",
    },
  },
];
