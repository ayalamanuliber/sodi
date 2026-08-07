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
        url: '/boda/assets/portada.jpg',
        width: 992,
        height: 1586,
        alt: 'Mirta y Guillermo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mirta & Guillermo',
    description: 'Nos casamos. Viernes 13 de noviembre de 2026.',
    images: ['/boda/assets/portada.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#17231c',
};

export default function WeddingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
