import 'server-only';
import { canAccess } from '@/modules/auth/models/access.model';
import type { AdminUser } from '@/modules/users/models/user.model';
import type { Site } from '@/modules/sites/models/site.model';
import { siteIdOf } from '@/modules/sites/models/site.constants';
import { timeAgo } from '@/utils/format';
import type { Lead } from '../models/lead.model';
import { EMPTY_FEED, type NotificationFeed } from '../models/notification.model';

const SHOWN = 5;

/** Website names to label notifications with; only needed when there's more than one website. */
export const siteNamesFor = (sites: Pick<Site, 'id' | 'name'>[]) =>
  sites.length > 1 ? new Map(sites.map((s) => [s.id, s.name])) : undefined;

/**
 * The bell's contents for one admin. `newLeads` are the leads with status "new",
 * newest first, from every website (the inbox is shared). Applicant names only
 * go to admins allowed to see the inbox.
 */
export function notificationFeed(
  user: AdminUser,
  newLeads: Lead[],
  siteNames?: Map<string, string>,
  now = Date.now()
): NotificationFeed {
  if (!canAccess(user, 'leads')) return EMPTY_FEED;
  return {
    count: newLeads.length,
    items: newLeads.slice(0, SHOWN).map((lead) => {
      const site = siteNames?.get(siteIdOf(lead));
      const when = timeAgo(lead.createdAt, now);
      return {
        id: lead.id,
        name: lead.fullName,
        kind: lead.source?.cta === 'pdf-download' ? 'pdf' : 'application',
        meta: site ? `${site} · ${when}` : when,
        createdAt: lead.createdAt,
      };
    }),
    seenAt: user.notificationsSeenAt ?? null,
  };
}
