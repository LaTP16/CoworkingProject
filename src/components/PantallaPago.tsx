"use client";

import { useState, useId, useEffect } from "react";
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
  User,
  Phone,
  Mail,
  CreditCard,
  Hash,
} from "lucide-react";
import { SEDES_DATABASE, findSpaceById } from "@/data/sedesData";
import { ClientData } from "@/components/FormularioDatos";

interface PantallaPagoProps {
  sedeId: string;
  day: number | null;
  spaceId: string | null;
  selectedHoursCount: number;
  selectedHourLabels: string[];
  clientData?: ClientData | null;
  onBack: () => void;
}

const STORAGE_KEY = "coworking-pago-state";

export default function PantallaPago({
  sedeId,
  day,
  spaceId,
  selectedHoursCount,
  selectedHourLabels,
  clientData,
  onBack,
}: PantallaPagoProps) {
  const currentSede = SEDES_DATABASE[sedeId] || SEDES_DATABASE["parque-amistad"];
  const activeSpaceCategory = findSpaceById(currentSede, spaceId);
  const pricePerHour = activeSpaceCategory?.pricePerHour || 15;
  const totalPrice = selectedHoursCount * pricePerHour;

  const [isMounted, setIsMounted] = useState(false);

  // Dos métodos de pago: 'yape' | 'presencial'
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "presencial">("yape");

  // Estado de archivo del voucher de Yape
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>("");

  // Código de operación aleatorio para pago en caja
  const [operationCode, setOperationCode] = useState("#CW-4921");

  // Estados auxiliares
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Carga segura tras montar para evitar errores de hidratación
  useEffect(() => {
    setIsMounted(true);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setOperationCode(`#CW-${randomNum}`);

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored.paymentMethod === "yape" || stored.paymentMethod === "presencial") {
            setPaymentMethod(stored.paymentMethod);
          }
          if (stored.voucherCode) setVoucherCode(stored.voucherCode);
          if (stored.isCompleted !== undefined) setIsCompleted(stored.isCompleted);
        }
      } catch {
        // Ignorar si no se puede leer localStorage
      }
    }
  }, []);

  // Guardar en localStorage tras montar
  useEffect(() => {
    if (!isMounted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          paymentMethod,
          voucherCode,
          isCompleted,
        })
      );
    } catch {
      // Ignorar errores de localStorage
    }
  }, [isMounted, paymentMethod, voucherCode, isCompleted]);

  const fileInputIdYape = useId();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(operationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleted(true);
  };

  // Datos del cliente con fallback por si no se reciben por props
  const defaultClient: ClientData = clientData || {
    nombres: "Usuario",
    apellidos: "Registrado",
    dni: "12345678",
    celular: "987654321",
    correo: "usuario@ejemplo.com",
  };

  return (
    <section className="py-10 sm:py-16 bg-gray-50/80 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón de Volver al formulario de Datos */}
        <div className="mb-6">
          <button
            onClick={onBack}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Volver a Tus Datos</span>
          </button>
        </div>

        {/* PANTALLA DE CONFIRMACIÓN DE RESERVA EXITOSA */}
        {isCompleted ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              ¡Reserva y Pago Registrados con Éxito!
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Hemos enviado los detalles y el comprobante de tu reserva a{" "}
              <strong className="text-gray-800">{defaultClient.correo}</strong>.
            </p>

            {/* Ficha Resumen Final */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 text-left mb-8 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Titular de la Reserva:</span>
                <span className="font-bold text-gray-900">
                  {defaultClient.nombres} {defaultClient.apellidos}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">DNI / Identificación:</span>
                <span className="font-bold text-gray-800">{defaultClient.dni}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Celular de Contacto:</span>
                <span className="font-bold text-gray-800">{defaultClient.celular}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Método de Pago Seleccionado:</span>
                <span className="font-extrabold text-blue-600">
                  {paymentMethod === "yape"
                    ? "Yape / Plin (Pago con QR & Voucher)"
                    : "Pago en Caja de Coworking"}
                </span>
              </div>

              {paymentMethod === "presencial" && (
                <div className="flex justify-between items-center border-b pb-2 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                  <span className="text-blue-900 font-bold">Código para Presentar en Caja:</span>
                  <span className="font-black text-blue-700 text-lg">{operationCode}</span>
                </div>
              )}

              {paymentMethod === "yape" && voucherCode && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">N° Voucher Digital:</span>
                  <span className="font-bold text-purple-700">{voucherCode}</span>
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Sede:</span>
                <span className="font-bold text-gray-800">{currentSede.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Fecha & Espacio:</span>
                <span className="font-bold text-gray-800">
                  Sept. {day}, 2026 — {activeSpaceCategory?.name}
                </span>
              </div>

              <div className="flex justify-between pt-1 font-bold text-base text-gray-900">
                <span>Monto Total Abonado:</span>
                <span className="text-emerald-600">S/ {totalPrice.toFixed(2)}</span>
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
            {/* COLUMNA IZQUIERDA: RESUMEN DE PAGO Y DATOS DEL TITULAR */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 lg:sticky lg:top-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Resumen de Pago
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {currentSede.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Confirmación inmediata
                </p>
              </div>

              {/* Datos del Titular */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold text-blue-900 block mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Titular de la Reserva:
                </span>
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold text-gray-900 text-sm">
                    {defaultClient.nombres} {defaultClient.apellidos}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <CreditCard className="w-3 h-3 text-gray-400" />
                    <span>DNI: {defaultClient.dni}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>Celular: {defaultClient.celular}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>Correo: {defaultClient.correo}</span>
                  </p>
                </div>
              </div>

              {/* Desglose de la Reserva */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Fecha seleccionada:</span>
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
                  <span className="text-gray-900">Monto Total a Pagar:</span>
                  <span className="text-2xl text-blue-600">S/ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: SELECCIÓN Y DETALLES DE LOS 2 MÉTODOS DE PAGO */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-extrabold text-gray-900 pb-3 border-b border-gray-100">
                Selecciona tu Método de Pago
              </h3>

              {/* Selector de los 2 Métodos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Opción Yape / Plin */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("yape")}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "yape"
                      ? "bg-purple-50 border-purple-600 ring-2 ring-purple-600 text-purple-900 font-bold shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold block leading-tight">Yape / Plin</span>
                      <span className="text-xs text-purple-700 font-semibold">Pago digital inmediato</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-normal">
                    Muestra un código QR para escanear, adjuntar voucher y confirmar tu reserva.
                  </p>
                </button>

                {/* 2. Opción Pago en Caja */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("presencial")}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "presencial"
                      ? "bg-blue-50 border-blue-600 ring-2 ring-blue-600 text-blue-900 font-bold shadow-md"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-base font-extrabold block leading-tight">Pago en Caja</span>
                      <span className="text-xs text-blue-700 font-semibold">En la Recepción</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-normal">
                    Obtén un código de pago para presentarte en la caja de la sede y cancelar.
                  </p>
                </button>
              </div>

              {/* OPCIÓN 1: YAPE / PLIN */}
              {paymentMethod === "yape" && (
                <form onSubmit={handleFinish} className="space-y-6 animate-fade-in pt-2">
                  {/* Visualización del QR */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-6 text-center space-y-3">
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
                      Escanea el Código QR para Yapear o Plinear:
                    </span>
                    <div className="w-40 h-40 bg-white border-2 border-purple-300 rounded-2xl mx-auto flex items-center justify-center shadow-inner relative p-3">
                      <QrCode className="w-32 h-32 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-900">
                        Monto exacto a pagar:
                      </p>
                      <p className="text-3xl font-black text-purple-700">
                        ${totalPrice}.00
                      </p>
                    </div>
                  </div>

                  {/* Apartado para Ingresar / Adjuntar Voucher Digital */}
                  <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                    <span className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Apartado de Comprobante / Voucher Digital:
                    </span>

                    {/* Subir archivo de Voucher */}
                    <div>
                      <label
                        htmlFor={fileInputIdYape}
                        className="block text-xs font-bold text-gray-700 mb-1.5"
                      >
                        Subir Captura del Voucher de Pago:
                      </label>
                      <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-5 text-center hover:border-purple-600 transition-colors bg-white">
                        <input
                          id={fileInputIdYape}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setVoucherFile(e.target.files[0]);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          {voucherFile ? (
                            <>
                              <FileCheck className="w-8 h-8 text-emerald-600" />
                              <span className="text-xs font-bold text-emerald-700 line-clamp-1">
                                {voucherFile.name}
                              </span>
                              <span className="text-[11px] text-emerald-600 font-medium">
                                ¡Voucher cargado con éxito!
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-7 h-7 text-purple-500" />
                              <span className="text-xs font-semibold text-gray-700">
                                Haz clic o arrastra tu captura del voucher aquí
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Formatos aceptados: JPG, PNG, PDF (Máx. 5MB)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ingreso opcional del N° de Operación */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        N° / Código de Operación del Voucher (opcional):
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Ej. 84920194..."
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!voucherFile && !voucherCode.trim()}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      voucherFile || voucherCode.trim()
                        ? "bg-purple-600 hover:bg-purple-700 text-white hover:scale-[1.01]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Confirmar y Enviar Reserva (${totalPrice}.00)</span>
                  </button>
                </form>
              )}

              {/* OPCIÓN 2: PAGO EN LA CAJA DE COWORKING */}
              {paymentMethod === "presencial" && (
                <form onSubmit={handleFinish} className="space-y-6 animate-fade-in pt-2">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 space-y-4 text-center">
                    <span className="text-xs font-bold text-blue-800 block uppercase tracking-wider">
                      Tu Código para Pagar en la Caja:
                    </span>

                    <div className="inline-flex items-center gap-3 bg-white border-2 border-blue-200 px-6 py-3.5 rounded-2xl shadow-md">
                      <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-wider">
                        {operationCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        {copiedCode ? (
                          <Check className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Copy className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-gray-600 bg-white p-4.5 rounded-2xl border border-blue-100 max-w-sm mx-auto text-left space-y-2">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Building className="w-4.5 h-4.5 text-blue-600" />
                        Pasos para realizar el pago en caja:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-gray-600 text-xs">
                        <li>Copia o guarda tu código de pago (<strong>{operationCode}</strong>).</li>
                        <li>Preséntate en la recepción de la sede <strong>{currentSede.name}</strong>.</li>
                        <li>Muestra tu código para cancelar en efectivo, Yape presencial o tarjeta (POS).</li>
                      </ol>
                    </div>
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
