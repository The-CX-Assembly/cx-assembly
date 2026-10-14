import type { Metadata, Viewport } from 'next';
import { Mona_Sans } from 'next/font/google';
import './globals.css';
import { defaultSettings } from '@/lib/default-content';
import { getSiteSettings } from '@/lib/content';
import { SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo';
import { JoinModalProvider } from '@/components/JoinModal';

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

  return {
    ...pageMetadata({ description, path: '/', shareTitle: homeTitle }),
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitle,
      template: `%s | ${SITE_NAME}`,
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
      icon: '/brand/logo.png',
      apple: '/brand/logo.png',
    },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The CX Assembly',
    alternateName: 'CX Assembly',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: settings.metaDescription || defaultSettings.metaDescription,
    founder: {
      '@type': 'Person',
      name: 'Vivek Sheth',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'The Executive Assembly',
    },
    sameAs: [settings.linkedinUrl || defaultSettings.linkedinUrl],
    ...(settings.contactEmail && { email: settings.contactEmail }),
  };

  return (
    <html lang="en" className={monaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <JoinModalProvider>{children}</JoinModalProvider>
      </body>
    </html>
  );
}
