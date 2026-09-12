import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "reservasStore.json");

export interface ReservaRecord {
  id: string;
  codigoReserva: string;
  createdAt: string;
  sedeId: string;
  sedeNombre: string;
  sedeDireccion: string;
  espacioId: string;
  espacioNombre: string;
  precioPorHora: number;
  fecha: string;
  horaInicio: string;
  duracionHoras: number;
  horaFin: string;
  horaEncuesta: string;
  esVecinoSurco: boolean;
  descuentoMonto: number;
  montoTotal: number;
  cliente: {
    nombres: string;
    dni: string;
    correo: string;
    celular: string;
    distrito: string;
  };
  metodoPago: string;
  estado: "activa" | "completada" | "encuesta_pendiente" | "encuestada";
  encuestaEnviada: boolean;
}

// Cargar reservas desde el almacenamiento local
function getReservas(): ReservaRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Sembrar reservas iniciales de muestra para que Coefficient y los reportes tengan datos reales de partida
      const seedReservas: ReservaRecord[] = [
        {
          id: "res-001",
          codigoReserva: "SURCO-CW-10492",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          sedeId: "parque-amistad",
          sedeNombre: "Parque de la Amistad",
          sedeDireccion: "Av. Caminos del Inca 2100",
          espacioId: "individuales",
          espacioNombre: "Espacios individuales",
          precioPorHora: 8,
          fecha: "2026-09-11",
          horaInicio: "09:00",
          duracionHoras: 4,
          horaFin: "13:00",
          horaEncuesta: "13:10",
          esVecinoSurco: true,
          descuentoMonto: 16,
          montoTotal: 16,
          cliente: {
            nombres: "Carlos Rodríguez",
            dni: "72345678",
            correo: "carlos.rodriguez@gmail.com",
            celular: "987654321",
            distrito: "Santiago de Surco",
          },
          metodoPago: "Yape",
          estado: "completada",
          encuestaEnviada: true,
        },
        {
          id: "res-002",
          codigoReserva: "SURCO-CW-10493",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          sedeId: "castilla",
          sedeNombre: "Castilla",
          sedeDireccion: "Av. Mariscal Castilla 850",
          espacioId: "privados",
          espacioNombre: "Oficinas privadas",
          precioPorHora: 20,
          fecha: "2026-09-12",
          horaInicio: "10:00",
          duracionHoras: 3,
          horaFin: "13:00",
          horaEncuesta: "13:10",
          esVecinoSurco: false,
          descuentoMonto: 0,
          montoTotal: 60,
          cliente: {
            nombres: "María Fernández",
            dni: "45892134",
            correo: "maria.fernandez@outlook.com",
            celular: "912345678",
            distrito: "Miraflores",
          },
          metodoPago: "Tarjeta de Débito",
          estado: "activa",
          encuestaEnviada: false,
        },
        {
          id: "res-003",
          codigoReserva: "SURCO-CW-10494",
          createdAt: new Date().toISOString(),
          sedeId: "surco-pueblo",
          sedeNombre: "Surco Pueblo",
          sedeDireccion: "Jr. Bolognesi 340",
          espacioId: "reuniones",
          espacioNombre: "Sala de reuniones ejecutiva",
          precioPorHora: 50,
          fecha: "2026-09-12",
          horaInicio: "15:00",
          duracionHoras: 2,
          horaFin: "17:00",
          horaEncuesta: "17:10",
          esVecinoSurco: true,
          descuentoMonto: 50,
          montoTotal: 50,
          cliente: {
            nombres: "Jorge Ramos",
            dni: "10492817",
            correo: "jorge.ramos@gmail.com",
            celular: "998877665",
            distrito: "Santiago de Surco",
          },
          metodoPago: "Plin",
          estado: "activa",
          encuestaEnviada: false,
        },
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(seedReservas, null, 2), "utf8");
      return seedReservas;
    }
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content) || [];
  } catch (e) {
    return [];
  }
}

function saveReservas(reservas: ReservaRecord[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reservas, null, 2), "utf8");
  } catch (e) {
    console.error("Error guardando reservas:", e);
  }
}

// GET: Retorna las reservas en formato JSON y estadísticas en tiempo real (o CSV para Coefficient/Google Sheets)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format"); // 'json' o 'csv'

  const reservas = getReservas();

  // Si Coefficient o Google Sheets pide formato CSV para importación directa
  if (format === "csv") {
    const headers = [
      "CodigoReserva",
      "FechaRegistro",
      "Sede",
      "Espacio",
      "FechaReserva",
      "HoraInicio",
      "DuracionHoras",
      "HoraFin",
      "HoraEncuestaSatisfaccion",
      "ClienteNombre",
      "ClienteDNI",
      "ClienteDistrito",
      "EsVecinoSurco",
      "MontoTotalPEN",
      "MetodoPago",
      "Estado",
    ];

    const rows = reservas.map((r) => [
      r.codigoReserva,
      r.createdAt,
      `"${r.sedeNombre}"`,
      `"${r.espacioNombre}"`,
      r.fecha,
      r.horaInicio,
      r.duracionHoras,
      r.horaFin,
      r.horaEncuesta,
      `"${r.cliente.nombres}"`,
      r.cliente.dni,
      `"${r.cliente.distrito}"`,
      r.esVecinoSurco ? "SI" : "NO",
      r.montoTotal.toFixed(2),
      r.metodoPago,
      r.estado,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=reservas_emuss_surco.csv",
      },
    });
  }

  // Métricas y estadísticas del sistema de reservas
  const totalRecaudado = reservas.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalHoras = reservas.reduce((acc, r) => acc + r.duracionHoras, 0);
  const vecinosSurcoCount = reservas.filter((r) => r.esVecinoSurco).length;

  const ocupacionPorSede: Record<string, { nombre: string; totalReservas: number; totalHoras: number; ingresos: number }> = {};
  reservas.forEach((r) => {
    if (!ocupacionPorSede[r.sedeId]) {
      ocupacionPorSede[r.sedeId] = {
        nombre: r.sedeNombre,
        totalReservas: 0,
        totalHoras: 0,
        ingresos: 0,
      };
    }
    ocupacionPorSede[r.sedeId].totalReservas += 1;
    ocupacionPorSede[r.sedeId].totalHoras += r.duracionHoras;
    ocupacionPorSede[r.sedeId].ingresos += r.montoTotal;
  });

  return NextResponse.json({
    kpis: {
      totalReservas: reservas.length,
      totalRecaudadoPEN: totalRecaudado,
      totalHorasUso: totalHoras,
      porcentajeVecinosSurco: reservas.length > 0 ? Math.round((vecinosSurcoCount / reservas.length) * 100) : 0,
      ocupacionPorSede,
      ultimaActualizacion: new Date().toISOString(),
    },
    reservas: reservas.slice().reverse(), // Las más recientes primero
  });
}

// POST: Registrar una nueva reserva en tiempo real
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      sedeId,
      sedeNombre,
      sedeDireccion,
      espacioId,
      espacioNombre,
      precioPorHora,
      fecha,
      horaInicio,
      duracionHoras,
      esVecinoSurco,
      descuentoMonto,
      montoTotal,
      cliente,
      metodoPago,
    } = body;

    // Calcular hora de fin y hora de encuesta (+10 min)
    const [hStr, mStr] = (horaInicio || "10:00").split(":");
    const hNum = parseInt(hStr, 10);
    const mNum = parseInt(mStr || "0", 10);
    const durNum = parseInt(duracionHoras || 2, 10);

    const endH = hNum + durNum;
    const horaFin = `${String(endH % 24).padStart(2, "0")}:${String(mNum).padStart(2, "0")}`;

    // +10 minutos después de la hora de fin
    let surveyM = mNum + 10;
    let surveyH = endH;
    if (surveyM >= 60) {
      surveyM -= 60;
      surveyH += 1;
    }
    const horaEncuesta = `${String(surveyH % 24).padStart(2, "0")}:${String(surveyM).padStart(2, "0")}`;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codigoReserva = `SURCO-CW-${randomSuffix}`;

    const nuevaReserva: ReservaRecord = {
      id: `res-${Date.now()}`,
      codigoReserva,
      createdAt: new Date().toISOString(),
      sedeId: sedeId || "parque-amistad",
      sedeNombre: sedeNombre || "Parque de la Amistad",
      sedeDireccion: sedeDireccion || "Av. Caminos del Inca 2100",
      espacioId: espacioId || "individuales",
      espacioNombre: espacioNombre || "Espacio Individual",
      precioPorHora: Number(precioPorHora) || 8,
      fecha: fecha || new Date().toISOString().split("T")[0],
      horaInicio: horaInicio || "10:00",
      duracionHoras: durNum,
      horaFin,
      horaEncuesta,
      esVecinoSurco: !!esVecinoSurco,
      descuentoMonto: Number(descuentoMonto) || 0,
      montoTotal: Number(montoTotal) || 0,
      cliente: {
        nombres: cliente?.nombres || "Vecino de Surco",
        dni: cliente?.dni || "00000000",
        correo: cliente?.correo || "contacto@surco.gob.pe",
        celular: cliente?.celular || "999999999",
        distrito: cliente?.distrito || (esVecinoSurco ? "Santiago de Surco" : "Otro"),
      },
      metodoPago: metodoPago || "Yape",
      estado: "activa",
      encuestaEnviada: false,
    };

    const reservas = getReservas();
    reservas.push(nuevaReserva);
    saveReservas(reservas);

    return NextResponse.json({
      success: true,
      mensaje: "Reserva registrada en tiempo real en la base de datos",
      reserva: nuevaReserva,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al procesar reserva", details: error.message },
      { status: 500 }
    );
  }
}
