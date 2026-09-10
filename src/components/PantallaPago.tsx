"use client";

import { useState, useId, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Upload,
  Building,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Copy,
  Check,
} from "lucide-react";
import { SEDES_DATABASE } from "@/data/sedesData";

interface PantallaPagoProps {
  sedeId: string;
  day: number | null;
  spaceId: string | null;
  selectedHoursCount: number;
  selectedHourLabels: string[];
  onBack: () => void;
}

const STORAGE_KEY = "coworking-pago-state";

export default function PantallaPago({
  sedeId,
  day,
  spaceId,
  selectedHoursCount,
  selectedHourLabels,
  onBack,
}: PantallaPagoProps) {
  const currentSede = SEDES_DATABASE[sedeId] || SEDES_DATABASE["parque-amistad"];
  const activeSpaceCategory = currentSede.spaces.find((s) => s.id === spaceId);

  const getStoredPagoState = () => {
    if (typeof window === "undefined") {
      return { paymentMethod: "yape" as const, isCompleted: false };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { paymentMethod: "yape", isCompleted: false };
    } catch {
      return { paymentMethod: "yape" as const, isCompleted: false };
    }
  };

  // Método de pago activo: 'yape' | 'presencial'
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "presencial">(() => getStoredPagoState().paymentMethod);

  // Estado de archivo de comprobante subido
  const [voucherFile, setVoucherFile] = useState<File | null>(null);

  // Estado de copia de código de operación
  const [copiedCode, setCopiedCode] = useState(false);

  // Estado de pago completado exitosamente
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getStoredPagoState().isCompleted);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ paymentMethod, isCompleted })
      );
    } catch {
      // Ignorar si no se puede guardar en localStorage
    }
  }, [paymentMethod, isCompleted]);

  const fileInputId = useId();

  // Código de operación aleatorio para pago presencial
  const operationCode = useMemo(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#RYA-${randomNum}`;
  }, []);

  const pricePerHour = 15; // $15 por hora
  const totalPrice = selectedHoursCount * pricePerHour;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVoucherFile(e.target.files[0]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(operationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleted(true);
  };

  return (
    <section className="py-10 sm:py-16 bg-gray-50/80 min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de Volver a Reserva */}
        <div className="mb-6">
          <button
            onClick={onBack}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Volver al paso de Reserva</span>
          </button>
        </div>

        {/* Modal / Pantalla de Confirmación Exitosa */}
        {isCompleted ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              ¡Reserva y Pago Registrados!
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Hemos enviado los detalles de tu confirmación a tu correo. Presenta tu
              código de operación en recepción al ingresar.
            </p>

            {/* Ficha Resumen */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 text-left mb-8 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Código de Operación:</span>
                <span className="font-extrabold text-blue-600">{operationCode}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Sede:</span>
                <span className="font-bold text-gray-800">{currentSede.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Fecha:</span>
                <span className="font-bold text-gray-800">Septiembre {day}, 2026</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Espacio:</span>
                <span className="font-bold text-gray-800">{activeSpaceCategory?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Horas contratadas:</span>
                <span className="font-bold text-gray-800">{selectedHoursCount} hr(s)</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-base text-gray-900">
                <span>Total abonado:</span>
                <span className="text-emerald-600">${totalPrice}.00</span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Volver al Inicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Resumen de Cuenta */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Resumen de la cuenta
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {currentSede.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Confirmación inmediata
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Fecha elegida:</span>
                  <span className="font-bold text-gray-900">Sept. {day}, 2026</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Tipo de espacio:</span>
                  <span className="font-bold text-gray-900">{activeSpaceCategory?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Horas seleccionadas:</span>
                  <span className="font-bold text-blue-600">{selectedHoursCount} hr(s)</span>
                </div>

                <div className="pt-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700 block mb-1">Bloques elegidos:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedHourLabels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className="bg-white border text-gray-700 px-2 py-0.5 rounded-md font-medium text-[11px]"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-base font-extrabold">
                  <span className="text-gray-900">Monto Total:</span>
                  <span className="text-2xl text-blue-600">${totalPrice}.00</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Selección y Detalles del Método de Pago */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                Selecciona tu Método de Pago
              </h3>

              {/* Selector de Método */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("yape")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "yape"
                      ? "bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">Yape / Plin</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-normal">
                    Pago digital inmediato
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("presencial")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "presencial"
                      ? "bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Pago en Caja</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-normal">
                    Con Código en Recepción
                  </span>
                </button>
              </div>

              {/* OPCIÓN 1: YAPE / PLIN */}
              {paymentMethod === "yape" && (
                <form onSubmit={handleFinish} className="space-y-5 animate-fade-in">
                  <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-32 h-32 bg-white border-2 border-purple-200 rounded-xl mx-auto flex items-center justify-center shadow-inner relative group">
                      <QrCode className="w-24 h-24 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-900">
                        Escanea y Yapea / Plinea el monto exacto de:
                      </p>
                      <p className="text-2xl font-black text-purple-700">
                        ${totalPrice}.00
                      </p>
                    </div>
                  </div>

                  {/* Campo de Carga de Comprobante */}
                  <div>
                    <label
                      htmlFor={fileInputId}
                      className="block text-xs font-bold text-gray-700 mb-2"
                    >
                      Adjuntar Comprobante de Pago (Voucher):
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors bg-gray-50/50">
                      <input
                        id={fileInputId}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                        {voucherFile ? (
                          <>
                            <FileCheck className="w-7 h-7 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 line-clamp-1">
                              {voucherFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-medium">
                              ¡Voucher cargado correctamente!
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600">
                              Haz clic o arrastra tu captura de pago aquí
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Formatos permitidos: JPG, PNG, PDF (Máx. 5MB)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!voucherFile}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      voucherFile
                        ? "bg-purple-600 hover:bg-purple-700 text-white hover:scale-[1.01]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Confirmar y Enviar Reserva</span>
                  </button>
                </form>
              )}

              {/* OPCIÓN 2: PAGO EN CAJA PRESENCIAL */}
              {paymentMethod === "presencial" && (
                <form onSubmit={handleFinish} className="space-y-5 animate-fade-in">
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3 text-center">
                    <span className="text-xs font-semibold text-blue-700 block">
                      Tu Código de Operación para la Caja:
                    </span>
                    <div className="inline-flex items-center gap-3 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-2xl font-black text-blue-600 tracking-wider">
                        {operationCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedCode ? (
                          <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Muestra este código al llegar a la recepción de la sede para realizar el pago y acceder a tu espacio.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      DNI / Documento de Identidad del Titular:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ingresa tu DNI o CE..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Generar Reserva y Obtener Pase</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
