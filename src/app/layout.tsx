import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
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
        telephone: "+54-11-5721-0923",
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
      telephone: "+54-11-5721-0923",
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

        <div className="noise" />
        {children}
        {/* WA Float */}
        <a
          href="https://wa.me/5491157210923?text=Hola%20SODI,%20quiero%20un%20diagnóstico%20para%20mi%20empresa."
          target="_blank"
          rel="noopener noreferrer"
          className="wa-btn"
          aria-label="WhatsApp"
        >
          <svg width="28" height="28" fill="#fff" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.063 3.963L0 16l4.223-1.108a7.922 7.922 0 0 0 3.767.954h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </a>
        <Analytics />
      </body>
    </html>
  );
}
