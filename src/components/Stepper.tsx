import { CheckCircle2, Building2, Calendar, UserCheck, CreditCard } from "lucide-react";

export type StepId = "sedes" | "reserva" | "datos" | "pago";

interface StepperProps {
  currentStep: StepId;
  onStepClick?: (stepId: StepId) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const steps: { id: StepId; number: number; label: string; icon: any }[] = [
    { id: "sedes", number: 1, label: "Escoge", icon: Building2 },
    { id: "reserva", number: 2, label: "Reserva", icon: Calendar },
    { id: "datos", number: 3, label: "Tus Datos", icon: UserCheck },
    { id: "pago", number: 4, label: "Paga", icon: CreditCard },
  ];

  const getStepStatus = (stepId: StepId) => {
    if (stepId === currentStep) return "active";
    const order: StepId[] = ["sedes", "reserva", "datos", "pago"];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(stepId);
    if (stepIndex < currentIndex) return "completed";
    return "pending";
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 py-4 shadow-sm mb-6 sticky top-16 sm:top-20 z-40">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Línea conectora de fondo */}
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    status === "active"
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110"
                      : status === "completed"
                      ? "bg-emerald-500 text-white shadow-sm group-hover:scale-105"
                      : "bg-gray-100 text-gray-400 border border-gray-200 group-hover:bg-gray-200 group-hover:text-gray-600"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold transition-colors ${
                    status === "active"
                      ? "text-blue-600"
                      : status === "completed"
                      ? "text-emerald-600 group-hover:text-emerald-700"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {step.number}. {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
