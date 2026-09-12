"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  MapPin,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Coffee,
  ShieldCheck,
  CheckCircle2,
  Target,
  Users,
  Lock,
  User,
  Presentation,
} from "lucide-react";
import { SEDES_DATABASE, SpaceCategory, SedeInfo } from "@/data/sedesData";
import { classifyPromptIntent, SpaceTypeMatch } from "@/utils/spaceClassifier";
import SpaceDetailModal from "@/components/SpaceDetailModal";

interface HeroProps {
  onVerSedes?: () => void;
  onSelectSede?: (sedeId: string) => void;
}

const TYPEWRITER_PHRASES = [
  "Busco un lugar tranquilo para estudiar...",
  "Quiero reunirme con mi equipo...",
  "Necesito una oficina privada por un día...",
  "Busco una sala de reuniones con pantalla y café...",
];

const CAROUSEL_SEDES = [
  {
    slideId: "parque-amistad-main",
    id: "parque-amistad",
    name: "Sede Parque de la Amistad",
    tag: "Zona Verde & Silencioso",
    location: "Av. Caminos del Inca 2100, Surco",
    spacesCount: "54 escritorios • 6 privadas • 4 salas",
    rating: 4.9,
    bgGradient: "from-blue-600 via-blue-700 to-sky-500",
    image: "/images/sedes/parque-amistad-slide.jpg",
    features: ["Wi-Fi 500 Mbps", "Café Gourmet Libre", "Áreas Verdes"],
  },
  {
    slideId: "surco-pueblo-main",
    id: "surco-pueblo",
    name: "Sede Surco Pueblo",
    tag: "Céntrico & Dinámico",
    location: "Jr. Bolognesi 340, Surco Pueblo",
    spacesCount: "34 estaciones • 5 privadas • 4 reuniones",
    rating: 4.88,
    bgGradient: "from-indigo-600 via-blue-800 to-sky-400",
    image: "/images/sedes/surco-pueblo-slide.jpg",
    features: ["Pizarras Vidrio", "Videoconferencia 4K", "Aire Acondicionado"],
  },
  {
    slideId: "castilla-main",
    id: "castilla",
    name: "Sede Castilla",
    tag: "Tecnológico & Premium",
    location: "Av. Mariscal Castilla 850, Surco",
    spacesCount: "16 premium flex • 2 ejec. • Lounge Social",
    rating: 4.95,
    bgGradient: "from-sky-600 via-cyan-600 to-blue-700",
    image: "/images/sedes/castilla-slide.jpg",
    features: ["Vistas Panorámicas", "Estaciones Ergonomía A1", "Lounge Barista"],
  },
  {
    slideId: "parque-amistad-reuniones",
    id: "parque-amistad",
    name: "Sala de Reuniones Ejecutiva",
    tag: "Sala Disponible • Equipos 8-15 p.",
    location: "Disponible en Sede Parque de la Amistad & Surco Pueblo",
    spacesCount: "4 salas equipadas • Pantallas 4K • Pizarras de Vidrio",
    rating: 4.92,
    bgGradient: "from-blue-700 via-sky-600 to-indigo-700",
    image: "/images/spaces/trabajo.jpg",
    features: ["Pantalla Interactiva 4K", "Videoconferencia", "Café Gourmet Libre"],
  },
  {
    slideId: "parque-amistad-conferencias",
    id: "parque-amistad",
    name: "Sala de Conferencias & Auditorio",
    tag: "Sala Disponible • Aforo 40 p.",
    location: "Disponible en Sede Parque de la Amistad",
    spacesCount: "1 gran auditorio • Proyector HD • Podio Ejecutivo",
    rating: 4.98,
    bgGradient: "from-indigo-700 via-blue-800 to-sky-600",
    image: "/images/spaces/conferencias.jpg",
    features: ["Proyector HD & Podio", "Sistema de Sonido", "Wi-Fi 500 Mbps"],
  },
];

export default function Hero({ onVerSedes, onSelectSede }: HeroProps) {
  const [inputValue, setInputValue] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Estados para el panel de sugerencias y modal de reseñas
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{
    space: SpaceCategory;
    sede: SedeInfo;
  } | null>(null);

  // Estados para el Carrusel Horizontal Automático y Manual
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Animación Typewriter para el placeholder del input conversacional
  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];

    let typingSpeed = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2200;
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prevIndex) => (prevIndex + 1) % TYPEWRITER_PHRASES.length);
      return;
    }

    const timer = setTimeout(() => {
      setCharIndex((prevChar) => {
        if (!isDeleting && prevChar < currentPhrase.length) {
          return prevChar + 1;
        } else if (isDeleting && prevChar > 0) {
          return prevChar - 1;
        }
        return prevChar;
      });

      if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  // Avance Automático del Carrusel Horizontal
  useEffect(() => {
    if (isCarouselPaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % CAROUSEL_SEDES.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  const currentPlaceholder = TYPEWRITER_PHRASES[phraseIndex].substring(
    0,
    charIndex
  );

  const handleSearchSubmit = (textToSearch?: string) => {
    const promptText = textToSearch || inputValue || TYPEWRITER_PHRASES[phraseIndex];
    setActivePrompt(promptText);
    setShowSuggestions(true);

    setTimeout(() => {
      suggestionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSearchSubmit();
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === 0 ? CAROUSEL_SEDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % CAROUSEL_SEDES.length);
  };

  // Clasificación inteligente del prompt mediante el motor spaceClassifier
  const classificationResult = useMemo<SpaceTypeMatch | null>(() => {
    if (!activePrompt) return null;
    return classifyPromptIntent(activePrompt);
  }, [activePrompt]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white/50 flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* ========================================================
          1. FONDO "MESH GRADIENT" INMERSIVO (ESTILO LOVABLE)
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

      {/* ========================================================
          2. CAPA DE CONTENIDO CENTRAL (Z-INDEX 10)
         ======================================================== */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-auto flex flex-col items-center justify-center pt-4">
        
        {/* Título Principal (h1) */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4 md:mb-6">
          Encuentra tu espacio ideal
        </h1>

        {/* Subtítulo (p) */}
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed mb-8 md:mb-10">
          Crea, colabora y concéntrate en las mejores sedes de la ciudad.
        </p>

        {/* ========================================================
            3. CAJA DE INTERACCIÓN PRINCIPAL (DISEÑO BÁSICO EN BLANCO PURO)
           ======================================================== */}
        <div className="w-full max-w-2xl mx-auto mb-8 md:mb-10">
          <form
            onSubmit={handleSubmit}
            className={`relative flex items-center bg-white border ${
              isFocused
                ? "border-slate-400 ring-2 ring-slate-200"
                : "border-slate-200"
            } rounded-full p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-xl transition-all duration-300`}
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-slate-400 ml-3 md:ml-4 mr-2 shrink-0" />

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={inputValue ? "" : `${currentPlaceholder}|`}
              className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-base md:text-lg font-medium px-2 py-2"
            />

            <button
              type="submit"
              aria-label="Enviar búsqueda"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 shrink-0 ml-2 cursor-pointer"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 text-white transform -rotate-12 translate-x-[-1px]" />
            </button>
          </form>
        </div>

        {/* ========================================================
            PANEL DE RESULTADOS Y SUGERENCIAS RECOMENDADAS
           ======================================================== */}
        {showSuggestions && activePrompt && classificationResult && (
          <div
            ref={suggestionsRef}
            className="w-full max-w-4xl mx-auto mb-12 bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-sky-200 shadow-2xl text-left animate-fade-in space-y-6"
          >
            {/* Header del resultado con badge IA y botón cerrar */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Diagnóstico Inteligente de Espacio</span>
                </div>
                <p className="text-sm md:text-base text-slate-700 font-medium pt-1">
                  Analizando tu búsqueda: <span className="font-bold text-slate-900 italic">"{activePrompt}"</span>
                </p>
              </div>

              <button
                onClick={() => setShowSuggestions(false)}
                type="button"
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar sugerencias"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tarjeta destacada del Tipo de Espacio Recomendado */}
            <div className="bg-gradient-to-br from-blue-50/80 via-sky-50/50 to-indigo-50/70 border border-blue-100 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {classificationResult.badge}
                </span>

                <span className="text-xs font-extrabold text-blue-800 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  {classificationResult.confidence}% de afinidad con tu búsqueda
                </span>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {classificationResult.title}
                </h3>
                <p className="text-sm md:text-base text-slate-700 font-medium mt-1 leading-relaxed">
                  {classificationResult.detailedReason}
                </p>
              </div>

              {/* Atributos clave y palabras detectadas */}
              <div className="pt-3 border-t border-blue-100/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-slate-500 block">
                    Aforo y características recomendadas:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      👥 Aforo: {classificationResult.recommendedCapacity}
                    </span>
                    {classificationResult.highlightedFeatures.slice(0, 2).map((feat, idx) => (
                      <span key={idx} className="text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {classificationResult.matchedKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-500 block">
                      Términos detectados en tu búsqueda:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {classificationResult.matchedKeywords.map((kw, idx) => (
                        <span key={idx} className="font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Sedes que ofrecen este espacio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Ubicaciones disponibles para {classificationResult.title}:
                </h4>
                <span className="text-xs font-semibold text-slate-400">
                  {classificationResult.matchingSpaces.length} opciones encontradas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classificationResult.matchingSpaces.slice(0, 3).map(({ sede, space }) => {
                  const topReview = space.reviews?.[0];
                  return (
                    <div
                      key={`${sede.id}-${space.id}`}
                      className="bg-slate-50/80 hover:bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {sede.name}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{space.rating}</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                            {space.name}
                          </h5>
                          <span className="inline-block mt-0.5 text-[11px] font-extrabold text-blue-700">
                            S/ {space.pricePerHour || 15}.00 / hr
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {space.description}
                        </p>

                        {/* Comentario de reseña real */}
                        {topReview && (
                          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                            "{topReview.comment}"
                          </div>
                        )}
                      </div>

                      {/* Botones de acción: Fotos y Reservar */}
                      <div className="pt-2 space-y-1.5">
                        <button
                          onClick={() => setActiveModalData({ space, sede })}
                          type="button"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 hover:border-sky-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                          <span>Ver fotos y reseñas</span>
                        </button>

                        <button
                          onClick={() => onSelectSede?.(sede.id)}
                          type="button"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <span>Reservar en {sede.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer con opción de explorar todas las sedes */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
              <button
                onClick={() => {
                  setInputValue("");
                  setShowSuggestions(false);
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nueva búsqueda</span>
              </button>

              <button
                onClick={onVerSedes}
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
              >
                <span>Ver catálogo completo de sedes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            4. BOTÓN SECUNDARIO (EXPLORACIÓN MANUAL)
           ======================================================== */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-5">
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            O si prefieres explorar:
          </p>

          <button
            onClick={onVerSedes}
            type="button"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm md:text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer gap-2 group"
          >
            <span>Ver sedes disponibles</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Banner promocional — Descuento vecinos surcanos en recuadro ovalado dorado claro */}
        <div className="w-full max-w-3xl mx-auto mb-10 px-4 flex justify-center">
          <div
            style={{
              background: "linear-gradient(90deg, #e5b95c 0%, #f7d98c 22%, #fff9d4 50%, #f7d98c 78%, #e5b95c 100%)",
            }}
            className="border-2 border-[#dfb04e] rounded-full px-6 py-3 sm:px-8 sm:py-3.5 shadow-md flex items-center justify-center gap-3 text-[#382407]"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/10 text-[#382407] shrink-0 font-bold">
              <Sparkles className="w-4 h-4 fill-[#7e5513] text-[#382407]" />
            </span>
            <p className="text-xs sm:text-sm md:text-base font-semibold leading-snug text-center text-[#382407]">
              Si eres un <span className="font-extrabold underline decoration-[#7e5513] underline-offset-2">vecino surcano</span> obtienes un{" "}
              <span className="font-extrabold bg-white/90 text-[#382407] px-2.5 py-0.5 rounded-full border border-[#dfb04e]/60 shadow-xs">50% de descuento</span> en todas tus reservas.
            </p>
          </div>
        </div>

        {/* ========================================================
            5. GUÍA BÁSICA EN 3 PASOS ("CÓMO FUNCIONA")
           ======================================================== */}
        <div className="w-full max-w-4xl mx-auto pt-8 border-t border-slate-200/60 mb-14">
          <p className="text-xs font-extrabold uppercase tracking-wider text-sky-600 mb-6 text-center">
            ¿Cómo funciona EspaciApp?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Tarjeta 1: Escoge tu sede */}
            <div 
              onClick={onVerSedes}
              className="group bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                1. Escoge tu sede
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Selecciona la ubicación que mejor se adapte a ti e inspecciona sus espacios.
              </p>
            </div>

            {/* Tarjeta 2: Reserva el lugar */}
            <div 
              onClick={onVerSedes}
              className="group bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:bg-sky-400 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                2. Reserva el lugar
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Elige el día, el tipo de oficina o sala y las horas que necesites.
              </p>
            </div>

            {/* Tarjeta 3: Paga y trabaja */}
            <div 
              onClick={onVerSedes}
              className="group bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                3. Paga y trabaja
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Paga de forma rápida en línea o en recepción y disfruta de tu jornada.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. SECCIÓN CARRUSEL HORIZONTAL AUTOMÁTICO & MANUAL
               (EXPLORAR LUGARES DE COWORKING DE ESPACIAPP)
           ======================================================== */}
        <div 
          className="w-full max-w-4xl mx-auto pt-8 border-t border-slate-200/60"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          {/* Header del carrusel con Controles Manuales */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-block mb-2">
                Galería de Sedes & Espacios
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Conoce nuestras ubicaciones de Coworking
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pase automático continuo o navega manualmente con las flechas.
              </p>
            </div>

            {/* Botones Manuales Izquierda / Derecha */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevSlide}
                type="button"
                aria-label="Sede anterior"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                type="button"
                aria-label="Siguiente sede"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carrusel Desplazable Horizontalmente */}
          <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl bg-white">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
            >
              {CAROUSEL_SEDES.map((item) => (
                <div
                  key={item.slideId}
                  className="w-full flex-shrink-0 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-left"
                >
                  {/* Tarjeta Visual de Presentación con imagen y armonía de texto */}
                  <div
                    className="w-full md:w-1/2 h-56 md:h-64 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden group"
                  >
                    {/* Imagen de Fondo de la Sede */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Capa de degradado elegante para armonizar y resaltar perfectamente el texto blanco */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-950/40" />

                    {/* Elementos con su forma y orden exacto */}
                    <div className="relative z-10 flex justify-end">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/30 flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-sky-100 block pt-2 uppercase tracking-wider drop-shadow-xs">
                        {item.tag}
                      </span>
                      <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                        {item.name}
                      </h3>
                    </div>

                    <div className="text-xs text-white/90 font-medium flex items-center gap-1.5 pt-2 relative z-10 drop-shadow-xs">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-200" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  {/* Detalles del Espacio y Servicios */}
                  <div className="w-full md:w-1/2 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Inventario disponible</span>
                      </div>

                      <h4 className="text-lg font-extrabold text-slate-900">
                        {item.name}
                      </h4>

                      <p className="text-xs md:text-sm text-slate-600 font-medium">
                        {item.spacesCount}
                      </p>
                    </div>

                    {/* Tags de características */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Comodidades destacadas:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Botón Acción directo a esta sede */}
                    <div className="pt-2">
                      <button
                        onClick={() => onSelectSede?.(item.id)}
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs md:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>Explorar y reservar en esta sede</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de Puntos (Dots) para control directo */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {CAROUSEL_SEDES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlideIndex(dotIdx)}
                type="button"
                aria-label={`Ir a la diapositiva ${dotIdx + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === dotIdx
                    ? "w-8 bg-sky-500"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Modal de Fotografías y Reseñas de los espacios recomendados */}
      {activeModalData && (
        <SpaceDetailModal
          space={activeModalData.space}
          sedeName={activeModalData.sede.name}
          sedeId={activeModalData.sede.id}
          isOpen={!!activeModalData}
          onClose={() => setActiveModalData(null)}
          onReserveSpace={(sedeId) => {
            setActiveModalData(null);
            if (onSelectSede) {
              onSelectSede(sedeId);
            }
          }}
        />
      )}
    </section>
  );
}
