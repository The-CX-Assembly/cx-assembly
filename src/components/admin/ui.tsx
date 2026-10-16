'use client';

/**
 * Shared admin UI kit: page header, stats, panels, toolbar, tabs, badges,
 * avatar, drawer, form fields, switch and toast. Styles in ui.module.css use
 * the --a-* theme tokens from AdminShell, so every admin page matches.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IconClose, IconSearch } from './AdminIcons';
import { avatarGradient, initials } from './avatar';
import styles from './ui.module.css';

export { styles as ui };

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

// ---------- Page header ----------

export function PageHeader({
  eyebrow,
  icon,
  title,
  count,
  description,
  actions,
}: {
  eyebrow?: string;
  icon?: React.ReactNode;
  title: string;
  count?: number;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.head}>
      <div>
        {eyebrow && (
          <span className={styles.eyebrow}>
            {icon}
            {eyebrow}
          </span>
        )}
        <h1 className={styles.title}>
          {title}
          {count !== undefined && <span className={styles.titleCount}>{count}</span>}
        </h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.headActions}>{actions}</div>}
    </header>
  );
}

// ---------- Stats ----------

export interface StatItem {
  label: string;
  value: number | string;
  color: string;
  /** Makes the card a button, e.g. to filter the list. */
  onClick?: () => void;
}

export function Stats({ items }: { items: StatItem[] }) {
  return (
    <div className={styles.stats} style={{ '--n': items.length } as React.CSSProperties}>
      {items.map((s, i) => {
        const style = { '--c': s.color, '--i': i } as React.CSSProperties;
        const body = (
          <>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </>
        );
        return s.onClick ? (
          <button key={s.label} type="button" className={styles.stat} style={style} onClick={s.onClick}>
            {body}
          </button>
        ) : (
          <div key={s.label} className={styles.stat} style={style}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Toolbar pieces ----------

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className={styles.search}>
      <IconSearch size={16} />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item) => {
        const on = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={on}
            className={cx(styles.tab, on && styles.tabOn)}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            {item.count !== undefined && <span className={styles.tabCount}>{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Badges ----------

export type Tone = 'blue' | 'green' | 'red' | 'amber' | 'violet' | 'gray';

// Theme tokens from AdminShell.module.css, so badges read well in light and dark mode.
export const TONES: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: 'var(--a-tone-blue-bg)', fg: 'var(--a-tone-blue)' },
  green: { bg: 'var(--a-tone-green-bg)', fg: 'var(--a-tone-green)' },
  red: { bg: 'var(--a-tone-red-bg)', fg: 'var(--a-tone-red)' },
  amber: { bg: 'var(--a-tone-amber-bg)', fg: 'var(--a-tone-amber)' },
  violet: { bg: 'var(--a-tone-violet-bg)', fg: 'var(--a-tone-violet)' },
  gray: { bg: 'var(--a-tone-gray-bg)', fg: 'var(--a-tone-gray)' },
};

export const toneStyle = (tone: Tone) => ({ '--bg': TONES[tone].bg, '--fg': TONES[tone].fg }) as React.CSSProperties;

export function Badge({ tone = 'gray', dot, children }: { tone?: Tone; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={cx(styles.badge, dot && styles.badgeDot)} style={toneStyle(tone)}>
      {children}
    </span>
  );
}

// ---------- Avatar ----------

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'md' | 'lg' | 'xl' }) {
  const px = size === 'xl' ? 88 : size === 'lg' ? 56 : 40;
  return (
    <span
      className={cx(styles.avatar, size === 'lg' && styles.avatarLg, size === 'xl' && styles.avatarXl)}
      style={src ? undefined : { background: avatarGradient(name || '?') }}
      aria-hidden="true"
    >
      {src ? <Image src={src} alt="" fill sizes={`${px}px`} style={{ objectFit: 'cover' }} /> : initials(name || '?')}
    </span>
  );
}

// ---------- Empty state ----------

export function EmptyState({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      {icon && <span className={styles.emptyIcon}>{icon}</span>}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

// ---------- Drawer ----------

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
  label,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Accessible name when the title isn't plain text. */
  label?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes; the page behind doesn't scroll; focus moves into the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
      >
        <div className={styles.drawerHead}>
          <div style={{ minWidth: 0 }}>
            <h2 className={styles.drawerTitle}>{title}</h2>
            {subtitle && <p className={styles.drawerSub}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
        {footer && <div className={styles.drawerFoot}>{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Forms ----------

export function Field({
  label,
  required,
  hint,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cx(styles.field, full && styles.full)}>
      <span className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </span>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={styles.switch}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    />
  );
}

// ---------- Toast ----------

/** A short message at the bottom of the screen. Returns [element, show]. */
export function useToast(): [React.ReactNode, (message: string, kind?: 'ok' | 'error') => void] {
  const [toast, setToast] = useState<{ message: string; kind: 'ok' | 'error' } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: 'ok' | 'error' = 'ok') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const node = toast ? (
    <div role="status" className={cx(styles.toast, toast.kind === 'error' && styles.toastError)}>
      {toast.message}
    </div>
  ) : null;
  return [node, show];
}
