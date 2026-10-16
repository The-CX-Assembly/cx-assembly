'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { selectAdminSite } from '@/modules/sites/controllers/sites.actions';
import { ALL_SITES } from '@/modules/sites/models/site.constants';
import type { SiteModule } from '@/modules/sites/models/site.model';
import { logoutAdminAction } from '@/modules/auth/controllers/auth.actions';
import { markNotificationsSeen, refreshNotifications } from '@/modules/leads/controllers/notifications.actions';
import { hasUnseen, type NotificationFeed } from '@/modules/leads/models/notification.model';
import { AdminAccess, AdminSection, ROLE_LABEL, canAccess } from '@/modules/auth/models/access.model';
import {
  IconBell,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconEdit,
  IconExternal,
  IconGlobe,
  IconGrid,
  IconInbox,
  IconLogout,
  IconMenu,
  IconSearch,
  IconSettings,
  IconShield,
  IconSidebar,
  IconMic,
  IconVideo,
} from './AdminIcons';
import { avatarGradient, initials } from './avatar';

/** "The CX Assembly" → "CA" */
const siteInitials = (name: string) => initials(name.replace(/^the\s+/i, ''));
import styles from './AdminShell.module.css';

export interface ShellSite {
  id: string;
  name: string;
  url?: string;
  modules: SiteModule[];
}

interface AdminShellProps {
  user: AdminAccess & { email: string; name: string };
  sites: ShellSite[];
  /** The website being managed; null means all websites. */
  siteId: string | null;
  speakerCount: number;
  notifications: NotificationFeed;
  children: React.ReactNode;
}

const TOP_TABS: { label: string; href: string; section: AdminSection | 'users' | 'sites' }[] = [
  { label: 'Dashboard', href: '/admin', section: 'dashboard' },
  { label: 'Leads', href: '/admin/leads', section: 'leads' },
  { label: 'CMO Speakers', href: '/admin/speakers', section: 'leaders' },
  { label: 'Content', href: '/admin/content', section: 'content' },
  { label: 'Media', href: '/admin/media', section: 'media' },
  { label: 'Websites', href: '/admin/sites', section: 'sites' },
  { label: 'Users', href: '/admin/users', section: 'users' },
];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export default function AdminShell({
  user,
  sites,
  siteId,
  speakerCount,
  notifications,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop sidebar starts as an icon-only rail.
  const [collapsed, setCollapsed] = useState(true);
  const [menu, setMenu] = useState<'notifications' | 'user' | 'site' | 'more' | null>(null);
  // How many top tabs fit; the rest go under "More".
  const [tabsFit, setTabsFit] = useState(Infinity);
  const [switching, setSwitching] = useState(false);
  const [query, setQuery] = useState('');

  // The bell. Starts from the server; refreshed in the background (below) and
  // replaced whenever the server sends a newer copy (e.g. after a status change).
  const [feed, setFeed] = useState(notifications);
  const [feedFromServer, setFeedFromServer] = useState(notifications);
  if (feedFromServer !== notifications) {
    setFeedFromServer(notifications);
    setFeed(notifications);
  }
  // Leads newer than this are highlighted while the bell is open.
  const [highlightAfter, setHighlightAfter] = useState('');
  const unseen = hasUnseen(feed);

  const tabsRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const siteMenuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Only <main> scrolls (not the window), so start each page at the top ourselves.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // Show as many top tabs as fit in one line (less room when the sidebar is open);
  // the rest go under "More". Widths come from a hidden copy of every tab.
  useLayoutEffect(() => {
    const nav = tabsRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;

    const fit = () => {
      const widths = Array.from(measure.children, (el) => (el as HTMLElement).offsetWidth);
      const moreWidth = widths.pop() ?? 0; // the last copy is the More button
      const gap = parseFloat(getComputedStyle(nav).columnGap) || 0;
      const available = nav.clientWidth;
      const all = widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
      if (all <= available) return setTabsFit(widths.length);
      let used = moreWidth;
      let count = 0;
      while (count < widths.length && used + gap + widths[count] <= available) used += gap + widths[count++];
      setTabsFit(count);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [user.role, siteId]);

  // Slide the tab underline under the active tab, or under More when the
  // current page is inside it (and keep it there on resize).
  useLayoutEffect(() => {
    const nav = tabsRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const place = () => {
      const active = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) {
        indicator.style.opacity = '0';
        return;
      }
      const box = active.getBoundingClientRect();
      indicator.style.opacity = '1';
      indicator.style.width = `${box.width}px`;
      indicator.style.transform = `translateX(${box.left - nav.getBoundingClientRect().left}px)`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname, tabsFit]);

  // Close open dropdowns on outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (![menuRef, siteMenuRef, moreRef].some((ref) => ref.current?.contains(target))) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  // Check for new leads every minute while the admin is on screen, and right
  // away when they come back to the tab.
  const watchLeads = canAccess(user, 'leads');
  useEffect(() => {
    if (!watchLeads) return;
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      const fresh = await refreshNotifications().catch(() => null);
      if (fresh) setFeed(fresh);
    };
    const timer = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [watchLeads]);

  const toggleNotifications = () => {
    if (menu === 'notifications') return setMenu(null);
    setMenu('notifications');
    setHighlightAfter(feed.seenAt ?? '');
    if (!unseen) return;
    // Opening the bell counts as seeing these: the red dot goes away until a newer lead arrives.
    setFeed((f) => ({ ...f, seenAt: f.items[0]?.createdAt ?? f.seenAt }));
    markNotificationsSeen()
      .then((at) => at && setFeed((f) => ({ ...f, seenAt: at })))
      .catch(() => {});
  };

  const isSuperadmin = user.role === 'superadmin';
  const site = sites.find((s) => s.id === siteId) ?? null;
  // CMO Speaker profiles only exist on websites that use them.
  const hasModule = (section: AdminSection | 'users' | 'sites') =>
    section !== 'leaders' || Boolean(site?.modules.includes(section));
  const allowed = (section: AdminSection | 'users' | 'sites') =>
    (section === 'users' || section === 'sites' ? isSuperadmin : canAccess(user, section)) && hasModule(section);
  const canLeads = allowed('leads');
  const topTabs = TOP_TABS.filter((tab) => allowed(tab.section));
  const shownTabs = topTabs.slice(0, tabsFit);
  const moreTabs = topTabs.slice(tabsFit);
  const moreActive = moreTabs.some((tab) => isActive(pathname, tab.href));

  const sideNav = [
    { label: 'Dashboard', href: '/admin', icon: IconGrid, section: 'dashboard' as const },
    { label: 'Leads Inbox', href: '/admin/leads', icon: IconInbox, section: 'leads' as const, badge: feed.count, hot: unseen },
    { label: 'CMO Speakers', href: '/admin/speakers', icon: IconMic, section: 'leaders' as const, badge: speakerCount },
    { label: 'Content Editor', href: '/admin/content', icon: IconEdit, section: 'content' as const },
    { label: 'Videos & PDFs', href: '/admin/media', icon: IconVideo, section: 'media' as const },
    { label: 'Settings', href: '/admin/settings', icon: IconSettings, section: 'settings' as const },
    { label: 'Websites', href: '/admin/sites', icon: IconGlobe, section: 'sites' as const },
    { label: 'Users & Access', href: '/admin/users', icon: IconShield, section: 'users' as const },
  ].filter((item) => allowed(item.section));

  const switchSite = async (id: string) => {
    setMenu(null);
    if (id === (siteId ?? ALL_SITES)) return;
    setSwitching(true);
    const res = await selectAdminSite(id);
    setSwitching(false);
    if (!res.success) alert(res.error);
    router.refresh();
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/admin/leads?q=${encodeURIComponent(q)}` : '/admin/leads');
  };

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      {/* ---------- Top bar ---------- */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
          </button>
          <Link href="/admin" className={styles.brandLink}>
            <span className={styles.brandMark}>
              <Image src="/brand/logo.png" alt="" fill sizes="38px" style={{ objectFit: 'contain' }} />
            </span>
            <span className={styles.brandText}>
              <strong>CX Assembly</strong>
              <small>Admin Console</small>
            </span>
          </Link>
        </div>

        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.railToggle}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconSidebar size={20} />
          </button>

          <div className={styles.dropdownWrap} ref={siteMenuRef}>
            <button
              type="button"
              className={styles.siteButton}
              onClick={() => setMenu(menu === 'site' ? null : 'site')}
              aria-expanded={menu === 'site'}
              aria-haspopup="menu"
              aria-label={`Website: ${site?.name ?? 'All websites'}. Change website`}
              disabled={switching}
            >
              <span className={styles.siteMark}>{site ? siteInitials(site.name) : <IconGlobe size={16} />}</span>
              <span className={styles.siteText}>
                <small>{switching ? 'Switching…' : 'Website'}</small>
                <strong>{site?.name ?? 'All websites'}</strong>
              </span>
              <IconChevronDown size={16} className={`${styles.chevron} ${menu === 'site' ? styles.chevronOpen : ''}`} />
            </button>
            {menu === 'site' && (
              <div className={`${styles.dropdown} ${styles.dropdownLeft}`} role="menu">
                <div className={styles.dropdownHead}>
                  <strong>Manage website</strong>
                  <span>{sites.length}</span>
                </div>
                {sites.length > 1 && (
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={siteId === null}
                    className={`${styles.menuItem} ${styles.siteOption}`}
                    onClick={() => switchSite(ALL_SITES)}
                  >
                    <IconGlobe size={16} />
                    <span>All websites</span>
                    {siteId === null && <IconCheck size={16} />}
                  </button>
                )}
                {sites.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={s.id === siteId}
                    className={`${styles.menuItem} ${styles.siteOption}`}
                    onClick={() => switchSite(s.id)}
                  >
                    <span className={styles.siteMark} style={{ width: 24, height: 24, borderRadius: 7, fontSize: '0.625rem' }}>
                      {siteInitials(s.name)}
                    </span>
                    <span>{s.name}</span>
                    {s.id === siteId && <IconCheck size={16} />}
                  </button>
                ))}
                {isSuperadmin && (
                  <Link href="/admin/sites" className={styles.dropdownFoot} onClick={() => setMenu(null)}>
                    Add or manage websites →
                  </Link>
                )}
              </div>
            )}
          </div>

          {canLeads && (
            <form className={styles.search} onSubmit={onSearch} role="search">
              <IconSearch size={16} />
              <input
                type="search"
                placeholder="Search applicants…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search applicants"
              />
              <kbd>↵</kbd>
            </form>
          )}

          <nav className={styles.tabs} ref={tabsRef} aria-label="Primary">
            {shownTabs.map((tab) => {
              const active = isActive(pathname, tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  data-active={active}
                  className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
            {moreTabs.length > 0 && (
              <div className={`${styles.dropdownWrap} ${styles.moreWrap}`} ref={moreRef}>
                <button
                  type="button"
                  data-active={moreActive}
                  className={`${styles.tab} ${moreActive ? styles.tabActive : ''}`}
                  onClick={() => setMenu(menu === 'more' ? null : 'more')}
                  aria-expanded={menu === 'more'}
                  aria-haspopup="menu"
                >
                  More
                  <IconChevronDown size={16} className={`${styles.chevron} ${menu === 'more' ? styles.chevronOpen : ''}`} />
                </button>
                {menu === 'more' && (
                  <div className={`${styles.dropdown} ${styles.dropdownMore}`} role="menu">
                    {moreTabs.map((tab) => {
                      const active = isActive(pathname, tab.href);
                      return (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          role="menuitem"
                          className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setMenu(null)}
                        >
                          {tab.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <span ref={indicatorRef} className={styles.tabIndicator} aria-hidden="true" />
            {/* Hidden copy of every tab (and More) used to measure what fits. */}
            <div ref={measureRef} className={styles.tabsMeasure} aria-hidden="true">
              {topTabs.map((tab) => (
                <span key={tab.href} className={`${styles.tab} ${styles.tabActive}`}>
                  {tab.label}
                </span>
              ))}
              <span className={`${styles.tab} ${styles.tabActive}`}>
                More
                <IconChevronDown size={16} />
              </span>
            </div>
          </nav>

          <div className={styles.actions} ref={menuRef}>
            {canLeads && (
              <div className={styles.dropdownWrap}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={toggleNotifications}
                  aria-label={`Notifications${feed.count ? `, ${feed.count} waiting for review` : ''}${unseen ? ', new since you last looked' : ''}`}
                  aria-expanded={menu === 'notifications'}
                >
                  <IconBell size={20} />
                  {unseen && <span className={styles.bellDot} />}
                </button>
                {menu === 'notifications' && (
                  <div className={`${styles.dropdown} ${styles.dropdownWide}`} role="menu">
                    <div className={styles.dropdownHead}>
                      <strong>Notifications</strong>
                      <span>{feed.count} waiting for review</span>
                    </div>
                    {feed.items.length === 0 ? (
                      <p className={styles.dropdownEmpty}>You&apos;re all caught up.</p>
                    ) : (
                      feed.items.map((lead, i) => (
                        <Link
                          key={lead.id}
                          href={`/admin/leads?lead=${encodeURIComponent(lead.id)}`}
                          className={`${styles.notifItem} ${lead.createdAt > highlightAfter ? styles.notifUnseen : ''}`}
                          style={{ '--i': i } as React.CSSProperties}
                          onClick={() => setMenu(null)}
                          role="menuitem"
                        >
                          <span className={styles.avatarSm} style={{ background: avatarGradient(lead.name) }}>
                            {initials(lead.name)}
                          </span>
                          <span className={styles.notifText}>
                            <strong>{lead.name}</strong> {lead.kind === 'pdf' ? 'downloaded a PDF' : 'submitted an application'}
                            <small>{lead.meta}</small>
                          </span>
                        </Link>
                      ))
                    )}
                    <Link href="/admin/leads" className={styles.dropdownFoot} onClick={() => setMenu(null)}>
                      Open leads inbox →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className={styles.dropdownWrap}>
              <button
                type="button"
                className={styles.userButton}
                onClick={() => setMenu(menu === 'user' ? null : 'user')}
                aria-expanded={menu === 'user'}
                aria-label={`Account menu for ${user.name}`}
                title={user.name}
              >
                <span className={styles.avatar} style={{ background: avatarGradient(user.email) }}>
                  {initials(user.name)}
                </span>
              </button>
              {menu === 'user' && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHead}>
                    <span className={styles.userEmail}>
                      <strong>{user.name}</strong>
                      <br />
                      {user.email}
                    </span>
                    <span className={styles.roleTag}>{ROLE_LABEL[user.role]}</span>
                  </div>
                  {site?.url && (
                    <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.menuItem} role="menuitem">
                      <IconExternal size={16} /> View {site.name}
                    </a>
                  )}
                  {isSuperadmin && (
                    <Link href="/admin/users" className={styles.menuItem} role="menuitem" onClick={() => setMenu(null)}>
                      <IconShield size={16} /> Users &amp; access
                    </Link>
                  )}
                  {allowed('settings') && (
                    <Link href="/admin/settings" className={styles.menuItem} role="menuitem" onClick={() => setMenu(null)}>
                      <IconSettings size={16} /> Site settings
                    </Link>
                  )}
                  <form action={logoutAdminAction}>
                    <button type="submit" className={`${styles.menuItem} ${styles.menuDanger}`} role="menuitem">
                      <IconLogout size={16} /> Log out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* ---------- Sidebar ---------- */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Admin navigation">
          <nav className={styles.sideNav}>
            {sideNav.map((item, i) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.sideItem} ${active ? styles.sideItemActive : ''}`}
                  style={{ '--i': i } as React.CSSProperties}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  data-label={item.label}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.sideIcon}>
                    <Icon size={18} />
                  </span>
                  <span className={styles.sideLabel}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`${styles.badge} ${item.hot ? styles.badgeHot : ''}`}>
                      {item.badge}
                      {item.hot && <span className={styles.badgeSuffix}> new</span>}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className={styles.scrim}
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main ref={mainRef} className={styles.main}>
          {/* Keyed by route so every page gets the entrance animation. */}
          <div key={pathname} className={styles.page}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
