import type { Metadata } from "next";
import { DirectoryLanding } from "@/components/directorio/DirectoryLanding";

export const metadata: Metadata = {
  title: "Directorio Comercial Argentino 2026 | SODI",
  description:
    "Base de datos de empresas, comercios y profesionales de Argentina lista para comprar, descargar y usar.",
  alternates: {
    canonical: "/directorio",
  },
  openGraph: {
    title: "Directorio Comercial Argentino 2026 | SODI",
    description:
      "Comprá la base comercial argentina, descargala y empezá a trabajarla el mismo día.",
    type: "website",
    url: "https://sodi.com.ar/directorio",
  },
};

export default function DirectorioPage() {
  return <DirectoryLanding />;
}
