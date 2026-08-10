import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Mirta & Guillermo | 13 de noviembre de 2026',
  description: 'Te invitamos a celebrar nuestro casamiento el viernes 13 de noviembre de 2026.',
  alternates: {
    canonical: '/boda/mirta-y-guillermo',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Mirta & Guillermo',
    description: 'Nos casamos. Viernes 13 de noviembre de 2026.',
    type: 'website',
    locale: 'es_AR',
    url: '/boda/mirta-y-guillermo',
    images: [
      {
        url: '/boda/mirta-y-guillermo/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Invitación al casamiento de Mirta y Guillermo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mirta & Guillermo',
    description: 'Nos casamos. Viernes 13 de noviembre de 2026.',
    images: ['/boda/mirta-y-guillermo/opengraph-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#17231c',
};

export default function WeddingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
