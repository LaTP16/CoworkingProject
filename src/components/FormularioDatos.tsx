"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { SEDES_DATABASE } from "@/data/sedesData";

export interface ClientData {
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  correo: string;
}

interface FormularioDatosProps {
  sedeId: string;
  day: number | null;
  spaceId: string | null;
  selectedHoursCount: number;
  selectedHourLabels: string[];
  initialData?: ClientData;
  onBack: () => void;
  onContinuarAPagar: (data: ClientData) => void;
}

const STORAGE_KEY_DATOS = "coworking-datos-cliente";

export default function FormularioDatos({
  sedeId,
  day,
  spaceId,
  selectedHoursCount,
  selectedHourLabels,
  initialData,
  onBack,
  onContinuarAPagar,
}: FormularioDatosProps) {
  const currentSede = SEDES_DATABASE[sedeId] || SEDES_DATABASE["parque-amistad"];
  const activeSpaceCategory = currentSede.spaces.find((s) => s.id === spaceId);

  const getStoredDatos = (): ClientData => {
    if (initialData && initialData.nombres) return initialData;
    if (typeof window === "undefined") {
      return { nombres: "", apellidos: "", dni: "", celular: "", correo: "" };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_DATOS);
      return raw
        ? JSON.parse(raw)
        : { nombres: "", apellidos: "", dni: "", celular: "", correo: "" };
    } catch {
      return { nombres: "", apellidos: "", dni: "", celular: "", correo: "" };
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<ClientData>({
    nombres: "",
    apellidos: "",
    dni: "",
    celular: "",
    correo: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClientData, string>>>({});

  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredDatos();
    if (stored && (stored.nombres || stored.correo)) {
      setFormData(stored);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_DATOS, JSON.stringify(formData));
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, [isMounted, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof ClientData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientData, string>> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "Ingresa tus nombres completos";
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Ingresa tus apellidos completos";
    }
    if (!formData.dni.trim()) {
      newErrors.dni = "Ingresa tu DNI o Documento de Identidad";
    } else if (formData.dni.trim().length < 6) {
      newErrors.dni = "El DNI o Documento debe ser válido";
    }
    if (!formData.celular.trim()) {
      newErrors.celular = "Ingresa tu número de celular";
    } else if (!/^\+?\d{8,15}$/.test(formData.celular.replace(/\s+/g, ""))) {
      newErrors.celular = "Ingresa un número de celular válido (mínimo 8 dígitos)";
    }
    if (!formData.correo.trim()) {
      newErrors.correo = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
      newErrors.correo = "Ingresa un correo electrónico válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onContinuarAPagar(formData);
    }
  };

  const pricePerHour = 15;
  const totalPrice = selectedHoursCount * pricePerHour;

  return (
    <section className="py-10 sm:py-16 bg-gray-50/80 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón Volver a Reserva */}
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

        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Paso 3: Identificación del Titular</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ingresa tus Datos Personales
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Ingresa los datos del titular para emitir tu reserva y comprobante de pago.
          </p>
        </div>

        {/* ESTRUCTURA DE 2 COLUMNAS: FORMULARIO (IZQ) vs RESUMEN DE RESERVA (DER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA: FORMULARIO DE DATOS */}
          <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Datos del Usuario</span>
              </h3>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Registro seguro
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Ej. Juan Carlos"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                        errors.nombres
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {errors.nombres && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      {errors.nombres}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Ej. Pérez Gómez"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                        errors.apellidos
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {errors.apellidos && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      {errors.apellidos}
                    </p>
                  )}
                </div>
              </div>

              {/* DNI y Celular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    DNI / Doc. Identidad <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="8 dígitos de tu DNI"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                        errors.dni
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {errors.dni && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      {errors.dni}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Número de Celular <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      placeholder="Ej. 987654321"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                        errors.celular
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {errors.celular && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      {errors.celular}
                    </p>
                  )}
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:bg-white transition-all ${
                      errors.correo
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.correo ? (
                  <p className="text-xs text-red-500 mt-1 font-semibold">
                    {errors.correo}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Enviaremos la confirmación y el comprobante digital a esta dirección.
                  </p>
                )}
              </div>

              {/* Botón Siguiente Paso */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                >
                  <span>Continuar al Paso de Pago</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DE LA RESERVA */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border border-blue-200 rounded-3xl p-6 shadow-lg space-y-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm pb-3 border-b border-blue-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Resumen de tu Reserva</span>
            </div>

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
                  <span className="text-gray-400 font-medium block">Fecha:</span>
                  <span className="font-bold text-gray-900">Septiembre {day}, 2026</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Tipo de Espacio:</span>
                  <span className="font-bold text-gray-900">{activeSpaceCategory?.name}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-gray-400 font-medium">
                  <span>Horas seleccionadas:</span>
                  <span className="font-bold text-blue-600">{selectedHoursCount} hr(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedHourLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200"
                    >
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Total a Pagar:</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ${totalPrice}.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
