"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  HelpCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  Coffee,
  Compass,
} from "lucide-react";

export interface Message {
  id: string;
  sender: "dex" | "user";
  text: string;
  actionSedeId?: string;
  actionSedeName?: string;
}

export interface FAQItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export interface IntentOption {
  id: string;
  label: string;
  description: string;
  responseText: string;
  sedeId?: string;
  sedeName?: string;
  icon: "study" | "team" | "social" | "faq";
}

// Preguntas y Respuestas Frecuentes Reales
const faqData: FAQItem[] = [
  {
    id: "horarios",
    topic: "Disponibilidad y Horarios",
    question: "¿Cuáles son los horarios de atención de las sedes?",
    answer:
      "Nuestras sedes atienden de Lunes a Domingo de 08:00 a 22:00 hrs. Los días feriados atendemos en un horario especial de 09:00 a 18:00 hrs.",
  },
  {
    id: "tarifas",
    topic: "Tarifas y Descuentos",
    question: "¿Cuáles son las tarifas y hay descuento para vecinos de Surco?",
    answer:
      "Nuestras tarifas van desde S/ 8.00/hr para escritorios individuales. ¡Sí! Si eres vecino de Surco, obtienes un 50% de descuento automático en tu reserva.",
  },
  {
    id: "proceso",
    topic: "Proceso de Reserva",
    question: "¿Cómo es el proceso de reserva y cómo sé que está confirmada?",
    answer:
      "¡Es súper fácil! Escoges la sede, seleccionas el día, espacio y tus horas. Al subir tu voucher de Yape/Plin o elegir pago en caja, recibirás un Código de Operación (#RYA-XXXX) que confirma tu cupo al instante.",
  },
  {
    id: "capacidades",
    topic: "Capacidades",
    question: "¿Cuál es la capacidad máxima de las salas y espacios privados?",
    answer:
      "Los espacios privados son para 2 a 4 personas, las salas de trabajo albergan de 6 a 8 personas y nuestra Sala de Conferencias (en Parque de la Amistad) tiene capacidad para hasta 40 personas.",
  },
  {
    id: "servicios",
    topic: "Servicios Incluidos",
    question: "¿Qué servicios están incluidos al alquilar un espacio?",
    answer:
      "Todas las reservas incluyen Wi-Fi de alta velocidad (500 Mbps), acceso a la estación de café/té ilimitado, aire acondicionado, enchufes ergonómicos e impresiones básicas sin costo.",
  },
  {
    id: "reprogramacion",
    topic: "Reprogramación / Cancelación",
    question: "¿Puedo reprogramar o cancelar mi reserva si surge un imprevisto?",
    answer:
      "¡Por supuesto! Puedes reprogramar o cancelar tu reserva sin costo alguno hasta 2 horas antes de la hora de inicio comunicándote por WhatsApp o desde tu panel.",
  },
  {
    id: "ubicaciones",
    topic: "Ubicaciones y Contacto",
    question: "¿Dónde están ubicadas las sedes y cuáles son los canales de atención?",
    answer:
      "Contamos con sedes en Parque de la Amistad, Surco Pueblo y Castilla. Puedes contactarnos por WhatsApp al +51 987 654 321 o al correo soporte@espaciapp.pe.",
  },
];

// Opciones de intención de uso iniciales
const intentOptions: IntentOption[] = [
  {
    id: "opcion-1",
    label: "Estudiar y concentrarme en silencio",
    description: "Espacios individuales y tranquilos",
    responseText:
      "¡Entendido! Para máxima concentración, te recomiendo los Espacios Individuales en el Parque de la Amistad, ya que está rodeado de áreas verdes y mucha tranquilidad.",
    sedeId: "parque-amistad",
    sedeName: "Parque de la Amistad",
    icon: "study",
  },
  {
    id: "opcion-2",
    label: "Reunirme a trabajar con mi equipo",
    description: "Salas de trabajo y reuniones",
    responseText:
      "¡Genial! Para dinamismo y trabajo en equipo, las Salas de Trabajo o Reuniones en Surco Pueblo son perfectas y muy céntricas.",
    sedeId: "surco-pueblo",
    sedeName: "Surco Pueblo",
    icon: "team",
  },
  {
    id: "opcion-3",
    label: "Compartir y socializar con amigos",
    description: "Zona social y relax",
    responseText:
      "¡Excelente plan! Te sugiero la Zona Social de nuestra sede Castilla, diseñada específicamente para relajarse y conversar cómodamente.",
    sedeId: "castilla",
    sedeName: "Castilla",
    icon: "social",
  },
  {
    id: "opcion-4",
    label: "Tengo otra duda (Preguntas Frecuentes)",
    description: "Consultas de horarios, tarifas y procesos",
    responseText:
      "¡Por supuesto! Aquí tienes nuestro menú de Preguntas Frecuentes. Selecciona una consulta o escribe tu duda.",
    icon: "faq",
  },
];

interface DexAssistantProps {
  onSelectSede?: (sedeId: string) => void;
  onNavigateToSedes?: (sedeId?: string) => void;
  variant?: "floating" | "inline";
}

export default function DexAssistant({
  onSelectSede,
  onNavigateToSedes,
  variant = "floating",
}: DexAssistantProps) {
  const isInline = variant === "inline";
  // 1. Estado abierto por defecto al cargar la página
  const [isOpen, setIsOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Paso del flujo conversacional: 'intents' | 'recommendation' | 'faqs'
  const [chatStep, setChatStep] = useState<"intents" | "recommendation" | "faqs">(
    "intents"
  );
  const [lastRecommendedSedeId, setLastRecommendedSedeId] = useState<
    string | undefined
  >(undefined);

  // Mensaje inicial de Dex
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "dex",
      text: "¡Hola! Soy Dex. ¿Qué tipo de ambiente buscas hoy? Te ayudaré a encontrar tu espacio ideal.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, chatStep]);

  // Manejador para acción "Ver esta sede"
  const handleVerSede = (sedeId?: string) => {
    if (!isInline) {
      setIsOpen(false);
    }
    if (onNavigateToSedes) {
      onNavigateToSedes(sedeId);
    } else if (onSelectSede && sedeId) {
      onSelectSede(sedeId);
    } else {
      const element = document.getElementById("sedes");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Manejador al hacer clic en una Intención de Uso (Opciones 1, 2, 3 o 4)
  const handleSelectIntent = (option: IntentOption) => {
    if (isTyping) return;

    // 1. Agregar mensaje del usuario inmediatamente
    const userMsg: Message = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: option.label,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Simulación de tipeo (500ms)
    setTimeout(() => {
      const dexMsg: Message = {
        id: Date.now().toString() + "-dex",
        sender: "dex",
        text: option.responseText,
        actionSedeId: option.sedeId,
        actionSedeName: option.sedeName,
      };

      setMessages((prev) => [...prev, dexMsg]);
      setIsTyping(false);

      if (option.id === "opcion-4") {
        setChatStep("faqs");
      } else {
        setChatStep("recommendation");
        setLastRecommendedSedeId(option.sedeId);
      }
    }, 500);
  };

  // Manejador al hacer clic en una pregunta frecuente (FAQ)
  const handleSelectFAQ = (faq: FAQItem) => {
    if (isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: faq.question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const dexMsg: Message = {
        id: Date.now().toString() + "-dex",
        sender: "dex",
        text: faq.answer,
      };

      setMessages((prev) => [...prev, dexMsg]);
      setIsTyping(false);
    }, 500);
  };

  // Manejador de envío por input manual
  const handleSendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue("");

    const userMsg: Message = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const matchedFaq = faqData.find(
      (f) =>
        f.question.toLowerCase().includes(userText.toLowerCase()) ||
        f.topic.toLowerCase().includes(userText.toLowerCase())
    );

    const responseText = matchedFaq
      ? matchedFaq.answer
      : `Gracias por tu consulta sobre "${userText}". Nuestro equipo estará encantado de atenderte. ¿Deseas explorar alguna otra recomendación u otra duda?`;

    setTimeout(() => {
      const dexMsg: Message = {
        id: Date.now().toString() + "-dex",
        sender: "dex",
        text: responseText,
      };

      setMessages((prev) => [...prev, dexMsg]);
      setIsTyping(false);
    }, 500);
  };

  // Resetear conversación al estado inicial de intenciones
  const handleResetMenu = () => {
    setChatStep("intents");
    setLastRecommendedSedeId(undefined);
    setMessages([
      {
        id: Date.now().toString(),
        sender: "dex",
        text: "¡Hola! Soy Dex. ¿Qué tipo de ambiente buscas hoy? Te ayudaré a encontrar tu espacio ideal.",
      },
    ]);
  };

  // Renderizar ícono correspondiente para las intenciones
  const renderIntentIcon = (icon: IntentOption["icon"]) => {
    switch (icon) {
      case "study":
        return <BookOpen className="w-4 h-4 text-blue-600 group-hover:text-white flex-shrink-0" />;
      case "team":
        return <Users className="w-4 h-4 text-blue-600 group-hover:text-white flex-shrink-0" />;
      case "social":
        return <Coffee className="w-4 h-4 text-blue-600 group-hover:text-white flex-shrink-0" />;
      case "faq":
        return <HelpCircle className="w-4 h-4 text-blue-600 group-hover:text-white flex-shrink-0" />;
      default:
        return <Compass className="w-4 h-4 text-blue-600 group-hover:text-white flex-shrink-0" />;
    }
  };

  const containerClasses = isInline
    ? "w-full max-w-2xl mx-auto font-sans text-left my-2"
    : "fixed bottom-6 right-6 z-50 font-sans";

  const cardClasses = isInline
    ? "w-full bg-white border border-blue-200 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[520px] transition-all animate-fade-in"
    : "w-80 sm:w-96 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden mb-4 flex flex-col h-[530px] transition-all animate-fade-in";

  return (
    <div className={containerClasses}>
      {/* Ventana Emergente / Tarjeta de Chat */}
      {(isOpen || isInline) && (
        <div className={cardClasses}>
          {/* Header del Chat */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Dex <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-xs text-blue-100 font-medium">
                  Recomendador & Asistente Virtual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetMenu}
                title="Reiniciar recomendaciones"
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Reiniciar menú"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {!isInline && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Cerrar chat"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Cuerpo con Burbujas de Conversación */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm flex flex-col gap-2.5 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none font-medium"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div>{msg.text}</div>

                  {/* Botón de Acción Rápida "Ver esta sede" dentro del chat */}
                  {msg.sender === "dex" && msg.actionSedeId && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleVerSede(msg.actionSedeId)}
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
                        <span>Ver esta sede</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-white/80 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Animación de Escribiendo (Typing indicator) */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-gray-400 font-medium">
                    Dex está escribiendo...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* PANEL INTERACTIVO DE NAVEGACIÓN Y OPCIONES */}

          {/* 1. Modo Intenciones de Uso (Opciones 1, 2, 3 y 4) */}
          {chatStep === "intents" && (
            <div className="p-3 bg-white border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-600" /> Elige tu intención de uso:
              </p>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {intentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectIntent(option)}
                    disabled={isTyping}
                    className="text-xs bg-blue-50/70 hover:bg-blue-600 text-blue-900 hover:text-white px-3 py-2.5 rounded-xl font-medium transition-all border border-blue-100 text-left flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      {renderIntentIcon(option.icon)}
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 group-hover:text-white flex-shrink-0 ml-1.5 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Modo Recomendación dada (Boton de acción directa + cambiar intención) */}
          {chatStep === "recommendation" && !isTyping && (
            <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
              {lastRecommendedSedeId && (
                <button
                  onClick={() => handleVerSede(lastRecommendedSedeId)}
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Ver esta sede</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setChatStep("intents")}
                  type="button"
                  className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-2.5 rounded-xl font-medium text-center transition-colors border border-gray-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Otras opciones</span>
                </button>
                <button
                  onClick={() => setChatStep("faqs")}
                  type="button"
                  className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-2.5 rounded-xl font-medium text-center transition-colors border border-blue-100 cursor-pointer flex items-center justify-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preguntas Frecuentes</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Modo FAQs (Lista scrollable + buscador) */}
          {chatStep === "faqs" && (
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Consultas frecuentes:
                </p>
                <button
                  onClick={() => setChatStep("intents")}
                  type="button"
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3 h-3" /> Ver recomendador
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1 text-left">
                {faqData.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSelectFAQ(faq)}
                    disabled={isTyping}
                    className="text-xs bg-blue-50/80 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl font-medium transition-colors border border-blue-100 text-left flex items-center justify-between group cursor-pointer disabled:opacity-50"
                  >
                    <span className="line-clamp-1">{faq.question}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 group-hover:text-white flex-shrink-0 ml-1 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de Input Manual (Para consultas abiertas) */}
          <form
            onSubmit={handleSendInput}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-grow text-xs sm:text-sm px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Botón Circular Flotante (Solo para variant floating cuando está cerrado) */}
      {!isInline && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative cursor-pointer ring-4 ring-blue-600/20"
          aria-label="Abrir asistente virtual Dex"
        >
          <Bot className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>

          <span className="absolute right-16 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            ¿Dudas? Habla con Dex 🤖
          </span>
        </button>
      )}
    </div>
  );
}
