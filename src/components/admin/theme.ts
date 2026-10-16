/**
 * Admin colour theme. "system" follows the computer's light/dark setting.
 * Kept in a cookie (not localStorage) so the server renders the right theme
 * on the first paint, with no flash of the other one.
 */
export type AdminTheme = 'light' | 'dark' | 'system';

export const THEME_COOKIE = 'cx_admin_theme';

export const THEMES: { value: AdminTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const parseTheme = (value: string | undefined): AdminTheme =>
  value === 'light' || value === 'dark' ? value : 'system';

/** Remembers the choice for a year, for every admin page. */
export function saveTheme(theme: AdminTheme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/admin; max-age=31536000; samesite=lax`;
}
