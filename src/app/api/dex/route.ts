import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { classifyPromptIntent } from "@/utils/spaceClassifier";

const SYSTEM_PROMPT = `Eres Dex, el asesor y anfitrión virtual de EspaciApp (la red de coworkings de la Municipalidad de Santiago de Surco, Lima).
Tu personalidad y estilo de respuesta:
- Hablas con un tono 100% humano, cálido, empático, cercano y profesional, como un anfitrión atento en la recepción de un coworking en Surco.
- NUNCA uses frases acartonadas o robóticas como "Tu consulta indica una búsqueda de concentración...", "Se ha detectado un requerimiento...", etc. Habla de forma fluida y natural.
- Sé conciso: responde en 1 o 2 párrafos breves, fáciles y cómodos de leer en el chat móvil.

REGLAS DE RECOMENDACIÓN:
1. SALUDOS O PREGUNTAS GENERALES:
   - Si el usuario solo saluda (ej: "hola", "buenas tardes", "qué tal", "cómo estás") o hace preguntas generales sobre servicios (café, wifi, pet friendly, descuentos de vecinos de Surco), saluda con calidez y responde su duda directamente.
   - En estos casos, "recommendedSedeId" y "recommendedSpaceId" DEBEN ser null, y "canAutoReserve" debe ser false. ¡No fuerces una tarjeta de reserva si solo está saludando!
2. CUANDO EL USUARIO BUSCA UN ESPACIO:
   - Si te dice qué busca (ej: "somos 3 personas para hacer llamadas", "un escritorio para estudiar con mi laptop", "sala para presentar a 8 clientes", "evento para 30 personas"):
     * Recomiéndale de forma entusiasta y cercana el mejor espacio y la sede más conveniente.
     * Menciona beneficios reales como el 50% de descuento para vecinos de Surco, café ilimitado y Wi-Fi de 500 Mbps.
     * Asigna exactamente "recommendedSedeId", "recommendedSpaceId" y "canAutoReserve": true, para que el sistema le muestre la tarjeta de reserva inmediata con 1 click.

SEDES Y ESPACIOS VÁLIDOS:
- "parque-amistad" (Sede Parque de la Amistad - Av. Caminos del Inca 2100):
  * "individuales": Escritorios flex (S/ 8/hr) - ideal para concentración, estudiantes y laptops.
  * "privados": Oficinas privadas (S/ 20/hr, hasta 3 pers) - insonorizada, llamadas confidenciales, Zoom.
  * "trabajo": Sala de trabajo (S/ 30/hr, hasta 6 pers) - mesas amplias y pizarras.
  * "conferencias": Sala de conferencias (S/ 50/hr, hasta 40 pers) - proyector y eventos.
- "surco-pueblo" (Sede Surco Pueblo - Jr. Bolognesi 340):
  * "individuales": (S/ 4/hr) - la más económica y céntrica.
  * "privados": (S/ 20/hr, hasta 3 pers) - insonorizadas.
  * "trabajo": (S/ 30/hr, hasta 4 pers).
  * "reuniones": (S/ 50/hr, hasta 8 pers) - pantalla 4K.
- "castilla" (Sede Castilla - Av. Mariscal Castilla 850):
  * "individuales": (S/ 4/hr) - sillas ergonómicas y vista panorámica.
  * "privados": (S/ 20/hr, hasta 3 pers).
  * "reuniones": (S/ 50/hr, hasta 8 pers).
  * "social": (S/ 40/hr, hasta 7 pers) - zona lounge y café barista.

FORMATO DE SALIDA (JSON ÚNICAMENTE):
{
  "reply": "Texto fluido, natural y empático de Dex",
  "recommendedSedeId": "parque-amistad" | "surco-pueblo" | "castilla" | null,
  "recommendedSpaceId": "individuales" | "privados" | "trabajo" | "conferencias" | "reuniones" | "social" | null,
  "canAutoReserve": boolean
}`;

function getGeminiApiKey(): string | null {
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "PEGA_AQUI_TU_API_KEY"
  ) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      if (match) {
        const k = match[1].trim();
        if (k && k !== "PEGA_AQUI_TU_API_KEY") return k;
      }
      const lines = content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"));
      if (lines.length > 0) {
        const k = lines[0].replace(/^GEMINI_API_KEY\s*=\s*/, "").trim();
        if (k && k !== "PEGA_AQUI_TU_API_KEY") return k;
      }
    }
  } catch {}
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessage = (body.message || "").trim();
    const history: Array<{ sender: "user" | "dex"; text: string }> =
      body.history || [];

    // Sanitización de entrada (máximo 400 caracteres para evitar Prompt Injection)
    const message = rawMessage.slice(0, 400);

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();

    // 1. Si tenemos la API Key, llamar a Gemini 3.6 Flash (con timeout de 15s)
    if (apiKey && apiKey.length > 10) {
      const modelsToTry = ["gemini-3.6-flash"];
      
      const contents = [];
      for (const h of history.slice(-4)) {
        contents.push({
          role: h.sender === "dex" ? "model" : "user",
          parts: [{ text: h.text }],
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      for (const model of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{ text: SYSTEM_PROMPT }],
                },
                generationConfig: {
                  temperature: 0.65,
                  maxOutputTokens: 1000,
                  responseMimeType: "application/json",
                },
              }),
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const candidateText =
              data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              let cleanJson = candidateText.trim();
              if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
              } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
              }
              const parsed = JSON.parse(cleanJson);
              return NextResponse.json({
                reply: parsed.reply,
                recommendedSedeId: parsed.recommendedSedeId || null,
                recommendedSpaceId: parsed.recommendedSpaceId || null,
                canAutoReserve: !!parsed.canAutoReserve,
                source: "gemini",
              });
            }
          } else {
            console.warn(`Gemini model ${model} returned ${response.status}`);
          }
        } catch (err: any) {
          console.warn(`Error trying ${model}:`, err.message);
        }
      }
    }

    // 2. Fallback Natural Inteligente (en caso de saludo o sin conexión a la API)
    const lower = message.toLowerCase().trim();
    const isGreeting =
      lower === "hola" ||
      lower.startsWith("hola") ||
      lower === "buenas" ||
      lower.startsWith("buen") ||
      lower.startsWith("hey") ||
      lower.startsWith("que tal") ||
      lower.startsWith("qué tal");

    if (isGreeting) {
      return NextResponse.json({
        reply:
          "¡Hola! Qué gusto saludarte. Soy Dex, tu asesor en EspaciApp Surco. Cuéntame qué necesitas hoy: ¿buscas un lugar tranquilo para trabajar solo, una sala para tu equipo o una oficina para llamadas privadas?",
        recommendedSedeId: null,
        recommendedSpaceId: null,
        canAutoReserve: false,
        source: "natural-fallback",
      });
    }

    // Fallback conversacional cuando buscan espacio
    const analysis = classifyPromptIntent(message);
    const firstMatch = analysis.matchingSpaces[0];
    const sedeName = firstMatch?.sede.name || "Parque de la Amistad";
    const spaceName = firstMatch?.space.name || "Espacio Individual";

    let naturalExplanation = `¡Excelente! Para lo que necesitas te recomiendo especialmente ${spaceName} en nuestra sede ${sedeName}. Cuenta con Wi-Fi de alta velocidad, café ilimitado y un ambiente cómodo para trabajar sin distracciones.`;
    if (analysis.typeId === "privados") {
      naturalExplanation = `¡Perfecto! Te sugiero una Oficina Privada en la sede ${sedeName}. Es un espacio completamente insonorizado donde podrás hacer llamadas o reunirte con total confidencialidad.`;
    } else if (analysis.typeId === "trabajo" || analysis.typeId === "conferencias") {
      naturalExplanation = `¡Genial! Para el grupo les recomiendo la sala de ${spaceName} en ${sedeName}. Tiene capacidad adecuada, proyector/pantalla y mesas amplias para que coordinen cómodamente.`;
    }

    return NextResponse.json({
      reply: naturalExplanation,
      recommendedSedeId: firstMatch?.sede.id || "parque-amistad",
      recommendedSpaceId: analysis.typeId,
      canAutoReserve: true,
      source: "conversational-fallback",
    });
  } catch {
    return NextResponse.json(
      {
        reply:
          "¡Hola! Dime qué necesitas hoy (¿trabajas solo o con tu equipo?) y te ayudaré a elegir el mejor espacio.",
        recommendedSedeId: null,
        recommendedSpaceId: null,
        canAutoReserve: false,
      },
      { status: 200 }
    );
  }
}
