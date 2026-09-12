import { SEDES_DATABASE, SedeInfo, SpaceCategory } from "@/data/sedesData";

export type SpaceTypeId = "individuales" | "privados" | "trabajo" | "conferencias" | "social";

export interface SpaceTypeMatch {
  typeId: SpaceTypeId;
  title: string;
  badge: string;
  shortDescription: string;
  detailedReason: string;
  highlightedFeatures: string[];
  recommendedCapacity: string;
  matchedKeywords: string[];
  confidence: number; // 0 to 100
  matchingSpaces: Array<{
    sede: SedeInfo;
    space: SpaceCategory;
  }>;
}

// Normalización de texto (minúsculas, sin tildes, sin caracteres especiales)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Clasifica el prompt del usuario y determina qué tipo de espacio es el más adecuado,
 * explicando el razonamiento y seleccionando los espacios correspondientes en las sedes.
 */
export function classifyPromptIntent(prompt: string): SpaceTypeMatch {
  const norm = normalizeText(prompt);

  // Diccionario de puntuaciones por tipo
  let scores: Record<SpaceTypeId, number> = {
    individuales: 0,
    privados: 0,
    trabajo: 0,
    conferencias: 0,
    social: 0,
  };

  const matchedKeywords: Record<SpaceTypeId, string[]> = {
    individuales: [],
    privados: [],
    trabajo: [],
    conferencias: [],
    social: [],
  };

  // 1. Detección de números de personas en el texto (ej: "somos 8", "para 6 personas", "10 personas", etc.)
  const personMatch = norm.match(/(\d+)\s*(personas?|integrantes|miembros|socios|colegas|asistentes|invitados)?/);
  if (personMatch) {
    const count = parseInt(personMatch[1], 10);
    if (count >= 20) {
      scores.conferencias += 60;
      matchedKeywords.conferencias.push(`${count} personas (gran aforo)`);
    } else if (count >= 4) {
      scores.trabajo += 50;
      matchedKeywords.trabajo.push(`${count} personas (aforo de equipo)`);
    } else if (count >= 2 && count <= 3) {
      scores.privados += 35;
      scores.trabajo += 20;
      matchedKeywords.privados.push(`${count} personas (grupo reducido/privado)`);
    } else if (count === 1) {
      scores.individuales += 40;
      matchedKeywords.individuales.push("1 persona");
    }
  }

  // 2. Reglas y palabras clave para: SALA DE CONFERENCIAS (conferencias)
  const confKeywords = [
    { word: "conferencia", weight: 40 },
    { word: "conferencias", weight: 40 },
    { word: "evento", weight: 30 },
    { word: "eventos", weight: 30 },
    { word: "auditorio", weight: 40 },
    { word: "seminario", weight: 35 },
    { word: "seminarios", weight: 35 },
    { word: "congreso", weight: 40 },
    { word: "podio", weight: 30 },
    { word: "proyector", weight: 20 },
    { word: "audiencia", weight: 30 },
    { word: "lanzamiento", weight: 25 },
    { word: "charla magistral", weight: 40 },
    { word: "masivo", weight: 25 },
  ];
  for (const item of confKeywords) {
    if (norm.includes(item.word)) {
      scores.conferencias += item.weight;
      matchedKeywords.conferencias.push(item.word);
    }
  }

  // 3. Reglas y palabras clave para: SALAS DE TRABAJO / REUNIONES (trabajo)
  const teamKeywords = [
    { word: "equipo", weight: 35 },
    { word: "reunir", weight: 35 },
    { word: "reunirme", weight: 40 },
    { word: "reunirnos", weight: 40 },
    { word: "reunion", weight: 35 },
    { word: "reuniones", weight: 35 },
    { word: "junta", weight: 30 },
    { word: "juntas", weight: 30 },
    { word: "brainstorming", weight: 35 },
    { word: "lluvia de ideas", weight: 35 },
    { word: "taller", weight: 30 },
    { word: "talleres", weight: 30 },
    { word: "workshop", weight: 35 },
    { word: "colaborar", weight: 30 },
    { word: "colaborativo", weight: 30 },
    { word: "clientes", weight: 20 },
    { word: "presentar", weight: 25 },
    { word: "presentacion", weight: 25 },
    { word: "pizarra", weight: 25 },
    { word: "pantalla interactiva", weight: 30 },
    { word: "sprint", weight: 30 },
    { word: "grupo", weight: 25 },
    { word: "dinamica", weight: 25 },
  ];
  for (const item of teamKeywords) {
    if (norm.includes(item.word)) {
      scores.trabajo += item.weight;
      matchedKeywords.trabajo.push(item.word);
    }
  }

  // 4. Reglas y palabras clave para: ESPACIOS PRIVADOS (privados)
  const privateKeywords = [
    { word: "privado", weight: 35 },
    { word: "privada", weight: 35 },
    { word: "privados", weight: 35 },
    { word: "privacidad", weight: 40 },
    { word: "insonorizad", weight: 40 },
    { word: "insonorizado", weight: 40 },
    { word: "llamada", weight: 35 },
    { word: "llamadas", weight: 35 },
    { word: "videollamada", weight: 40 },
    { word: "videollamadas", weight: 40 },
    { word: "zoom", weight: 35 },
    { word: "meet", weight: 30 },
    { word: "teams", weight: 30 },
    { word: "confidencial", weight: 40 },
    { word: "oficina propia", weight: 35 },
    { word: "cerrada", weight: 30 },
    { word: "cerrado", weight: 30 },
    { word: "directorio privado", weight: 35 },
    { word: "gerencia", weight: 25 },
    { word: "entrevista", weight: 30 },
    { word: "aislado", weight: 30 },
    { word: "aislamiento", weight: 30 },
    { word: "sin ruido", weight: 30 },
    { word: "cero ruido", weight: 30 },
  ];
  for (const item of privateKeywords) {
    if (norm.includes(item.word)) {
      scores.privados += item.weight;
      matchedKeywords.privados.push(item.word);
    }
  }

  // 5. Reglas y palabras clave para: ESPACIOS INDIVIDUALES (individuales)
  const individualKeywords = [
    { word: "individual", weight: 40 },
    { word: "individuales", weight: 40 },
    { word: "solo", weight: 30 },
    { word: "sola", weight: 30 },
    { word: "estudiar", weight: 35 },
    { word: "estudio", weight: 30 },
    { word: "concentrar", weight: 35 },
    { word: "concentrarme", weight: 40 },
    { word: "concentracion", weight: 35 },
    { word: "laptop", weight: 25 },
    { word: "escritorio", weight: 30 },
    { word: "hot desk", weight: 40 },
    { word: "freelance", weight: 30 },
    { word: "programar", weight: 30 },
    { word: "codigo", weight: 25 },
    { word: "silencio", weight: 25 },
    { word: "silencioso", weight: 25 },
    { word: "tranquilo", weight: 25 },
    { word: "tranquilidad", weight: 25 },
    { word: "economico", weight: 30 },
    { word: "barato", weight: 30 },
    { word: "por horas", weight: 15 },
    { word: "autonomo", weight: 25 },
  ];
  for (const item of individualKeywords) {
    if (norm.includes(item.word)) {
      scores.individuales += item.weight;
      matchedKeywords.individuales.push(item.word);
    }
  }

  // 6. Reglas y palabras clave para: ZONA SOCIAL / LOUNGE (social)
  const socialKeywords = [
    { word: "social", weight: 40 },
    { word: "lounge", weight: 40 },
    { word: "cafe", weight: 25 },
    { word: "cafeteria", weight: 30 },
    { word: "descanso", weight: 35 },
    { word: "descansar", weight: 35 },
    { word: "relajar", weight: 30 },
    { word: "relajarme", weight: 35 },
    { word: "distension", weight: 30 },
    { word: "networking", weight: 35 },
    { word: "conversar", weight: 25 },
    { word: "informal", weight: 30 },
    { word: "break", weight: 30 },
  ];
  for (const item of socialKeywords) {
    if (norm.includes(item.word)) {
      scores.social += item.weight;
      matchedKeywords.social.push(item.word);
    }
  }

  // Determinar la categoría con mayor puntuación
  let bestType: SpaceTypeId = "individuales";
  let maxScore = scores.individuales;

  const typeEntries: [SpaceTypeId, number][] = [
    ["conferencias", scores.conferencias],
    ["trabajo", scores.trabajo],
    ["privados", scores.privados],
    ["social", scores.social],
    ["individuales", scores.individuales],
  ];

  for (const [t, s] of typeEntries) {
    if (s > maxScore) {
      maxScore = s;
      bestType = t;
    }
  }

  // Si no hubo coincidencia (score 0), aplicar fallback inteligente
  if (maxScore === 0) {
    if (norm.length > 0) {
      // Si el texto es largo y genérico, sugerir Espacio Individual como punto de partida
      bestType = "individuales";
      matchedKeywords.individuales.push("Búsqueda general");
    }
  }

  // Calcular confianza relativa (entre 75% y 98%)
  const confidence = Math.min(98, Math.max(78, 70 + Math.round(maxScore * 0.35)));

  // Buscar los espacios en la base de datos de sedes que coinciden con este tipo
  const matchingSpaces: Array<{ sede: SedeInfo; space: SpaceCategory }> = [];

  Object.values(SEDES_DATABASE).forEach((sede) => {
    sede.spaces.forEach((sp) => {
      let isMatch = false;

      if (bestType === "conferencias") {
        isMatch = sp.id === "conferencias";
      } else if (bestType === "trabajo") {
        isMatch = sp.id === "trabajo" || sp.id === "reuniones";
      } else if (bestType === "privados") {
        isMatch = sp.id === "privados";
      } else if (bestType === "individuales") {
        isMatch = sp.id === "individuales";
      } else if (bestType === "social") {
        isMatch = sp.id === "social";
      }

      if (isMatch) {
        matchingSpaces.push({ sede, space: sp });
      }
    });
  });

  // Metadatos y explicaciones específicas por cada tipo de espacio
  switch (bestType) {
    case "trabajo":
      return {
        typeId: "trabajo",
        title: "Sala de Reuniones y Trabajo en Equipo",
        badge: "Recomendado para Equipos & Colaboración",
        shortDescription:
          "Espacio colaborativo cerrado equipado con tecnología para dinámicas de equipo, presentaciones y reuniones grupales.",
        detailedReason:
          "Detectamos que tu necesidad se orienta a colaborar, coordinar con otros miembros o realizar presentaciones. Una Sala de Reuniones te ofrece el mobiliario adecuado, pantallas interactivas y privacidad sin molestar a los demás.",
        highlightedFeatures: [
          "Pantallas 4K con HDMI y conexión inalámbrica",
          "Pizarras de vidrio templado para ideación",
          "Mobiliario modular para equipos",
          "Capacidad flexible de 4 a 15 personas",
        ],
        recommendedCapacity: "4 a 15 personas",
        matchedKeywords: matchedKeywords.trabajo,
        confidence,
        matchingSpaces,
      };

    case "privados":
      return {
        typeId: "privados",
        title: "Espacio Privado / Oficina Insonorizada",
        badge: "Recomendado para Máxima Privacidad",
        shortDescription:
          "Oficina privada con aislamiento acústico completo para llamadas confidenciales, videollamadas y concentración de alto nivel.",
        detailedReason:
          "Tu búsqueda menciona privacidad, llamadas confidenciales o un entorno sin interrupciones. Este espacio cerrado te garantiza aislamiento acústico y discreción total para ti y tus clientes o socios.",
        highlightedFeatures: [
          "Aislamiento acústico de alto rendimiento",
          "Aire acondicionado independiente",
          "Ideal para videollamadas Zoom, Meet y Teams",
          "Máxima confidencialidad para clientes",
        ],
        recommendedCapacity: "1 a 3 personas",
        matchedKeywords: matchedKeywords.privados,
        confidence,
        matchingSpaces,
      };

    case "conferencias":
      return {
        typeId: "conferencias",
        title: "Sala de Conferencias & Auditorio",
        badge: "Recomendado para Eventos & Gran Aforo",
        shortDescription:
          "Espacio de gran formato equipado con proyector de alta luminosidad, podio y sistema de sonido profesional.",
        detailedReason:
          "Tu prompt hace referencia a un grupo numeroso, charla magistral o evento masivo. La Sala de Conferencias es el único formato capaz de albergar cómodamente hasta 40 personas con apoyo audiovisual integral.",
        highlightedFeatures: [
          "Aforo para hasta 40 personas",
          "Proyector HD y podio de orador",
          "Sistema de sonido envolvente con micrófonos",
          "Climatización para eventos corporativos",
        ],
        recommendedCapacity: "Hasta 40 personas",
        matchedKeywords: matchedKeywords.conferencias,
        confidence,
        matchingSpaces,
      };

    case "social":
      return {
        typeId: "social",
        title: "Zona Social & Lounge Barista",
        badge: "Recomendado para Descanso & Networking",
        shortDescription:
          "Ambiente distendido y confortable con barra de café gourmet libre para pausas activas, charlas informales o networking.",
        detailedReason:
          "Identificamos que buscas un momento de pausa, café o interacción informal. La Zona Social te permite desconectar de la rutina o tener charlas ligeras en un entorno estimulante.",
        highlightedFeatures: [
          "Barra de café barista y bebidas de cortesía",
          "Sillones ergonómicos estilo lounge",
          "Música ambiental suave",
          "Espacio ideal para ampliar tu red de contactos",
        ],
        recommendedCapacity: "Hasta 7 personas",
        matchedKeywords: matchedKeywords.social,
        confidence,
        matchingSpaces,
      };

    case "individuales":
    default:
      return {
        typeId: "individuales",
        title: "Espacio Individual (Hot Desk / Flex)",
        badge: "Recomendado para Concentración Personal",
        shortDescription:
          "Estación individual con silla ergonómica, Wi-Fi veloz y toma corriente dedicada, perfecta para trabajar o estudiar en solitario.",
        detailedReason:
          "Tu consulta indica una búsqueda de concentración, estudio o trabajo autónomo con tu laptop. Un Espacio Individual te brinda el costo más accesible, silencio y todos los servicios esenciales para una jornada productiva.",
        highlightedFeatures: [
          "Silla ergonómica de alto confort",
          "Wi-Fi de fibra óptica 500 Mbps",
          "Estación de café caliente ilimitado",
          "Tarifa más económica por hora",
        ],
        recommendedCapacity: "1 persona",
        matchedKeywords: matchedKeywords.individuales,
        confidence,
        matchingSpaces,
      };
  }
}
