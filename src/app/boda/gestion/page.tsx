import type { Metadata } from "next";
import { WeddingStudioSetup } from "@/components/boda-studio/WeddingStudioSetup";

export const metadata: Metadata = { title: "Gestión de bodas | SODI", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <WeddingStudioSetup />; }
