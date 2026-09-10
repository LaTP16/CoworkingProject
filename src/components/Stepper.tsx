import { CheckCircle2, Building2, Calendar, CreditCard } from "lucide-react";

interface StepperProps {
  currentStep: "sedes" | "reserva" | "pago";
}

export default function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { id: "sedes", number: 1, label: "Escoge", icon: Building2 },
    { id: "reserva", number: 2, label: "Reserva", icon: Calendar },
    { id: "pago", number: 3, label: "Paga", icon: CreditCard },
  ];

  const getStepStatus = (stepId: string) => {
    if (stepId === currentStep) return "active";
    if (
      (currentStep === "reserva" && stepId === "sedes") ||
      (currentStep === "pago" && (stepId === "sedes" || stepId === "reserva"))
    ) {
      return "completed";
    }
    return "pending";
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 py-4 shadow-sm mb-6">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Línea conectora de fondo */}
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    status === "active"
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110"
                      : status === "completed"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold ${
                    status === "active"
                      ? "text-blue-600"
                      : status === "completed"
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.number}. {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
