"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stepper from "@/components/Stepper";
import SedesSection from "@/components/SedesSection";
import FlujoReserva from "@/components/FlujoReserva";
import PantallaPago from "@/components/PantallaPago";
import DexAssistant from "@/components/DexAssistant";
import Footer from "@/components/Footer";

const STORAGE_KEY = "coworking-reserva-state";

type VistaActual = "inicio" | "sedes" | "reserva" | "pago";

interface PersistedReservationState {
  vistaActual: VistaActual;
  sedeSeleccionadaId: string;
  selectedDay: number | null;
  selectedSpaceId: string | null;
  selectedHourIds: string[];
  selectedHourLabels: string[];
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
  // Control de vistas: 'inicio' | 'sedes' | 'reserva' | 'pago'
  const [vistaActual, setVistaActual] = useState<VistaActual>(() => {
    const stored = getStoredState();
    return stored.vistaActual ?? "inicio";
  });

  // Estados del proceso de reserva
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<string>(() => {
    const stored = getStoredState();
    return stored.sedeSeleccionadaId ?? "parque-amistad";
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const stored = getStoredState();
    return stored.selectedDay ?? null;
  });
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(() => {
    const stored = getStoredState();
    return stored.selectedSpaceId ?? null;
  });
  const [selectedHourIds, setSelectedHourIds] = useState<string[]>(() => {
    const stored = getStoredState();
    return stored.selectedHourIds ?? [];
  });
  const [selectedHourLabels, setSelectedHourLabels] = useState<string[]>(() => {
    const stored = getStoredState();
    return stored.selectedHourLabels ?? [];
  });

  useEffect(() => {
    const stateToStore: PersistedReservationState = {
      vistaActual,
      sedeSeleccionadaId,
      selectedDay,
      selectedSpaceId,
      selectedHourIds,
      selectedHourLabels,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch {
      // Ignorar si no se puede guardar en localStorage
    }
  }, [
    vistaActual,
    sedeSeleccionadaId,
    selectedDay,
    selectedSpaceId,
    selectedHourIds,
    selectedHourLabels,
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

  const handleIrAPagar = (
    day: number,
    spaceId: string,
    hourIds: string[],
    hourLabels: string[]
  ) => {
    setSelectedDay(day);
    setSelectedSpaceId(spaceId);
    setSelectedHourIds(hourIds);
    setSelectedHourLabels(hourLabels);
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

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <Navbar />

      {/* Indicador de Progreso (Stepper) presente en Sedes, Reserva y Pago */}
      {vistaActual !== "inicio" && <Stepper currentStep={vistaActual} />}

      <main className="flex-grow">
        {/* PANTALLA 1: INICIO (Hero + Explicación del proceso en 3 pasos) */}
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
            onIrAPagar={handleIrAPagar}
          />
        )}

        {/* PANTALLA 4: PAGO (Paso 3: Paga) */}
        {vistaActual === "pago" && (
          <PantallaPago
            sedeId={sedeSeleccionadaId}
            day={selectedDay}
            spaceId={selectedSpaceId}
            selectedHoursCount={selectedHourIds.length}
            selectedHourLabels={selectedHourLabels}
            onBack={handleVolverAReserva}
          />
        )}
      </main>

      <Footer />

      {/* Asistente Virtual Global Dex (Flotante en sedes, reserva y pago) */}
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
