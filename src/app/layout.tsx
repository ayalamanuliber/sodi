import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SODI — Webs, Sistemas y Automatización para Empresas",
  description:
    "Implementamos webs, automatizaciones, bots de WhatsApp y sistemas internos para empresas que ya venden pero necesitan más orden para crecer.",
  metadataBase: new URL("https://sodi.com.ar"),
  openGraph: {
    title: "SODI — Webs, Sistemas y Automatización para Empresas",
    description:
      "Implementamos webs, automatizaciones, bots de WhatsApp y sistemas internos para empresas que ya venden pero necesitan más orden para crecer.",
    type: "website",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    other: {
      "msvalidate.01": "CDBC80C99B271C88FCB0FD41F4E58DD1",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#040406",
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sodi.com.ar/#organization",
      name: "SODI",
      url: "https://sodi.com.ar",
      logo: "https://sodi.com.ar/icon-512.png",
      description:
        "Implementamos webs, automatizaciones, bots de WhatsApp, redes sociales y sistemas internos para empresas argentinas.",
      areaServed: {
        "@type": "Country",
        name: "Argentina",
      },
      sameAs: ["https://www.instagram.com/sodi.ar"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+54-11-3869-6958",
        contactType: "sales",
        availableLanguage: "Spanish",
      },
      knowsAbout: [
        "Desarrollo web",
        "Automatización empresarial",
        "WhatsApp Business",
        "Sistemas de gestión",
        "Redes sociales para empresas",
        "CRM para PyMEs",
        "Transformación digital",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://sodi.com.ar/#website",
      url: "https://sodi.com.ar",
      name: "SODI — Webs, Sistemas y Automatización para Empresas",
      publisher: { "@id": "https://sodi.com.ar/#organization" },
      inLanguage: "es-AR",
    },
    {
      "@type": "WebPage",
      "@id": "https://sodi.com.ar/#homepage",
      url: "https://sodi.com.ar",
      name: "SODI — Webs, Sistemas y Automatización para Empresas",
      description:
        "Implementamos webs, automatizaciones, bots de WhatsApp y sistemas internos para empresas que ya venden pero necesitan más orden para crecer.",
      isPartOf: { "@id": "https://sodi.com.ar/#website" },
      about: { "@id": "https://sodi.com.ar/#organization" },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://sodi.com.ar/#service",
      name: "SODI",
      url: "https://sodi.com.ar",
      telephone: "+54-11-3869-6958",
      email: "hola@sodi.com.ar",
      areaServed: {
        "@type": "Country",
        name: "Argentina",
      },
      priceRange: "$$",
      serviceType: [
        "Diseño y desarrollo web",
        "Automatización de WhatsApp",
        "Sistemas de gestión internos",
        "Gestión de redes sociales",
        "CRM a medida",
        "Consultoría digital",
      ],
      provider: { "@id": "https://sodi.com.ar/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body>
        {/* GA4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-BXSWHC7WLX" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BXSWHC7WLX');`}
        </Script>
        <MetaPixel />

        <div className="noise" />
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  );
}
