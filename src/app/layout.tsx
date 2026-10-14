import type { Metadata, Viewport } from 'next';
import { Mona_Sans } from 'next/font/google';
import './globals.css';
import { defaultSettings } from '@/lib/default-content';
import { getSiteSettings } from '@/lib/content';
import { SITE_NAME, SITE_URL, pageMetadata, siteGraph } from '@/lib/seo';
import { JoinModalProvider } from '@/components/JoinModal';
import GoogleTagManager from '@/components/GoogleTagManager';
import JsonLd from '@/components/JsonLd';

const monaSans = Mona_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mona',
  display: 'swap',
});

/** Site-wide defaults; the home page uses them as-is. Title and description are editable under Settings. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = settings.metaDescription || defaultSettings.metaDescription;
  const homeTitle = settings.siteTitle || defaultSettings.siteTitle;
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    ...pageMetadata({ description, path: '/', shareTitle: homeTitle }),
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitle,
      template: `%s - ${SITE_NAME}`,
    },
    applicationName: SITE_NAME,
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
    icons: {
      icon: [
        { url: '/brand/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/brand/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/brand/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
    },
    // Windows pinned-site tile, as on thecmoassembly.com.
    other: { 'msapplication-TileImage': `${SITE_URL}/brand/icons/icon-270.png` },
    // Google Search Console ownership check (the meta-tag method).
    ...(verification && { verification: { google: verification } }),
  };
}

export const viewport: Viewport = {
  themeColor: '#FAFAF4',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en-IN" className={monaSans.variable}>
      <head>
        <JsonLd
          data={siteGraph({
            description: settings.metaDescription || defaultSettings.metaDescription,
            linkedinUrl: settings.linkedinUrl || defaultSettings.linkedinUrl,
            email: settings.contactEmail || undefined,
          })}
        />
      </head>
      <body>
        <GoogleTagManager id={process.env.NEXT_PUBLIC_GTM_ID} />
        <JoinModalProvider>{children}</JoinModalProvider>
      </body>
    </html>
  );
}
