import type { Metadata } from "next";
import { WEDDING_FAQ_ITEMS } from "@/lib/boda-trial/faq";
import { WeddingLanding } from "@/components/boda-commercial/WeddingLanding";

const title = "Invitaciones digitales para bodas | SODI";
const description =
  "Creá una invitación digital con sus fotos y su historia. Probá seis estilos, las confirmaciones y el panel de invitados. SODI Bodas, Argentina.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/boda" },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_AR",
    url: "/boda",
    siteName: "SODI",
    images: [
      {
        url: "/invitaciones-boda/invitation-table.webp",
        width: 1448,
        height: 1086,
        alt: "Invitación digital ficticia en una mesa contemporánea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/invitaciones-boda/invitation-table.webp"],
  },
};

const pageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://sodi.com.ar/boda#webpage",
      url: "https://sodi.com.ar/boda",
      name: title,
      description,
      inLanguage: "es-AR",
      isPartOf: { "@id": "https://sodi.com.ar/#website" },
      about: { "@id": "https://sodi.com.ar/boda#service" },
    },
    {
      "@type": "Service",
      "@id": "https://sodi.com.ar/boda#service",
      name: "Invitaciones digitales para bodas",
      description,
      serviceType: "Invitaciones de boda personalizadas y gestión de invitados",
      provider: { "@id": "https://sodi.com.ar/#organization" },
      areaServed: { "@type": "Country", name: "Argentina" },
      url: "https://sodi.com.ar/boda",
    },
    {
      "@type": "FAQPage",
      "@id": "https://sodi.com.ar/boda#faq",
      mainEntity: WEDDING_FAQ_ITEMS.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function SodiBodasLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <WeddingLanding />
    </>
  );
}
