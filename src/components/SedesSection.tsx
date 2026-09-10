"use client";

import { useState } from "react";
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  User,
  Lock,
  Users,
  Presentation,
  Coffee,
  Briefcase,
  Layers,
  Star,
  Camera,
} from "lucide-react";
import { SEDES_DATABASE, SpaceCategory, SedeInfo } from "@/data/sedesData";
import SpaceDetailModal from "@/components/SpaceDetailModal";

interface SedesSectionProps {
  onSelectSede?: (sedeId: string) => void;
  onBack?: () => void;
}

const renderIcon = (iconName: SpaceCategory["iconName"]) => {
  switch (iconName) {
    case "user":
      return <User className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "lock":
      return <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "users":
      return <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "presentation":
      return <Presentation className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "coffee":
      return <Coffee className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "briefcase":
      return <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    default:
      return <User className="w-4 h-4 text-blue-600 flex-shrink-0" />;
  }
};

export default function SedesSection({
  onSelectSede,
  onBack,
}: SedesSectionProps) {
  const sedesList = Object.values(SEDES_DATABASE);

  // Estado para controlar el modal de fotos y reseñas
  const [activeModalData, setActiveModalData] = useState<{
    space: SpaceCategory;
    sede: SedeInfo;
  } | null>(null);

  const handleOpenSpaceModal = (space: SpaceCategory, sede: SedeInfo) => {
    setActiveModalData({ space, sede });
  };

  const handleCloseSpaceModal = () => {
    setActiveModalData(null);
  };

  return (
    <section id="sedes" className="py-16 sm:py-24 bg-gray-50/60 min-h-[70vh] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de Volver al Inicio */}
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Volver al inicio</span>
            </button>
          </div>
        )}

        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Nuestras Sedes
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Encuentra la ubicación perfecta y revisa las fotos y reseñas de cada espacio disponible.
          </p>
        </div>

        {/* Cuadrícula de sedes (Grid: 1 col móvil, 3 cols escritorio) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sedesList.map((sede) => (
            <div
              key={sede.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Imagen Real de la Sede */}
              <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                <img
                  src={sede.image}
                  alt={sede.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md border border-white/50">
                  {sede.tag}
                </span>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {sede.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {sede.description}
                  </p>

                  {/* Listado dinámico de espacios con opción de FOTOS y RESEÑAS */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Espacios disponibles & Valoraciones:
                    </span>
                    <ul className="space-y-2.5">
                      {sede.spaces.map((sp) => (
                        <li
                          key={sp.id}
                          className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {renderIcon(sp.iconName)}
                              <span className="font-bold text-xs text-gray-800">
                                {sp.name}
                              </span>
                            </div>
                            <span className="font-extrabold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              {sp.count} disps.
                            </span>
                          </div>

                          {/* Fila con Rating y Botón Ver Fotos & Reseñas */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{sp.rating}</span>
                              <span className="text-gray-400 font-normal">
                                ({sp.reviewsCount})
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenSpaceModal(sp, sede)}
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Camera className="w-3 h-3 text-blue-600" />
                              <span>Ver fotos & reseñas</span>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón inferior: Reservar espacio */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectSede?.(sede.id)}
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    <span>Reservar espacio</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalle de Fotos y Reseñas */}
      {activeModalData && (
        <SpaceDetailModal
          space={activeModalData.space}
          sedeName={activeModalData.sede.name}
          sedeId={activeModalData.sede.id}
          isOpen={!!activeModalData}
          onClose={handleCloseSpaceModal}
          onReserveSpace={(sedeId) => {
            onSelectSede?.(sedeId);
          }}
        />
      )}
    </section>
  );
}
