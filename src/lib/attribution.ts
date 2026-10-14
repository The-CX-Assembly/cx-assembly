// Browser-only: remembers where a visit came from so a lead submitted pages
// later is still credited to the campaign link the visitor arrived on.

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** External page that linked here (empty for direct visits). */
  referrer?: string;
  /** First page of the visit. */
  landing_page?: string;
}

const KEY = 'cx_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export function readAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}') as Attribution;
  } catch {
    return {};
  }
}

/**
 * Call on page load. A link with campaign tags always wins (the latest campaign
 * gets the credit); otherwise the first page of the visit is kept.
 */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tagged = UTM_KEYS.some((k) => params.get(k));
    if (!tagged && sessionStorage.getItem(KEY)) return;

    let referrer = '';
    try {
      // Only outside sites count; moving between our own pages isn't a source.
      if (document.referrer && new URL(document.referrer).host !== window.location.host) referrer = document.referrer;
    } catch {}

    const data: Attribution = { referrer, landing_page: window.location.pathname };
    for (const k of UTM_KEYS) {
      const v = params.get(k)?.trim();
      if (v) data[k] = v.slice(0, 150);
    }
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage blocked (private mode, etc.): the lead just won't carry campaign data.
  }
}
