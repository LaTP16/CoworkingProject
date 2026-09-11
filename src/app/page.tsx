"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stepper, { StepId } from "@/components/Stepper";
import SedesSection from "@/components/SedesSection";
import FlujoReserva from "@/components/FlujoReserva";
import FormularioDatos, { ClientData } from "@/components/FormularioDatos";
import PantallaPago from "@/components/PantallaPago";
import DexAssistant from "@/components/DexAssistant";
import Footer from "@/components/Footer";

const STORAGE_KEY = "coworking-reserva-state";

type VistaActual = "inicio" | "sedes" | "reserva" | "datos" | "pago";

interface PersistedReservationState {
  vistaActual: VistaActual;
  sedeSeleccionadaId: string;
  selectedDay: number | null;
  selectedSpaceId: string | null;
  selectedHourIds: string[];
  selectedHourLabels: string[];
  clientData: ClientData | null;
}

const getStoredState = (): Partial<PersistedReservationState> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // Control de vistas
  const [vistaActual, setVistaActual] = useState<VistaActual>("inicio");

  // Estados del proceso de reserva
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<string>("parque-amistad");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedHourIds, setSelectedHourIds] = useState<string[]>([]);
  const [selectedHourLabels, setSelectedHourLabels] = useState<string[]>([]);

  // Estado de Datos Personales del Cliente
  const [clientData, setClientData] = useState<ClientData | null>(null);

  // Carga inicial de localStorage tras montar para prevenir Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredState();
    if (stored.vistaActual) setVistaActual(stored.vistaActual);
    if (stored.sedeSeleccionadaId) setSedeSeleccionadaId(stored.sedeSeleccionadaId);
    if (stored.selectedDay !== undefined) setSelectedDay(stored.selectedDay ?? null);
    if (stored.selectedSpaceId) setSelectedSpaceId(stored.selectedSpaceId);
    if (stored.selectedHourIds) setSelectedHourIds(stored.selectedHourIds);
    if (stored.selectedHourLabels) setSelectedHourLabels(stored.selectedHourLabels);
    if (stored.clientData) setClientData(stored.clientData);
  }, []);

  // Guardar en localStorage solo después de montar
  useEffect(() => {
    if (!isMounted) return;

    const stateToStore: PersistedReservationState = {
      vistaActual,
      sedeSeleccionadaId,
      selectedDay,
      selectedSpaceId,
      selectedHourIds,
      selectedHourLabels,
      clientData,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch {
      // Ignorar errores de localStorage
    }
  }, [
    isMounted,
    vistaActual,
    sedeSeleccionadaId,
    selectedDay,
    selectedSpaceId,
    selectedHourIds,
    selectedHourLabels,
    clientData,
  ]);

  // Handlers para navegación
  const handleIrASedes = () => {
    setVistaActual("sedes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeleccionarSede = (sedeId: string) => {
    setSedeSeleccionadaId(sedeId);
    setVistaActual("reserva");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIrADatos = (
    day: number,
    spaceId: string,
    hourIds: string[],
    hourLabels: string[]
  ) => {
    setSelectedDay(day);
    setSelectedSpaceId(spaceId);
    setSelectedHourIds(hourIds);
    setSelectedHourLabels(hourLabels);
    setVistaActual("datos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIrAPagar = (data: ClientData) => {
    setClientData(data);
    setVistaActual("pago");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverAInicio = () => {
    setVistaActual("inicio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverASedes = () => {
    setVistaActual("sedes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverAReserva = () => {
    setVistaActual("reserva");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverADatos = () => {
    setVistaActual("datos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (stepId: StepId) => {
    setVistaActual(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden bg-white/40">
      {/* ========================================================
          FONDO "MESH GRADIENT" VÍVIDO Y VIBRANTE (COLORES MÁS VIVOS)
         ======================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Blob 1: Celeste Eléctrico Vívido */}
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-sky-400/80 mix-blend-multiply filter blur-[90px] opacity-85 animate-blob" />

        {/* Blob 2: Azul Rey / Índigo Intenso Vívido */}
        <div className="absolute top-[15%] right-[-10%] w-[65vw] h-[65vw] rounded-full bg-blue-600/70 mix-blend-multiply filter blur-[100px] opacity-80 animate-blob animation-delay-2000" />

        {/* Blob 3: Cian Brillante Vívido */}
        <div className="absolute bottom-[-15%] left-[15%] w-[55vw] h-[55vw] rounded-full bg-cyan-400/75 mix-blend-multiply filter blur-[95px] opacity-85 animate-blob animation-delay-4000" />

        {/* Blob 4: Índigo Azul Profundo Vívido */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/65 mix-blend-multiply filter blur-[100px] opacity-80 animate-blob animation-delay-2000" />
      </div>

      <Navbar onNavigateHome={handleVolverAInicio} />

      {/* Indicador de Progreso (Stepper interactivo) presente en Sedes, Reserva, Datos y Pago */}
      {vistaActual !== "inicio" && (
        <Stepper currentStep={vistaActual} onStepClick={handleStepClick} />
      )}

      <main className="flex-grow relative z-10">
        {/* PANTALLA 1: INICIO (Hero + Explicación del proceso) */}
        {vistaActual === "inicio" && (
          <Hero
            onVerSedes={handleIrASedes}
            onSelectSede={handleSeleccionarSede}
          />
        )}

        {/* PANTALLA 2: SEDES (Paso 1: Escoge) */}
        {vistaActual === "sedes" && (
          <SedesSection
            onSelectSede={handleSeleccionarSede}
            onBack={handleVolverAInicio}
          />
        )}

        {/* PANTALLA 3: RESERVA (Paso 2: Reserva) */}
        {vistaActual === "reserva" && (
          <FlujoReserva
            sedeId={sedeSeleccionadaId}
            onBack={handleVolverASedes}
            onIrADatos={handleIrADatos}
            onIrAPagar={(day, spaceId, hourIds, hourLabels) => {
              handleIrADatos(day, spaceId, hourIds, hourLabels);
            }}
          />
        )}

        {/* PANTALLA 4: TUS DATOS (Paso 3: Tus Datos) */}
        {vistaActual === "datos" && (
          <FormularioDatos
            sedeId={sedeSeleccionadaId}
            day={selectedDay || 15}
            spaceId={selectedSpaceId || "individuales"}
            selectedHoursCount={selectedHourIds.length || 2}
            selectedHourLabels={selectedHourLabels.length ? selectedHourLabels : ["09:00 - 10:00", "10:00 - 11:00"]}
            initialData={clientData || undefined}
            onBack={handleVolverAReserva}
            onContinuarAPagar={handleIrAPagar}
          />
        )}

        {/* PANTALLA 5: PAGO (Paso 4: Paga) */}
        {vistaActual === "pago" && (
          <PantallaPago
            sedeId={sedeSeleccionadaId}
            day={selectedDay || 15}
            spaceId={selectedSpaceId || "individuales"}
            selectedHoursCount={selectedHourIds.length || 2}
            selectedHourLabels={selectedHourLabels.length ? selectedHourLabels : ["09:00 - 10:00", "10:00 - 11:00"]}
            clientData={clientData}
            onBack={handleVolverADatos}
          />
        )}
      </main>

      <Footer />

      {/* Asistente Virtual Global Dex (Flotante en sedes, reserva, datos y pago) */}
      {vistaActual !== "inicio" && (
        <DexAssistant
          onSelectSede={handleSeleccionarSede}
          onNavigateToSedes={(sedeId) => {
            if (sedeId) {
              handleSeleccionarSede(sedeId);
            } else {
              handleIrASedes();
            }
          }}
        />
      )}
    </div>
  );
}
