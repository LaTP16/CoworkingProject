"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Presentation,
  User,
  Users,
  Coffee,
  Briefcase,
  MapPin,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Camera,
  X,
} from "lucide-react";
import { SEDES_DATABASE, SpaceCategory, findSpaceById } from "@/data/sedesData";
import SpaceDetailModal from "@/components/SpaceDetailModal";

export interface TimeSlotConfig {
  id: string;
  label: string;
  occupancyRatio: number;
}

const mockTimeSlotsBase: TimeSlotConfig[] = [
  { id: "t1", label: "08:00 - 09:00", occupancyRatio: 0.35 },
  { id: "t2", label: "09:00 - 10:00", occupancyRatio: 1.0 }, // Rojo (Lleno)
  { id: "t3", label: "10:00 - 11:00", occupancyRatio: 0.6 },
  { id: "t4", label: "11:00 - 12:00", occupancyRatio: 0.25 },
  { id: "t5", label: "12:00 - 13:00", occupancyRatio: 1.0 }, // Rojo (Lleno)
  { id: "t6", label: "13:00 - 14:00", occupancyRatio: 0.5 },
  { id: "t7", label: "14:00 - 15:00", occupancyRatio: 1.0 }, // Rojo (Lleno)
  { id: "t8", label: "15:00 - 16:00", occupancyRatio: 0.0 }, // Libre
  { id: "t9", label: "16:00 - 17:00", occupancyRatio: 0.75 },
  { id: "t10", label: "17:00 - 18:00", occupancyRatio: 0.4 },
  { id: "t11", label: "18:00 - 19:00", occupancyRatio: 1.0 }, // Rojo (Lleno)
  { id: "t12", label: "19:00 - 20:00", occupancyRatio: 0.55 },
  { id: "t13", label: "20:00 - 21:00", occupancyRatio: 0.15 },
  { id: "t14", label: "21:00 - 22:00", occupancyRatio: 1.0 }, // Rojo (Lleno)
];

interface FlujoReservaProps {
  sedeId?: string;
  onBack?: () => void;
  onIrADatos?: (
    day: number,
    spaceId: string,
    hourIds: string[],
    hourLabels: string[]
  ) => void;
  onIrAPagar?: (
    day: number,
    spaceId: string,
    hourIds: string[],
    hourLabels: string[]
  ) => void;
}

const renderSpaceIcon = (
  iconName: SpaceCategory["iconName"],
  isSelected: boolean
) => {
  const iconClass = `w-5 h-5 ${isSelected ? "text-white" : "text-blue-600"}`;
  switch (iconName) {
    case "user":
      return <User className={iconClass} />;
    case "lock":
      return <Lock className={iconClass} />;
    case "users":
      return <Users className={iconClass} />;
    case "presentation":
      return <Presentation className={iconClass} />;
    case "coffee":
      return <Coffee className={iconClass} />;
    case "briefcase":
      return <Briefcase className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
};

const STORAGE_KEY = "coworking-flujo-reserva";

export default function FlujoReserva({
  sedeId = "parque-amistad",
  onBack,
  onIrADatos,
  onIrAPagar,
}: FlujoReservaProps) {
  const currentSede = SEDES_DATABASE[sedeId] || SEDES_DATABASE["parque-amistad"];

  const getStoredReserva = (): { selectedDay: number | null; selectedSpaceId: string | null; horasSeleccionadas: string[] } => {
    if (typeof window === "undefined") {
      return { selectedDay: null, selectedSpaceId: null, horasSeleccionadas: [] };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { selectedDay: null, selectedSpaceId: null, horasSeleccionadas: [] };
    } catch {
      return { selectedDay: null, selectedSpaceId: null, horasSeleccionadas: [] };
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  // Paso A: Día seleccionado
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Paso B: Espacio seleccionado
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  // Paso C: Horas seleccionadas (Array)
  const [horasSeleccionadas, setHorasSeleccionadas] = useState<string[]>([]);

  // Estado para abrir modal de fotos y reseñas
  const [spaceModalCategory, setSpaceModalCategory] = useState<SpaceCategory | null>(null);

  // Estado para abrir modal de selección de aforo / sub-opciones
  const [subOptionModalCategory, setSubOptionModalCategory] = useState<SpaceCategory | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredReserva();
    if (stored.selectedDay !== undefined && stored.selectedDay !== null) setSelectedDay(stored.selectedDay);
    if (stored.selectedSpaceId) setSelectedSpaceId(stored.selectedSpaceId);
    if (stored.horasSeleccionadas) setHorasSeleccionadas(stored.horasSeleccionadas);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selectedDay, selectedSpaceId, horasSeleccionadas })
      );
    } catch {
      // Ignorar si no se puede guardar en localStorage
    }
  }, [isMounted, selectedDay, selectedSpaceId, horasSeleccionadas]);

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const daysInSeptember = Array.from({ length: 30 }, (_, i) => i + 1);

  const activeSpaceInfo = findSpaceById(currentSede, selectedSpaceId);
  const totalCapacity = activeSpaceInfo?.count || 1;

  const slotsWithOccupancy = useMemo(() => {
    return mockTimeSlotsBase.map((slot) => {
      let occupied = Math.round(slot.occupancyRatio * totalCapacity);
      if (
        slot.occupancyRatio > 0 &&
        slot.occupancyRatio < 1 &&
        occupied === totalCapacity
      ) {
        occupied = Math.max(0, totalCapacity - 1);
      }
      const isFull = occupied === totalCapacity;
      return { ...slot, occupied, total: totalCapacity, isFull };
    });
  }, [totalCapacity]);

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setSelectedSpaceId(null);
    setHorasSeleccionadas([]);
  };

  const handleSelectSpaceCategory = (espacio: SpaceCategory) => {
    if (espacio.subOptions && espacio.subOptions.length > 0) {
      setSubOptionModalCategory(espacio);
    } else {
      setSelectedSpaceId(espacio.id);
      setHorasSeleccionadas([]);
    }
  };

  const handleToggleSlot = (slotId: string, isFull: boolean) => {
    if (isFull) return;
    setHorasSeleccionadas((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const selectedLabels = slotsWithOccupancy
    .filter((slot) => horasSeleccionadas.includes(slot.id))
    .map((slot) => slot.label);

  const handleProceedToPayment = () => {
    if (!selectedDay || !selectedSpaceId || horasSeleccionadas.length === 0)
      return;
    if (onIrADatos) {
      onIrADatos(selectedDay, selectedSpaceId, horasSeleccionadas, selectedLabels);
    } else {
      onIrAPagar?.(
        selectedDay,
        selectedSpaceId,
        horasSeleccionadas,
        selectedLabels
      );
    }
  };

  return (
    <section id="reserva" className="py-10 sm:py-16 bg-gray-50/80 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de Volver a sedes */}
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Volver a sedes</span>
            </button>
          </div>
        )}

        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Sede seleccionada: {currentSede.name}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Reserva tu espacio en {currentSede.name}
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Selecciona el día, tipo de espacio y los horarios que utilizarás.
          </p>
        </div>

        {/* PASO A: CALENDARIO */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                A
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Paso A: Selecciona el Día
                </h3>
                <p className="text-xs text-gray-500">Septiembre 2026</p>
              </div>
            </div>
            {selectedDay && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Día {selectedDay} de Septiembre
              </span>
            )}
          </div>

          <div className="flex items-center justify-between max-w-sm mx-auto mb-6 px-2">
            <button type="button" disabled className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Septiembre 2026</span>
            </div>
            <button type="button" disabled className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {weekDays.map((d) => (
                <div key={d} className="text-xs font-bold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="p-2"></div>
              {daysInSeptember.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    type="button"
                    className={`h-10 sm:h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-md scale-105 ring-2 ring-blue-600 ring-offset-2"
                        : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PASO B: ESPACIO */}
        {selectedDay !== null && (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 animate-fade-in">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  B
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Paso B: Selecciona el Tipo de Espacio
                  </h3>
                  <p className="text-xs text-gray-500">
                    Espacios disponibles en {currentSede.name}
                  </p>
                </div>
              </div>
              {selectedSpaceId && activeSpaceInfo && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {activeSpaceInfo.name} (Capacidad: {activeSpaceInfo.count})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentSede.spaces.map((espacio) => {
                const selectedSubOption = espacio.subOptions?.find(
                  (so) => so.id === selectedSpaceId
                );
                const isSelected = selectedSpaceId === espacio.id || !!selectedSubOption;

                return (
                  <div
                    key={espacio.id}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-600 ring-offset-2"
                        : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                          {renderSpaceIcon(espacio.iconName, isSelected)}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedSubOption
                              ? selectedSubOption.capacityLabel
                              : `Capacidad: ${espacio.count}`}
                          </span>
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-amber-400 text-slate-900"
                                : "bg-amber-100 text-amber-900 border border-amber-200"
                            }`}
                          >
                            S/ {selectedSubOption ? selectedSubOption.pricePerHour : (espacio.pricePerHour || 15)}.00 / hr
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-base mb-1">
                        {espacio.name}
                      </h4>
                      {selectedSubOption && (
                        <span className="inline-block bg-white/20 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg mb-2">
                          ✓ {selectedSubOption.name}
                        </span>
                      )}
                      <p
                        className={`text-xs mb-3 ${
                          isSelected ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {selectedSubOption ? selectedSubOption.description : espacio.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/20 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div
                          className={`flex items-center gap-1 font-bold ${
                            isSelected ? "text-amber-300" : "text-amber-500"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{espacio.rating}</span>
                          <span
                            className={`font-normal ${
                              isSelected ? "text-blue-200" : "text-gray-400"
                            }`}
                          >
                            ({espacio.reviewsCount})
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpaceModalCategory(espacio);
                          }}
                          type="button"
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-white/20 text-white hover:bg-white/30 border-white/30"
                              : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                          }`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>Fotos & Reseñas</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleSelectSpaceCategory(espacio)}
                        type="button"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-white text-blue-700 hover:bg-blue-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {selectedSubOption
                          ? "Cambiar opción de aforo ⚙️"
                          : isSelected
                          ? "Espacio Seleccionado ✓"
                          : "Seleccionar para reservar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO C: HORARIOS EN VERTICAL Y RESUMEN AL COSTADO DERECHO */}
        {selectedDay !== null && selectedSpaceId !== null && (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 animate-fade-in space-y-6">
            {/* Encabezado del Paso C */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  C
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Paso C: Selecciona los Horarios
                  </h3>
                  <p className="text-xs text-gray-500">
                    Elige tus horas en la lista vertical y revisa el resumen al costado derecho (S/ {activeSpaceInfo?.pricePerHour || 15}.00/hr)
                  </p>
                </div>
              </div>
              {horasSeleccionadas.length > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {horasSeleccionadas.length} hr(s) elegida(s)
                </span>
              )}
            </div>

            {/* ESTRUCTURA DE 2 COLUMNAS: HORARIOS VERTICALES (IZQ) vs RESUMEN LATERAL (DER) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* COLUMNA IZQUIERDA: LISTA VERTICAL DE HORARIOS */}
              <div className="lg:col-span-2 space-y-4">
                {/* Leyenda de Ocupación */}
                <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>No disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>Seleccionado</span>
                  </div>
                </div>

                {/* Lista Vertical de Horarios */}
                <div className="flex flex-col gap-2 max-h-[540px] overflow-y-auto pr-1">
                  {slotsWithOccupancy.map((slot) => {
                    const isSelected = horasSeleccionadas.includes(slot.id);
                    const isFull = slot.isFull;

                    let badgeBg = isFull
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800";
                    let borderStyle = "border-gray-200";

                    if (isSelected) {
                      borderStyle = "border-blue-600 ring-2 ring-blue-600/30 bg-blue-600 text-white";
                    }

                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleToggleSlot(slot.id, isFull)}
                        disabled={isFull}
                        type="button"
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${borderStyle} ${
                          isFull
                            ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-600 text-white shadow-md cursor-pointer"
                            : "bg-gray-50 text-gray-800 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm block leading-tight">
                              {slot.label}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                isSelected ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              Tarifa: S/ {(activeSpaceInfo?.pricePerHour || 15)}.00 / hora
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : badgeBg
                            }`}
                          >
                            {isFull
                              ? `Lleno (${slot.occupied}/${slot.total})`
                              : isSelected
                              ? `Seleccionado ✓`
                              : `Disponible (${slot.occupied}/${slot.total})`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLUMNA DERECHA: RESUMEN DE SELECCIÓN EN COSTADO DERECHO */}
              <div className="lg:col-span-1 lg:sticky lg:top-6 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border border-blue-200 rounded-3xl p-6 shadow-lg space-y-5">
                <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm pb-3 border-b border-blue-100">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Resumen de tu Selección</span>
                </div>

                {/* Detalles de Sede, Día y Espacio */}
                <div className="space-y-3 text-xs text-gray-700">
                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 font-medium block">Sede:</span>
                      <span className="font-bold text-gray-900">{currentSede.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                    <CalendarIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 font-medium block">Día seleccionado:</span>
                      <span className="font-bold text-gray-900">Septiembre {selectedDay}, 2026</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                    <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-400 font-medium block">Tipo de espacio:</span>
                      <span className="font-bold text-gray-900">{activeSpaceInfo?.name}</span>
                    </div>
                  </div>

                  {/* Horas Seleccionadas en chips */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-gray-400 font-medium">
                      <span>Horas elegidas:</span>
                      <span className="font-bold text-blue-600">{horasSeleccionadas.length} hr(s)</span>
                    </div>

                    {horasSeleccionadas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedLabels.map((lbl, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Selecciona una o más horas de la lista vertical a la izquierda.
                      </p>
                    )}
                  </div>
                </div>

                {/* Precio Total & Botón de Pago */}
                <div className="pt-3 border-t border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Total a Pagar:</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      S/ {(horasSeleccionadas.length * (activeSpaceInfo?.pricePerHour || 15)).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={horasSeleccionadas.length === 0}
                    type="button"
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continuar a Tus Datos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Selección de Aforo (Sub-opciones de espacio privado) */}
      {subOptionModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col animate-scale-up">
            {/* Header Modal Sub-Opciones */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 sm:p-6 flex items-start justify-between relative shadow-md">
              <div className="space-y-1 pr-6">
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {currentSede.name}
                </span>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  Selecciona la Opción de tu {subOptionModalCategory.name}
                </h3>
                <p className="text-xs text-blue-100">
                  Escoge la cantidad de personas / aforo que necesitas:
                </p>
              </div>
              <button
                onClick={() => setSubOptionModalCategory(null)}
                type="button"
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Opciones disponibles */}
            <div className="p-6 space-y-4 bg-gray-50/50">
              {subOptionModalCategory.subOptions?.map((subOpt, idx) => {
                const isSelected = selectedSpaceId === subOpt.id;

                return (
                  <div
                    key={subOpt.id}
                    onClick={() => {
                      setSelectedSpaceId(subOpt.id);
                      setHorasSeleccionadas([]);
                      setSubOptionModalCategory(null);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-600"
                        : "bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                              isSelected
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            Opción {idx + 1}: {subOpt.capacityLabel}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-emerald-500 text-white"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}
                          >
                            {subOpt.count} espacios disponibles
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-amber-400 text-slate-900"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}
                          >
                            S/ {subOpt.pricePerHour || 15}.00 / hr
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base pt-1 leading-snug">
                          {subOpt.name}
                        </h4>
                        <p
                          className={`text-xs leading-relaxed ${
                            isSelected ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {subOpt.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white text-blue-700 hover:bg-blue-50"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                      }`}
                    >
                      {isSelected
                        ? "Opción Seleccionada ✓"
                        : `Elegir esta opción (${subOpt.capacityLabel})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fotos y Reseñas del Espacio */}
      {spaceModalCategory && (
        <SpaceDetailModal
          space={spaceModalCategory}
          sedeName={currentSede.name}
          sedeId={currentSede.id}
          isOpen={!!spaceModalCategory}
          onClose={() => setSpaceModalCategory(null)}
          onReserveSpace={(sId, spId) => {
            handleSelectSpaceCategory(spaceModalCategory);
          }}
        />
      )}
    </section>
  );
}
