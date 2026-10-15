import { MetadataRoute } from 'next';
import { SITE_URL } from '@/features/seo/metadata';
import { IS_STAGING } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  // Staging must never be indexed.
  if (IS_STAGING) return { rules: [{ userAgent: '*', disallow: '/' }] };

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
