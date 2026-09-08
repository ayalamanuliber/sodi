import type { Metadata } from "next";
import { WeddingStudio } from "@/components/boda-studio/WeddingStudio";

export const metadata: Metadata = { title: "Organizar nuestra boda | SODI", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WeddingStudio eventId={id} />;
}
