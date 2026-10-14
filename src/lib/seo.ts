import type { Metadata } from 'next';

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

/** 1200×630 card shown when a link is shared on LinkedIn, WhatsApp, X, Slack… */
export const SHARE_IMAGE = {
  url: '/brand/og-image.png',
  width: 1200,
  height: 630,
  alt: 'The CX Assembly — Better customer experiences start with better conversations.',
};

/**
 * Title, description, canonical URL and social previews for one page.
 * Pages set all of them together because Next.js replaces (not merges) the
 * parent's openGraph/twitter objects.
 */
export function pageMetadata({
  title,
  description,
  path,
  shareTitle,
}: {
  /** Shown in the browser tab as "<title> | The CX Assembly". Omit for the home page. */
  title?: string;
  description: string;
  /** Route path, e.g. "/founding-50". */
  path: string;
  /** Headline for link previews; defaults to the full page title. */
  shareTitle?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const preview = shareTitle ?? fullTitle;
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: preview,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: preview,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
