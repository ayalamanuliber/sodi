import type { Metadata } from "next";
import { ogImages } from "@/lib/og-card";
import { DirectoryLanding } from "@/components/directorio/DirectoryLanding";

export const metadata: Metadata = {
  title: "Directorio Comercial Argentino 2026 | SODI",
  description:
    "Base de datos de empresas, comercios y profesionales de Argentina lista para prospección comercial por WhatsApp, email y CRM.",
  openGraph: {
    title: "Directorio Comercial Argentino 2026 | SODI",
    description:
      "Landing de conversión para vender la base de datos comercial argentina con compra autogestionable y descarga inmediata.",
    type: "website",
    images: ogImages("/directorio-comercial-argentino"),
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages("/directorio-comercial-argentino"),
  },
};

export default function DirectorioComercialArgentinoPage() {
  return <DirectoryLanding />;
}
