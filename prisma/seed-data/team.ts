export type SeedTeamMember = {
  name: string;
  role?: string;
  photoUrl?: string;
  /**
   * Recorte con la silueta de la persona en la foto grupal (/equipo.jpg, 960x1280). Al pasar el mouse por
   * el nombre se enciende esa silueta y se oscurece el resto. `box` está en píxeles de la foto original.
   * Nota: cuando el equipo pase a Postgres, este campo necesita su columna en TeamMember.
   */
  silhouette?: {
    src: string;
    box: { x: number; y: number; w: number; h: number };
    /** Fracción inferior del recorte (0 a 1) que se desvanece; sirve cuando otra persona la tapa por abajo. */
    fadeBottom?: number;
  };
};

export const team: SeedTeamMember[] = [
  { name: "Juan Kaplan" },
  { name: "Lucio Luque Materazzi" },
  { name: "Camila Guerrero" },
  { name: "Zoe Velazquez" },
  {
    name: "Francesca Ragonesi",
    silhouette: {
      src: "/equipo/silueta-francesca-ragonesi.webp",
      box: { x: 94, y: 305, w: 231, h: 449 },
      fadeBottom: 0.22,
    },
  },
  { name: "Teo Kaucher" },
  { name: "Tomas Diaz" },
];
