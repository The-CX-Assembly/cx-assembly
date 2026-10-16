'use server';

import { authorize } from '@/middlewares/auth.middleware';
import { getShellSummary } from '@/modules/dashboard/services/dashboard.service';
import { listSites } from '@/modules/sites/services/sites.service';
import { setNotificationsSeen } from '@/modules/users/services/users.service';
import type { NotificationFeed } from '../models/notification.model';
import { notificationFeed, siteNamesFor } from '../services/notifications.service';

/** Fresh bell contents, so new leads show up without reloading the admin. */
export async function refreshNotifications(): Promise<NotificationFeed | null> {
  const user = await authorize('leads');
  if (!user) return null;
  const [{ newLeads }, sites] = await Promise.all([getShellSummary(null), listSites()]);
  return notificationFeed(user, newLeads, siteNamesFor(sites));
}

/** Called when the admin opens the bell. Returns the time it was marked seen. */
export async function markNotificationsSeen(): Promise<string | null> {
  const user = await authorize('leads');
  if (!user) return null;
  const at = new Date().toISOString();
  await setNotificationsSeen(user.email, user.builtIn === true, at);
  return at;
}
