"use client";

import { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo tipográfico EspaciApp */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <a href="#" className="text-2xl font-extrabold tracking-tight text-gray-900">
              Espaci<span className="text-blue-600">App</span>
            </a>
          </div>

          {/* Enlaces de navegación en escritorio */}
          <nav className="hidden sm:flex items-center space-x-8">
            <a
              href="#inicio"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Inicio
            </a>
            <a
              href="#sedes"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sedes
            </a>
            <a
              href="#contacto"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contacto
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
          <a
            href="#inicio"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-900 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Inicio
          </a>
          <a
            href="#sedes"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            Sedes
          </a>
          <a
            href="#contacto"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            Contacto
          </a>
        </div>
      )}
    </header>
  );
}
