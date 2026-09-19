export type SeedTeamMember = {
  name: string;
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
    name: "Juan Kaplan",
    links: {
      linkedin: "https://www.linkedin.com/in/juan-kaplan/",
      linkedinPhoto: "/equipo/linkedin/juan.jpg",
      github: "https://github.com/juan-kaplan",
    },
  },
  {
    name: "Lucio Luque Materazzi",
    links: {
      linkedin: "https://www.linkedin.com/in/lucio-luque-materazzi",
      linkedinPhoto: "/equipo/linkedin/lucio.jpg",
      github: "https://github.com/LucioLuque",
    },
  },
  {
    name: "Camila Guerrero",
    links: {
      linkedin: "https://www.linkedin.com/in/camila-guerrero-ia/",
      linkedinPhoto: "/equipo/linkedin/camila.jpg",
      github: "https://github.com/cguerreroudesa",
    },
  },
  {
    name: "Zoe Velazquez",
    links: {
      linkedin: "https://www.linkedin.com/in/zoe-velazquez-zorzi/",
      linkedinPhoto: "/equipo/linkedin/zoe.jpg",
      github: "https://github.com/Zoevelazquez0430",
    },
  },
  {
    name: "Francesca Ragonesi",
    links: {
      linkedin: "https://www.linkedin.com/in/francesca-ragonesi-14a961290/",
      linkedinPhoto: "/equipo/linkedin/francesca.jpg",
      github: "https://github.com/fragonesi",
    },
  },
  {
    name: "Teo Kaucher",
    links: {
      linkedin: "https://www.linkedin.com/in/teo-manuel-kaucher/",
      linkedinPhoto: "/equipo/linkedin/teo.jpg",
      github: "https://github.com/teomk",
    },
  },
  {
    name: "Tomas Diaz",
    links: {
      linkedin: "https://www.linkedin.com/in/tomas-diaz-b369a2270/",
      github: "https://github.com/TomasD1az",
    },
  },
];

export const collaborators: SeedTeamMember[] = [
  {
    name: "Ciro Russi",
    links: {
      linkedin: "https://www.linkedin.com/in/ciro-russi-718533349/",
      linkedinPhoto: "/equipo/linkedin/ciro.jpg",
      github: "https://github.com/Ciror3",
    },
  },
  {
    name: "Martina Grunewald",
    links: {
      linkedin: "https://www.linkedin.com/in/martina-grunewald/",
      linkedinPhoto: "/equipo/linkedin/martina.jpg",
      github: "https://github.com/mgrunewald",
    },
  },
  {
    name: "Lisandro Morales Arce",
    links: {
      linkedin: "https://www.linkedin.com/in/lisandro-morales-arce/",
      linkedinPhoto: "/equipo/linkedin/lisandro.jpg",
      github: "https://github.com/TatoMorales",
    },
  },
  {
    name: "Manuela Gomez Pazos",
    links: {
      linkedin: "https://www.linkedin.com/in/manuelagomezpazos/",
      linkedinPhoto: "/equipo/linkedin/manuela.jpg",
      github: "https://github.com/mgomezpazos",
    },
  },
];
