import { NextResponse } from "next/server";
import padron from "@/data/padronVecinos.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dni = (searchParams.get("dni") || "").trim();

    if (!dni || dni.length !== 8) {
      return NextResponse.json(
        { error: "DNI inválido. Debe tener exactamente 8 dígitos." },
        { status: 400 }
      );
    }

    // Búsqueda en el padrón distrital de vecinos
    const persona = padron.find((p) => p.dni === dni);

    if (!persona) {
      return NextResponse.json({
        encontrado: false,
        esVecinoSurco: false,
        descuentoPorcentaje: 0,
        mensaje: "DNI no empadronado en Surco. Aplica tarifa estándar.",
      });
    }

    const esSurcano = persona.distrito === "Santiago de Surco";

    return NextResponse.json({
      encontrado: true,
      esVecinoSurco: esSurcano,
      descuentoPorcentaje: esSurcano ? 50 : 0,
      persona: {
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        nombreCompleto: `${persona.nombres} ${persona.apellidos}`,
        dni: persona.dni,
        correo: persona.correo,
        celular: persona.celular,
        distrito: persona.distrito,
      },
      mensaje: esSurcano
        ? "¡Vecino de Santiago de Surco verificado! Se aplicó 50% de descuento."
        : `Residente de ${persona.distrito}. Aplica tarifa estándar.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al consultar padrón", details: error.message },
      { status: 500 }
    );
  }
}
