import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "reservaYA - Tu espacio de trabajo ideal",
  description: "Reserva escritorios, salas de reuniones y oficinas privadas en las mejores ubicaciones de la ciudad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-white text-gray-900 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
