import type { Metadata } from "next";
import { DiagnosticoFlow } from "@/components/diagnostico/DiagnosticoFlow";
import { Ambient } from "@/components/landing/Ambient";

export const metadata: Metadata = {
  title: "Diagnóstico Guiado — SODI",
  description: "Contanos tu proyecto en 1 minuto y te sugerimos una solución con rango estimado.",
};

export default function DiagnosticoPage() {
  return (
    <>
      <Ambient />
      <DiagnosticoFlow />
    </>
  );
}
