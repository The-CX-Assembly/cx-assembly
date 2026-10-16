import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { listSites } from './sites.service';
import { ALL_SITES, DEFAULT_SITE_ID } from '../models/site.constants';
import { Site, SiteModule } from '../models/site.model';

export const SITE_COOKIE = 'cx_admin_site';

export interface AdminSiteContext {
  sites: Site[];
  /** The website being managed, or null when "All websites" is selected. */
  site: Site | null;
}

/** The dashboard's current website, remembered per browser. Cached per request. */
export const getAdminSiteContext = cache(async (): Promise<AdminSiteContext> => {
  const [sites, cookieStore] = await Promise.all([listSites(), cookies()]);
  const chosen = cookieStore.get(SITE_COOKIE)?.value ?? DEFAULT_SITE_ID;
  if (chosen === ALL_SITES) return { sites, site: null };
  return { sites, site: sites.find((s) => s.id === chosen) ?? sites[0] };
});

/** Websites that have a feature turned on, for pages that need one. */
export const sitesWith = (sites: Site[], module: SiteModule) => sites.filter((s) => s.modules.includes(module));
