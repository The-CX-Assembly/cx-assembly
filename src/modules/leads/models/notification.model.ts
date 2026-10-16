/** One row in the admin bell: a lead still waiting for review. */
export interface NotificationItem {
  id: string;
  name: string;
  /** What they did: applied through a Join form, or downloaded a PDF. */
  kind: 'application' | 'pdf';
  /** e.g. "2h ago" or "Partner Site · 2h ago" */
  meta: string;
  createdAt: string;
}

/** What the bell shows. Notifications are leads with status "new". */
export interface NotificationFeed {
  /** How many leads are waiting for review. */
  count: number;
  /** The newest few, newest first. */
  items: NotificationItem[];
  /** When this admin last opened the bell. Newer leads light up the red dot. */
  seenAt: string | null;
}

export const EMPTY_FEED: NotificationFeed = { count: 0, items: [], seenAt: null };

/** True when a lead arrived after the admin last opened the bell. */
export const hasUnseen = (feed: NotificationFeed) =>
  feed.items.length > 0 && (!feed.seenAt || feed.items[0].createdAt > feed.seenAt);
