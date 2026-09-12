"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MapPin,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { SEDES_DATABASE, SedeInfo, SpaceCategory } from "@/data/sedesData";

export interface DexMessage {
  id: string;
  sender: "dex" | "user";
  text: string;
  recommendedSedeId?: string | null;
  recommendedSpaceId?: string | null;
  canAutoReserve?: boolean;
}

interface DexAssistantProps {
  onSelectSede?: (sedeId: string) => void;
  onNavigateToSedes?: (sedeId?: string) => void;
  onReserveFromDex?: (sedeId: string, spaceId?: string) => void;
}

const QUICK_SUGGESTIONS = [
  "Espacio silencioso para estudiar",
  "Oficina privada para llamadas",
  "Sala para reunirme con mi equipo",
  "¿Qué beneficios tienen vecinos de Surco?",
];

export default function DexAssistant({
  onSelectSede,
  onNavigateToSedes,
  onReserveFromDex,
}: DexAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<DexMessage[]>([
    {
      id: "msg-welcome",
      sender: "dex",
      text: "¡Hola! Soy Dex, tu asesor de coworking con IA. Cuéntame qué necesitas (¿estudias solo, vienes con equipo o requieres privacidad?) y te recomendaré el espacio y sede exactos.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: DexMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/dex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const dexReply: DexMessage = {
          id: `dex-${Date.now()}`,
          sender: "dex",
          text: data.reply || "He analizado tu consulta.",
          recommendedSedeId: data.recommendedSedeId,
          recommendedSpaceId: data.recommendedSpaceId,
          canAutoReserve: data.canAutoReserve,
        };
        setMessages((prev) => [...prev, dexReply]);
      } else {
        throw new Error("Respuesta no exitosa");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `dex-err-${Date.now()}`,
          sender: "dex",
          text: "Te sugiero explorar nuestras opciones en Parque de la Amistad o Surco Pueblo. ¿Te gustaría ver las sedes?",
          recommendedSedeId: "parque-amistad",
          recommendedSpaceId: "individuales",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "msg-welcome-reset",
        sender: "dex",
        text: "¡Conversación reiniciada! Dime qué buscas hoy y te guiaré con gusto.",
      },
    ]);
  };

  const handleExecuteReservation = (sedeId: string, spaceId?: string) => {
    if (onReserveFromDex) {
      onReserveFromDex(sedeId, spaceId);
    } else if (onSelectSede) {
      onSelectSede(sedeId);
    } else if (onNavigateToSedes) {
      onNavigateToSedes(sedeId);
    }
    setIsOpen(false);
  };

  // Obtener información visual de la sede recomendada
  const getSedeInfo = (sedeId?: string | null): SedeInfo | null => {
    if (!sedeId) return null;
    return SEDES_DATABASE[sedeId] || null;
  };

  const getSpaceInfo = (
    sede: SedeInfo | null,
    spaceId?: string | null
  ): SpaceCategory | null => {
    if (!sede || !spaceId) return null;
    return (
      sede.spaces.find((s) => s.id === spaceId || s.id.includes(spaceId)) ||
      sede.spaces[0]
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Botón flotante para abrir Dex */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label="Abrir asistente Dex"
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white animate-bounce-subtle" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <span className="text-xs font-black tracking-wide block leading-none">
              DEX IA
            </span>
            <span className="text-[11px] text-blue-100 font-medium leading-tight">
              ¿Te ayudo a reservar?
            </span>
          </div>
        </button>
      )}

      {/* Ventana de Chat Dex Modernizada */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-fade-in">
          {/* Header estilizado */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 text-white px-5 py-4 flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">Dex Asesor</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-400/25 border border-emerald-300/40 text-emerald-100 px-2 py-0.2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    IA Activa
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 font-medium">
                  EspaciApp Surco
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={handleResetChat}
                type="button"
                title="Reiniciar chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                type="button"
                title="Cerrar"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
            {messages.map((msg) => {
              const isDex = msg.sender === "dex";
              const sede = getSedeInfo(msg.recommendedSedeId);
              const space = getSpaceInfo(sede, msg.recommendedSpaceId);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isDex ? "items-start" : "items-end"
                  }`}
                >
                  {/* Burbuja de Texto */}
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs text-xs sm:text-[13px] ${
                      isDex
                        ? "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                        : "bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium rounded-tr-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1.5">
                      {msg.text.split("\n\n").map((paragraph, pIdx) => {
                        // Renderizar negritas simples **texto**
                        const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={pIdx}>
                            {parts.map((part, idx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                  <strong key={idx} className="font-bold text-slate-900">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tarjeta de Recomendación y Reserva Guiada */}
                  {isDex && sede && space && (
                    <div className="mt-2.5 w-[92%] bg-white rounded-2xl border border-sky-200/80 p-3.5 shadow-sm space-y-2.5 animate-fade-in">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 inline-flex mb-1">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            Elección recomendada
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {space.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{sede.name}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-black text-slate-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                          S/ {space.pricePerHour || 15}.00/hr
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {space.description}
                      </p>

                      {/* Botón directo para que Dex reserve por el usuario */}
                      <button
                        onClick={() =>
                          handleExecuteReservation(sede.id, space.id)
                        }
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs hover:shadow cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Reservar este espacio ahora</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicador de que Dex está razonando */}
            {isLoading && (
              <div className="flex items-center gap-2 bg-white text-slate-500 px-3.5 py-2.5 rounded-2xl border border-slate-200/80 w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="text-[11px] font-medium text-slate-600">
                  Dex está analizando y razonando tu mejor opción...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas o Sugerencias Rápidas (Chips cómodos y armónicos) */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0">
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug)}
                type="button"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-semibold border border-slate-200/60 transition-colors cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Formulario de Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe lo que necesitas (ej: somos 4 personas)..."
              className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs px-3.5 py-2.5 rounded-2xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Enviar a Dex"
              className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
