import type { Metadata } from "next";
import { WeddingTrial } from "@/components/boda-commercial/WeddingTrial";

export const metadata: Metadata = {
  title: "Prueba local de invitación | SODI Bodas",
  description:
    "Creá una invitación de muestra, elegí un estilo y probá una confirmación de asistencia en tu navegador.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WeddingTrialPage() {
  return <WeddingTrial />;
}
