'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { selectAdminSite } from '@/features/sites/actions';
import { ALL_SITES } from '@/features/sites/constants';
import type { SiteModule } from '@/types';
import { logoutAdminAction } from '@/features/auth/actions';
import type { ShellLead } from '@/features/dashboard/stats';
import { AdminAccess, AdminSection, ROLE_LABEL, canAccess } from '@/features/auth/sections';
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
  IconStar,
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
  newLeadsCount: number;
  speakerCount: number;
  newLeads: ShellLead[];
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
  newLeadsCount,
  speakerCount,
  newLeads,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop sidebar starts as an icon-only rail.
  const [collapsed, setCollapsed] = useState(true);
  const [menu, setMenu] = useState<'notifications' | 'user' | 'site' | null>(null);
  const [switching, setSwitching] = useState(false);
  const [query, setQuery] = useState('');

  const tabsRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const siteMenuRef = useRef<HTMLDivElement>(null);

  // Slide the tab underline under the active tab (and keep it there on resize).
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
      indicator.style.opacity = '1';
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname]);

  // Close open dropdowns on outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !siteMenuRef.current?.contains(target)) setMenu(null);
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

  const isSuperadmin = user.role === 'superadmin';
  const site = sites.find((s) => s.id === siteId) ?? null;
  // CMO Speaker profiles only exist on websites that use them.
  const hasModule = (section: AdminSection | 'users' | 'sites') =>
    section !== 'leaders' || Boolean(site?.modules.includes(section));
  const allowed = (section: AdminSection | 'users' | 'sites') =>
    (section === 'users' || section === 'sites' ? isSuperadmin : canAccess(user, section)) && hasModule(section);
  const canLeads = allowed('leads');
  const topTabs = TOP_TABS.filter((tab) => allowed(tab.section));

  const sideNav = [
    { label: 'Dashboard', href: '/admin', icon: IconGrid, section: 'dashboard' as const },
    { label: 'Leads Inbox', href: '/admin/leads', icon: IconInbox, section: 'leads' as const, badge: newLeadsCount, hot: newLeadsCount > 0 },
    { label: 'CMO Speakers', href: '/admin/speakers', icon: IconStar, section: 'leaders' as const, badge: speakerCount },
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
            {topTabs.map((tab) => {
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
            <span ref={indicatorRef} className={styles.tabIndicator} aria-hidden="true" />
          </nav>

          <div className={styles.actions} ref={menuRef}>
            {canLeads && (
              <div className={styles.dropdownWrap}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}
                  aria-label={`Notifications${newLeadsCount ? `, ${newLeadsCount} new applications` : ''}`}
                  aria-expanded={menu === 'notifications'}
                >
                  <IconBell size={20} />
                  {newLeadsCount > 0 && <span className={styles.bellDot} />}
                </button>
                {menu === 'notifications' && (
                  <div className={`${styles.dropdown} ${styles.dropdownWide}`} role="menu">
                    <div className={styles.dropdownHead}>
                      <strong>Notifications</strong>
                      <span>{newLeadsCount} new</span>
                    </div>
                    {newLeads.length === 0 ? (
                      <p className={styles.dropdownEmpty}>You&apos;re all caught up.</p>
                    ) : (
                      newLeads.map((lead, i) => (
                        <Link
                          key={lead.id}
                          href={`/admin/leads?q=${encodeURIComponent(lead.name)}`}
                          className={styles.notifItem}
                          style={{ '--i': i } as React.CSSProperties}
                          onClick={() => setMenu(null)}
                          role="menuitem"
                        >
                          <span className={styles.avatarSm} style={{ background: avatarGradient(lead.name) }}>
                            {initials(lead.name)}
                          </span>
                          <span className={styles.notifText}>
                            <strong>{lead.name}</strong> submitted an application
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

        <main className={styles.main}>
          {/* Keyed by route so every page gets the entrance animation. */}
          <div key={pathname} className={styles.page}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
