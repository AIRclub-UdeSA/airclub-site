export type SeedRobotSpec = { group: "HARDWARE" | "SOFTWARE"; label: string; value: string };
export type SeedRobotLink = { label: string; url: string };

export type SeedRobot = {
  slug: string;
  name: string;
  status: string;
  category?: string;
  tags: string[];
  description: string;
  imageUrl: string;
  imageAlt: string;
  specs: SeedRobotSpec[];
  links: SeedRobotLink[];
};

export const robots: SeedRobot[] = [
  {
    slug: "rosmaster-x3",
    name: "ROSMaster X3",
    status: "En desarrollo activo",
    category: "Robótica móvil",
    tags: ["JAR 2026"],
    description:
      "Nuestra plataforma de robótica móvil autónoma, basada en el Yahboom ROSMASTER X3. Es el robot protagonista del Challenge JAR 2026: sobre él corren las soluciones de navegación, mapeo y detección que desarrollan los equipos participantes.",
    imageUrl: "/rosmaster.jpg",
    imageAlt: "Robot ROSMaster X3 del AIR Club: chasis mecanum con LiDAR RPLIDAR y cámara RGB-D Orbbec",
    specs: [
      { group: "HARDWARE", label: "Tracción", value: "4 ruedas Mecanum, movimiento omnidireccional 360°" },
      { group: "HARDWARE", label: "Cómputo", value: "Raspberry Pi 5" },
      { group: "HARDWARE", label: "LiDAR", value: "LiDAR 2D (mapeo y evasión de obstáculos)" },
      { group: "HARDWARE", label: "Cámara", value: "RGB-D, percepción 3D y detección de objetos" },
      { group: "HARDWARE", label: "Motores", value: "Motores 520 con encoders · control PID · IMU 9 ejes" },
      { group: "SOFTWARE", label: "OS", value: "Ubuntu 22.04 LTS" },
      { group: "SOFTWARE", label: "Middleware", value: "ROS 2 Humble" },
      { group: "SOFTWARE", label: "Runtime", value: "Docker (ros-humble)" },
      { group: "SOFTWARE", label: "Comando", value: "/cmd_vel, teleoperación y navegación" },
      {
        group: "SOFTWARE",
        label: "Nota",
        value:
          "El gemelo digital del robot (simulador en Gazebo) es público: es el entorno donde los equipos de la JAR desarrollan y prueban su código.",
      },
    ],
    links: [
      { label: "Simulador (gemelo digital)", url: "https://github.com/AIRclub-UdeSA/yahboom_rosmaster" },
      { label: "Ver Challenge JAR 2026", url: "https://airclub-udesa.github.io/jar_site/" },
    ],
  },
];
