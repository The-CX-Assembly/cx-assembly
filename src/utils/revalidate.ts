import 'server-only';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SITE_ID } from '@/modules/sites/models/site.constants';

/**
 * Refreshes an admin page and, for the website this app renders, the public
 * pages showing that data. Other websites fetch from the API on their own schedule.
 */
export function revalidateSite(siteId: string, adminPath: string, publicPaths: string[]) {
  revalidatePath(adminPath);
  if (siteId === DEFAULT_SITE_ID) publicPaths.forEach((p) => revalidatePath(p));
}
