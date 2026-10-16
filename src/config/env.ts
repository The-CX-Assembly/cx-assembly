// Shared by server and client: which deployment this build is.

export type AppEnv = 'production' | 'staging' | 'development';

/**
 * Set NEXT_PUBLIC_APP_ENV=staging on the staging backend (apphosting.staging.yaml).
 * Unset, a production build counts as production and `next dev` as development.
 */
export const APP_ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

/** Staging is hidden from search engines, skips analytics and shows a banner. */
export const IS_STAGING = APP_ENV === 'staging';
