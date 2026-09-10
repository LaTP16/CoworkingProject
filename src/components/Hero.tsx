import {
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  CreditCard,
} from "lucide-react";
import DexAssistant from "@/components/DexAssistant";

interface HeroProps {
  onVerSedes?: () => void;
  onSelectSede?: (sedeId: string) => void;
}

export default function Hero({ onVerSedes, onSelectSede }: HeroProps) {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Antetítulo */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Reserva flexible por horas o días</span>
        </div>

        {/* Título Principal (h1) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
          Tu espacio de trabajo ideal,{" "}
          <span className="text-blue-600">cuando lo necesites.</span>
        </h1>

        {/* Subtítulo (p) */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Reserva escritorios, salas de reuniones y oficinas privadas en las mejores ubicaciones de la ciudad.
        </p>

        {/* Botón único CTA: Ver sedes disponibles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
          <button
            onClick={onVerSedes}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Ver sedes disponibles</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* REEMPLAZO DE BENEFICIOS POR DEX RECOMENDADOR ABIERTO */}
        <div className="pt-4 max-w-xl mx-auto">
          <DexAssistant
            variant="inline"
            onSelectSede={onSelectSede}
            onNavigateToSedes={(sedeId) => {
              if (sedeId && onSelectSede) {
                onSelectSede(sedeId);
              } else if (onVerSedes) {
                onVerSedes();
              }
            }}
          />
        </div>

        {/* ========================================================
            SECCIÓN VISUAL EXPLICATIVA DEL PROCESO EN 3 PASOS
           ======================================================== */}
        <div className="pt-12 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-6">
            ¿Cómo funciona reservaYA?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Paso 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">
                1. Escoge tu sede
              </h3>
              <p className="text-xs text-gray-500">
                Selecciona la ubicación que mejor se adapte a ti y revisa su inventario.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">
                2. Reserva tu espacio
              </h3>
              <p className="text-xs text-gray-500">
                Elige el día, el tipo de oficina o sala y las horas que necesites.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">
                3. Paga y asiste
              </h3>
              <p className="text-xs text-gray-500">
                Paga vía Yape/Plin o en recepción y disfruta de tu jornada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
