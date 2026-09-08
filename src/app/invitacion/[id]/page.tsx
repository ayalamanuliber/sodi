import type { Metadata } from "next";
import { PublishedWedding } from "@/components/boda-studio/PublishedWedding";

export const metadata: Metadata = { title: "Una invitación especial", description: "Abrí la invitación para conocer los detalles y confirmar tu asistencia.", robots: { index: false, follow: false }, referrer: "no-referrer", openGraph: { title: "Una invitación especial", description: "Nos encantaría compartir este día con vos.", images: [] } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublishedWedding eventId={id} />;
}
