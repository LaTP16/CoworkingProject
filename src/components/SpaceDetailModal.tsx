"use client";

import { useState } from "react";
import {
  X,
  Star,
  Camera,
  MessageSquare,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Sparkles,
} from "lucide-react";
import { SpaceCategory } from "@/data/sedesData";

interface SpaceDetailModalProps {
  space: SpaceCategory | null;
  sedeName: string;
  sedeId: string;
  isOpen: boolean;
  onClose: () => void;
  onReserveSpace?: (sedeId: string, spaceId: string) => void;
}

export default function SpaceDetailModal({
  space,
  sedeName,
  sedeId,
  isOpen,
  onClose,
  onReserveSpace,
}: SpaceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "reviews">("photos");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (!isOpen || !space) return null;

  const handleReserve = () => {
    onClose();
    if (onReserveSpace) {
      onReserveSpace(sedeId, space.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 sm:p-6 flex items-start justify-between relative shadow-md">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-200" />
                {sedeName}
              </span>
              <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {space.count} disponibles
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {space.name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-blue-100">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>{space.rating}</span>
              </div>
              <span>•</span>
              <span className="font-medium">
                {space.reviewsCount} opiniones verificadas
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bar de Pestañas (Fotos vs Reseñas) */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 pt-3">
          <button
            onClick={() => setActiveTab("photos")}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "photos"
                ? "border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Fotos del lugar ({space.images?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Reseñas y opiniones ({space.reviews?.length || 0})</span>
          </button>
        </div>

        {/* Contenido según pestaña activa */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
          {/* Pestaña 1: FOTOS DEL LUGAR */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              {/* Imagen Principal Grande */}
              <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                <img
                  src={
                    space.images?.[selectedImageIndex] ||
                    space.images?.[0] ||
                    "/images/sedes/parque-amistad.jpg"
                  }
                  alt={`Fotografía de ${space.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{space.description}</span>
                </div>
              </div>

              {/* Miniaturas de Fotos */}
              {space.images && space.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {space.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      type="button"
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        selectedImageIndex === idx
                          ? "border-blue-600 ring-2 ring-blue-600/30 scale-105"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Inclusiones y Servicios Destacados */}
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Servicios y comodidades incluidas:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-blue-600" />
                    <span>Wi-Fi 500 Mbps ultrarrápido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sillas ergonómicas ajustables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Estación de café y té libre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Enchufes y puertos USB por lugar</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña 2: RESEÑAS Y OPINIONES */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Tarjeta Resumen de Puntuación */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                    {space.rating}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      Excelente valoración general
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Basado en {space.reviewsCount} opiniones de usuarios reales
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-700 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>100% Verificado</span>
                </div>
              </div>

              {/* Lista de Reseñas */}
              <div className="space-y-3">
                {space.reviews?.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {rev.avatar}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 leading-tight">
                            {rev.author}
                          </h5>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-normal italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal con Acción Principal */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={handleReserve}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Reservar este espacio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
