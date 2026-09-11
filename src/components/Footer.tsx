export default function Footer() {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t border-gray-100/80 py-6 px-4 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/logo.png"
            alt="EspaciApp Logo"
            className="w-7 h-7 object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            Espaci<span className="text-blue-600">App</span>
          </span>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          © 2026 EspaciApp. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
