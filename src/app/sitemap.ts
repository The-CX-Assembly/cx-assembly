import { MetadataRoute } from 'next';
import { SITE_URL } from '@/modules/seo/utils/metadata';
import { getMediaSettings } from '@/modules/media/services/media.service';

// Rebuilt at most once an hour, so switching a page on in the admin shows up here.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const media = await getMediaSettings();
  const baseUrl = SITE_URL;

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/founding-50`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community-voices`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Only listed while switched on (Videos & PDFs → Where they appear).
    ...(media.videosPage
      ? [{ url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }]
      : []),
    ...(media.resourcesPage
      ? [{ url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }]
      : []),
  ];
}
