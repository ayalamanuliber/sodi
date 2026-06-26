import type { Metadata } from "next";
import { EdifierProposalClient } from "./proposal-client";

export const metadata: Metadata = {
  title: "Propuesta inicial para EDIFIER Argentina | SODI",
  description:
    "Contenido, pauta y visibilidad para que mas personas lleguen con intencion real de compra.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function EdifierProposalPage() {
  return <EdifierProposalClient />;
}
