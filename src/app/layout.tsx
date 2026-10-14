import type { Metadata, Viewport } from 'next';
import { Mona_Sans } from 'next/font/google';
import './globals.css';
import { defaultSettings } from '@/lib/default-content';
import { JoinModalProvider } from '@/components/JoinModal';
import ScrollReset from '@/components/ScrollReset';

const monaSans = Mona_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mona',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The CX Assembly — India’s Peer-Led Community for CX Leaders',
    template: '%s | The CX Assembly',
  },
  description: defaultSettings.metaDescription,
  keywords: [
    'CX Assembly',
    'Customer Experience Leaders India',
    'Chief Customer Officer',
    'CX Community India',
    'The Executive Assembly',
    'Vivek Sheth',
    'Founding CX Leaders',
  ],
  authors: [{ name: 'The Executive Assembly' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://the-cx-assembly.web.app'),
  openGraph: {
    title: 'The CX Assembly — Built by CX Leaders. For CX Leaders.',
    description: defaultSettings.metaDescription,
    url: 'https://the-cx-assembly.web.app',
    siteName: 'The CX Assembly',
    images: [
      {
        url: '/brand/logo.png',
        width: 800,
        height: 800,
        alt: 'The CX Assembly',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The CX Assembly — Built by CX Leaders. For CX Leaders.',
    description: defaultSettings.metaDescription,
    images: ['/brand/logo.png'],
  },
  icons: {
    icon: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAFAF4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The CX Assembly',
    alternateName: 'CX Assembly',
    url: 'https://the-cx-assembly.web.app',
    logo: 'https://the-cx-assembly.web.app/brand/logo.png',
    description: defaultSettings.metaDescription,
    founder: {
      '@type': 'Person',
      name: 'Vivek Sheth',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'The Executive Assembly',
    },
    sameAs: ['https://www.linkedin.com/company/the-cx-assembly'],
  };

  return (
    <html lang="en" className={monaSans.variable} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ScrollReset />
        <JoinModalProvider>{children}</JoinModalProvider>
      </body>
    </html>
  );
}
