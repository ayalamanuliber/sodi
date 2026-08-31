import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitaciones digitales para casamientos | SODI Bodas",
  description:
    "Invitaciones web interactivas con enlaces personalizados, confirmaciones, música y panel de gestión para casamientos.",
  alternates: {
    canonical: "/boda",
  },
  openGraph: {
    title: "Invitaciones digitales para casamientos | SODI Bodas",
    description:
      "Invitaciones web interactivas con enlaces personalizados, confirmaciones, música y panel de gestión para casamientos.",
    type: "website",
    url: "https://sodi.com.ar/boda",
  },
};

export default function SodiBodasLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
