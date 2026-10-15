import type { Metadata } from 'next';
import { IS_STAGING } from '@/lib/env';

// Tag set modelled on thecmoassembly.com (All in One SEO): canonical, Open Graph
// incl. secure_url, large X card, max-image-preview, sized icons, and a
// schema.org graph of Organization, WebSite, WebPage and BreadcrumbList.

/**
 * The public address of this website. Every canonical link, sitemap entry and
 * social-preview URL is built from it, so it must be a domain that actually
 * serves the site. Set NEXT_PUBLIC_SITE_URL (apphosting.yaml) when a custom
 * domain is connected.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://cx-assembly--the-cx-assembly.us-east4.hosted.app'
).replace(/\/+$/, '');

export const SITE_NAME = 'The CX Assembly';
export const SITE_TAGLINE = 'Built by CX Leaders. For CX Leaders.';
const LANGUAGE = 'en-IN';

/** 1200×630 card shown when a link is shared on LinkedIn, WhatsApp, X, Slack… */
export const SHARE_IMAGE = {
  url: '/brand/og-image.png',
  width: 1200,
  height: 630,
  alt: 'The CX Assembly — Better customer experiences start with better conversations.',
};

export interface PageSeo {
  /** Shown as "<title> - The CX Assembly". Omit for the home page. */
  title?: string;
  description: string;
  /** Route path, e.g. "/founding-50". */
  path: string;
}

/** The public pages, so metadata and structured data always agree. */
export const PAGES = {
  founding50: {
    title: 'The Founding 50 Leaders',
    description: 'Meet the 50 founding customer experience leaders shaping India’s peer-led CX community.',
    path: '/founding-50',
  },
  communityVoices: {
    title: 'Community Voices',
    description:
      'Unfiltered perspectives, lessons, and candid reflections from senior customer experience heads across India.',
    path: '/community-voices',
  },
  videos: {
    title: 'Videos',
    description: 'Conversations, interviews and talks from India’s community of customer experience leaders.',
    path: '/videos',
  },
  resources: {
    title: 'Resources',
    description: 'Reports, playbooks and guides for customer experience leaders, from The CX Assembly.',
    path: '/resources',
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    description: 'Privacy Policy and data protection terms for The CX Assembly.',
    path: '/privacy-policy',
  },
} satisfies Record<string, PageSeo>;

export const fullTitle = (title?: string) => (title ? `${title} - ${SITE_NAME}` : SITE_NAME);
const absolute = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

/**
 * Title, description, canonical URL, robots and social previews for one page.
 * Pages set all of them together because Next.js replaces (not merges) the
 * parent's openGraph/twitter objects.
 */
export function pageMetadata({ title, description, path, shareTitle }: PageSeo & { shareTitle?: string }): Metadata {
  const preview = shareTitle ?? fullTitle(title);
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    // Lets Google show the large preview image in results; staging is never indexed.
    robots: IS_STAGING ? { index: false, follow: false } : { 'max-image-preview': 'large' },
    openGraph: {
      title: preview,
      description,
      url: path,
      siteName: `${SITE_NAME} - ${SITE_TAGLINE}`,
      locale: 'en_IN',
      type: path === '/' ? 'website' : 'article',
      images: [{ ...SHARE_IMAGE, secureUrl: absolute(SHARE_IMAGE.url) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: preview,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

// ---------- schema.org structured data ----------

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Organization + WebSite, shared by every page (rendered once in the root layout). */
export function siteGraph({ description, linkedinUrl, email }: { description: string; linkedinUrl?: string; email?: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: SITE_NAME,
        alternateName: 'CX Assembly',
        description,
        url: `${SITE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#organizationLogo`,
          url: `${SITE_URL}/brand/logo.png`,
          width: 1024,
          height: 1024,
          caption: SITE_NAME,
        },
        image: { '@id': `${SITE_URL}/#organizationLogo` },
        founder: { '@type': 'Person', name: 'Vivek Sheth' },
        parentOrganization: { '@type': 'Organization', name: 'The Executive Assembly' },
        ...(linkedinUrl && { sameAs: [linkedinUrl] }),
        ...(email && { email }),
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SITE_TAGLINE,
        inLanguage: LANGUAGE,
        publisher: { '@id': ORG_ID },
      },
    ],
  };
}

/** WebPage + BreadcrumbList for one page, linked to the site graph by @id. */
export function pageGraph({ title, description, path, name }: PageSeo & { name?: string }) {
  const url = absolute(path);
  const crumbs = [{ name: 'Home', url: `${SITE_URL}/` }, ...(title ? [{ name: title, url }] : [])];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumblist`,
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          '@id': `${c.url}#listItem`,
          position: i + 1,
          name: c.name,
          // The last crumb is the page itself, so it has no link.
          ...(i < crumbs.length - 1 && { item: c.url }),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: name ?? fullTitle(title),
        description,
        inLanguage: LANGUAGE,
        isPartOf: { '@id': WEBSITE_ID },
        breadcrumb: { '@id': `${url}#breadcrumblist` },
        primaryImageOfPage: { '@type': 'ImageObject', url: absolute(SHARE_IMAGE.url), width: 1200, height: 630 },
      },
    ],
  };
}
