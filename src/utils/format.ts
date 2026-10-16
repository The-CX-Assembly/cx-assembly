// Date formatting shared by server and browser. The community is India-based,
// so dates follow IST rather than the server's (UTC) clock.

export const TZ = 'Asia/Kolkata';

/** "Just now", "5 min ago", "3 hrs ago", "4 days ago", then a short date. */
export function timeAgo(iso: string | undefined, now = Date.now()): string {
  if (!iso) return 'Recently';
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return 'Recently';

  const minutes = Math.floor(Math.max(0, now - time) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: TZ });
}

/** "15 Oct 2026, 2:30 pm" */
export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ });
}
