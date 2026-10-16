/** Optional per-site features: the original site's speaker roster. */
export type SiteModule = 'leaders';

/** A website managed from this dashboard. */
export interface Site {
  id: string;
  name: string;
  /** Public URL of the website, e.g. https://thecxassembly.com */
  url?: string;
  /** Browser origins allowed to post leads directly to the API. */
  allowedOrigins: string[];
  modules: SiteModule[];
  /** The site this app itself renders. Defined in code and can't be removed. */
  builtIn?: boolean;
  /** First characters of the API key, so admins can tell keys apart. */
  apiKeyPrefix?: string;
  createdAt?: string;
  updatedAt?: string;
}
