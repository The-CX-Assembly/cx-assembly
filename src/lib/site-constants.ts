// Shared by server and client: identifiers for the websites this dashboard manages.

import type { SiteModule } from '@/types';

/** The website this app itself renders. Its data predates multi-site support. */
export const DEFAULT_SITE_ID = 'cx-assembly';

/** Dashboard selection meaning "every website" (leads and stats only). */
export const ALL_SITES = 'all';

/** Leads saved before multi-site support have no siteId and belong to the original site. */
export const siteIdOf = (lead: { siteId?: string }) => lead.siteId || DEFAULT_SITE_ID;

export const SITE_MODULES: { key: SiteModule; label: string; description: string }[] = [
  { key: 'leaders', label: 'Leaders', description: 'Speaker / member profiles with headshots' },
];

/** Site ids become Firestore document ids and appear in URLs, so keep them simple. */
export const SITE_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export function slugifySiteId(name: string) {
  return name
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
