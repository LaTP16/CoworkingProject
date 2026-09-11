import { User, Lock, Users, Presentation, Coffee, Briefcase } from "lucide-react";

export interface SpaceReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface SpaceSubOption {
  id: string;
  name: string;
  count: number;
  capacityLabel: string;
  description: string;
  pricePerHour?: number;
}

export interface SpaceCategory {
  id: string;
  name: string;
  count: number;
  iconName: "user" | "lock" | "users" | "presentation" | "coffee" | "briefcase";
  description: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  reviews: SpaceReview[];
  subOptions?: SpaceSubOption[];
  pricePerHour?: number;
}

export interface SedeInfo {
  id: string;
  name: string;
  description: string;
  tag: string;
  image: string;
  spaces: SpaceCategory[];
}

// Base de datos exacta local de las sedes con reseñas e imágenes reales
export const SEDES_DATABASE: Record<string, SedeInfo> = {
  "parque-amistad": {
    id: "parque-amistad",
    name: "Parque de la Amistad",
    description:
      "Un ambiente tranquilo rodeado de áreas verdes, ideal para la concentración profunda.",
    tag: "Zona Verde",
    image: "/images/sedes/parque-amistad.jpg",
    spaces: [
      {
        id: "individuales",
        name: "Espacios individuales",
        count: 54,
        pricePerHour: 8,
        iconName: "user",
        description: "Escritorios flex y hot desking con iluminación ergonómica",
        rating: 4.9,
        reviewsCount: 48,
        images: [
          "/images/spaces/individuales.jpg",
          "/images/sedes/parque-amistad.jpg",
        ],
        reviews: [
          {
            id: "rev-1",
            author: "Carlos Mendoza",
            avatar: "CM",
            rating: 5,
            date: "Hace 2 días",
            comment:
              "Excelente ambiente para trabajar totalmente concentrado. La luz natural y el Wi-Fi de alta velocidad son de 10.",
          },
          {
            id: "rev-2",
            author: "Mariana Silva",
            avatar: "MS",
            rating: 5,
            date: "Hace 5 días",
            comment:
              "Muy tranquilo y rodeado de áreas verdes. Perfecto si buscas cero distracciones durante tu jornada.",
          },
          {
            id: "rev-3",
            author: "Diego Ramos",
            avatar: "DR",
            rating: 4.8,
            date: "Hace 1 semana",
            comment:
              "Las sillas ergonómicas valen totalmente la pena. La estación de café ilimitado es un gran plus.",
          },
        ],
      },
      {
        id: "privados",
        name: "Espacios privados",
        count: 6,
        pricePerHour: 20,
        iconName: "lock",
        description: "Oficinas privadas e insonorizadas para máximo enfoque",
        rating: 4.95,
        reviewsCount: 24,
        images: [
          "/images/spaces/privados.jpg",
          "/images/sedes/parque-amistad.jpg",
        ],
        subOptions: [
          {
            id: "privados-1-2",
            name: "Espacio privado (Aforo 1 a 2 p.)",
            count: 3,
            pricePerHour: 20,
            capacityLabel: "Aforo: 1 a 2 personas",
            description: "Oficina privada e insonorizada ideal para 1 a 2 personas (3 espacios disponibles)",
          },
          {
            id: "privados-3",
            name: "Espacio privado (Aforo 3 p.)",
            count: 3,
            pricePerHour: 30,
            capacityLabel: "Aforo: 3 personas",
            description: "Oficina ejecutiva privada e insonorizada para 3 personas (3 espacios disponibles)",
          },
        ],
        reviews: [
          {
            id: "rev-4",
            author: "InkaTech Solutions",
            avatar: "IT",
            rating: 5,
            date: "Hace 3 días",
            comment:
              "Súper insonorizado. Pudimos hacer llamadas confidenciales y reuniones ejecutivas sin interrupción.",
          },
          {
            id: "rev-5",
            author: "Lucía Fernández",
            avatar: "LF",
            rating: 4.9,
            date: "Hace 1 semana",
            comment:
              "Oficina ejecutiva muy cómoda con aire acondicionado independiente y conexiones rápidas.",
          },
        ],
      },
      {
        id: "trabajo",
        name: "Salas de trabajo",
        count: 4,
        pricePerHour: 60,
        iconName: "users",
        description: "Salas ideales para trabajo de equipo y talleres",
        rating: 4.85,
        reviewsCount: 32,
        images: [
          "/images/spaces/trabajo.jpg",
          "/images/sedes/parque-amistad.jpg",
        ],
        subOptions: [
          {
            id: "trabajo-6",
            name: "Sala de trabajo (Aforo 6 personas)",
            count: 1,
            pricePerHour: 60,
            capacityLabel: "Aforo: 6 personas",
            description: "Sala de trabajo colaborativo insonorizada para 6 personas (1 espacio disponible)",
          },
          {
            id: "trabajo-8",
            name: "Sala de trabajo (Aforo 8 personas)",
            count: 1,
            pricePerHour: 80,
            capacityLabel: "Aforo: 8 personas",
            description: "Sala amplia para equipos con pantalla interactiva para 8 personas (1 espacio disponible)",
          },
          {
            id: "trabajo-15",
            name: "Sala de trabajo (Aforo 15 personas)",
            count: 2,
            pricePerHour: 160,
            capacityLabel: "Aforo: 15 personas",
            description: "Sala ejecutiva para talleres y reuniones de equipos grandes de 15 personas (2 espacios disponibles)",
          },
        ],
        reviews: [
          {
            id: "rev-6",
            author: "Equipo Marketing RYA",
            avatar: "EM",
            rating: 5,
            date: "Hace 1 día",
            comment:
              "La pantalla interactiva y la pizarra de vidrio nos sirvieron muchísimo para nuestra sesión de ideación.",
          },
          {
            id: "rev-7",
            author: "Gabriel Torres",
            avatar: "GT",
            rating: 4.7,
            date: "Hace 4 días",
            comment:
              "Súper amplia para nuestro equipo de 6 personas. Espacio limpio y moderno.",
          },
        ],
      },
      {
        id: "conferencias",
        name: "Sala de conferencias",
        count: 1,
        pricePerHour: 360,
        iconName: "presentation",
        description: "Gran espacio equipado con podio y proyector para 40 personas",
        rating: 5.0,
        reviewsCount: 15,
        images: [
          "/images/spaces/conferencias.jpg",
          "/images/sedes/parque-amistad.jpg",
        ],
        reviews: [
          {
            id: "rev-8",
            author: "Foro Innovación Surco",
            avatar: "FI",
            rating: 5,
            date: "Hace 1 semana",
            comment:
              "Impresionante acústica y calidad de sonido. Todos los asistentes quedaron muy satisfechos.",
          },
        ],
      },
    ],
  },
  "surco-pueblo": {
    id: "surco-pueblo",
    name: "Surco Pueblo",
    description:
      "Céntrico y tradicional, perfecto para reuniones dinámicas y networking.",
    tag: "Céntrico",
    image: "/images/sedes/surco-pueblo.jpg",
    spaces: [
      {
        id: "individuales",
        name: "Espacios individuales",
        count: 34,
        pricePerHour: 4,
        iconName: "user",
        description: "Estaciones con conexión de alta velocidad y café ilimitado",
        rating: 4.88,
        reviewsCount: 41,
        images: [
          "/images/sedes/surco-pueblo.jpg",
          "/images/spaces/individuales.jpg",
        ],
        reviews: [
          {
            id: "rev-9",
            author: "Renzo Castillo",
            avatar: "RC",
            rating: 5,
            date: "Hace 3 días",
            comment:
              "Ubicación súper céntrica en Surco Pueblo. El ambiente amarillo le da una vibra súper enérgica.",
          },
          {
            id: "rev-10",
            author: "Vanessa Ortiz",
            avatar: "VO",
            rating: 4.8,
            date: "Hace 6 días",
            comment:
              "Estaciones de trabajo muy bien equipadas y café caliente siempre listo.",
          },
        ],
      },
      {
        id: "privados",
        name: "Espacios privados",
        count: 5,
        pricePerHour: 20,
        iconName: "lock",
        description: "Oficinas cerradas e insonorizadas (Aforo: 3 personas)",
        rating: 4.92,
        reviewsCount: 19,
        images: [
          "/images/spaces/privados.jpg",
          "/images/sedes/surco-pueblo.jpg",
        ],
        reviews: [
          {
            id: "rev-11",
            author: "Estudio Contable Medina",
            avatar: "EM",
            rating: 5,
            date: "Hace 4 días",
            comment:
              "Excelente espacio cerrado. Muy profesional para recibir clientes de la zona.",
          },
        ],
      },
      {
        id: "trabajo",
        name: "Salas de trabajo",
        count: 2,
        pricePerHour: 30,
        iconName: "users",
        description: "Espacios colaborativos dinámicos (Aforo: 4 personas)",
        rating: 4.85,
        reviewsCount: 22,
        images: [
          "/images/spaces/trabajo.jpg",
          "/images/sedes/surco-pueblo.jpg",
        ],
        reviews: [
          {
            id: "rev-12",
            author: "Patricia Benavides",
            avatar: "PB",
            rating: 4.9,
            date: "Hace 2 semanas",
            comment: "Salas ideales para sprints de trabajo en grupo.",
          },
        ],
      },
      {
        id: "reuniones",
        name: "Salas de reuniones",
        count: 2,
        pricePerHour: 50,
        iconName: "briefcase",
        description: "Equipadas con pantallas interactivas y videoconferencia (Aforo: 8 personas)",
        rating: 4.9,
        reviewsCount: 16,
        images: [
          "/images/spaces/trabajo.jpg",
          "/images/sedes/surco-pueblo.jpg",
        ],
        reviews: [
          {
            id: "rev-13",
            author: "Andrés Alva",
            avatar: "AA",
            rating: 5,
            date: "Hace 5 días",
            comment: "Buena conexión HDMI y TV gigante para exponer demos.",
          },
        ],
      },
    ],
  },
  castilla: {
    id: "castilla",
    name: "Castilla",
    description:
      "Espacio moderno y tecnológico, diseñado para equipos de alto rendimiento.",
    tag: "Tecnológico",
    image: "/images/sedes/castilla.jpg",
    spaces: [
      {
        id: "individuales",
        name: "Espacios individuales",
        count: 16,
        pricePerHour: 4,
        iconName: "user",
        description: "Ergonomía premium y luz natural de piso a techo",
        rating: 4.95,
        reviewsCount: 29,
        images: [
          "/images/sedes/castilla.jpg",
          "/images/spaces/individuales.jpg",
        ],
        reviews: [
          {
            id: "rev-14",
            author: "Sofía Gutiérrez",
            avatar: "SG",
            rating: 5,
            date: "Hace 1 día",
            comment:
              "La sede más moderna con vista panorámica increible. Las estaciones son de primer nivel.",
          },
        ],
      },
      {
        id: "privados",
        name: "Espacios privados",
        count: 2,
        pricePerHour: 20,
        iconName: "lock",
        description: "Oficinas ejecutivas de alta gama (Aforo: 3 personas)",
        rating: 5.0,
        reviewsCount: 12,
        images: [
          "/images/spaces/privados.jpg",
          "/images/sedes/castilla.jpg",
        ],
        reviews: [
          {
            id: "rev-15",
            author: "Startup FinTech Peru",
            avatar: "SF",
            rating: 5,
            date: "Hace 3 días",
            comment:
              "Oficina ejecutiva privada perfecta para nuestro equipo directivo. Acabados A1.",
          },
        ],
      },
      {
        id: "reuniones",
        name: "Salas de reuniones",
        count: 1,
        pricePerHour: 50,
        iconName: "briefcase",
        description: "Videoconferencia 4K ready (Aforo: 8 personas)",
        rating: 4.9,
        reviewsCount: 18,
        images: [
          "/images/spaces/trabajo.jpg",
          "/images/sedes/castilla.jpg",
        ],
        reviews: [
          {
            id: "rev-16",
            author: "Consultora Nova",
            avatar: "CN",
            rating: 5,
            date: "Hace 1 semana",
            comment:
              "La cámara y micrófonos integrados para Zoom funcionaron perfecto.",
          },
        ],
      },
      {
        id: "social",
        name: "Zona social",
        count: 1,
        pricePerHour: 40,
        iconName: "coffee",
        description: "Lounge de descanso, barra de café gourmet y networking (Aforo: 7 personas)",
        rating: 4.98,
        reviewsCount: 35,
        images: [
          "/images/sedes/castilla.jpg",
          "/images/spaces/individuales.jpg",
        ],
        reviews: [
          {
            id: "rev-17",
            author: "Mateo Herrera",
            avatar: "MH",
            rating: 5,
            date: "Hace 2 días",
            comment:
              "La mejor zona para relajarse y tomar un café entre bloques de trabajo.",
          },
        ],
      },
    ],
  },
};

export function findSpaceById(
  sede: SedeInfo,
  spaceId: string | null
): { name: string; count: number; description?: string; pricePerHour: number } | null {
  if (!spaceId) return null;
  for (const space of sede.spaces) {
    if (space.id === spaceId) {
      return {
        name: space.name,
        count: space.count,
        description: space.description,
        pricePerHour: space.pricePerHour ?? 15,
      };
    }
    if (space.subOptions) {
      const sub = space.subOptions.find((s) => s.id === spaceId);
      if (sub) {
        return {
          name: sub.name,
          count: sub.count,
          description: sub.description,
          pricePerHour: sub.pricePerHour ?? space.pricePerHour ?? 15,
        };
      }
    }
  }
  return null;
}
