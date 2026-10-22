import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";
import { ogImages } from "@/lib/og-card";
import { Ambient } from "@/components/landing/Ambient";

export const metadata: Metadata = {
  title: "Diagnóstico Guiado | SODI",
  description: "Contanos tu proyecto en 1 minuto y te sugerimos una solución con rango estimado.",
  alternates: {
    canonical: "/diagnostico",
  },
  openGraph: {
    title: "Diagnóstico Guiado | SODI",
    description: "Contanos tu proyecto en 1 minuto y te sugerimos una solución con rango estimado.",
    type: "website",
    url: "https://sodi.com.ar/diagnostico",
    images: ogImages("/diagnostico"),
  },
  twitter: {
    card: "summary_large_image",
    images: ogImages("/diagnostico"),
  },
};

export default function DiagnosticoPage() {
  return (
    <>
      <Ambient />
      <DiagnosticoFlow />
    </>
  );
}
