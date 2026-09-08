import type { Metadata } from "next";
import { WeddingPortalRoute } from "@/components/boda-commercial/WeddingPortalRoute";

export const metadata: Metadata = {
  title: "Panel de muestra | SODI Bodas",
  description: "Panel ficticio para ver invitados, lugares y confirmaciones de asistencia.",
  robots: { index: false, follow: false },
};

export default function WeddingPortalDemoPage() {
  return <WeddingPortalRoute />;
}
