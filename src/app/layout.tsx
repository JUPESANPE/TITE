import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TITE — ¿Qué me pongo?",
  description: "TITE conoce tu ropa, entiende tu estilo y te ayuda a decidir qué ponerte hoy.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
