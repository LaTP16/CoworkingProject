"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onNavigateHome?: () => void;
}

export default function Navbar({ onNavigateHome }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo principal EspaciApp — botón que lleva al inicio */}
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 -m-1 transition-opacity hover:opacity-80 group"
            aria-label="Ir al inicio"
          >
            <img
              src="/images/logo.png"
              alt="EspaciApp Logo"
              className="w-10 h-10 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Espaci<span className="text-blue-600">App</span>
            </span>
          </button>

          {/* Enlaces de navegación en escritorio */}
          <nav className="hidden sm:flex items-center space-x-8">
            <button
              onClick={handleGoHome}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Inicio
            </button>
            <a
              href="https://www.munisurco.gob.pe/coworking/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sedes
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=51992745611"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Soporte
            </a>
          </nav>

          {/* Icono menú hamburguesa en móvil (sm) */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Menú principal"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {isOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <button
            onClick={handleGoHome}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-gray-900 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors border-none cursor-pointer"
          >
            Inicio
          </button>
          <a
            href="https://www.munisurco.gob.pe/coworking/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            Sedes
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=51992745611"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            Soporte
          </a>
        </div>
      )}
    </header>
  );
}
