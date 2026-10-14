import 'server-only';
import { NextResponse } from 'next/server';
import { getSiteByApiKey, isAllowedOrigin } from './sites';
import { Site } from '@/types';

/**
 * Shared plumbing for the /api/v1 endpoints other websites call.
 *
 * Auth: every request carries the site's API key in `x-api-key` (or
 * `Authorization: Bearer`). Server-to-server calls are preferred. Browser calls
 * also work if the page's origin is listed in that site's allowed origins.
 */

const CORS_METHODS = 'GET, POST, OPTIONS';
const CORS_HEADERS = 'Content-Type, X-Api-Key, Authorization';

function apiKeyFrom(request: Request) {
  const header = request.headers.get('x-api-key');
  if (header) return header.trim();
  const auth = request.headers.get('authorization');
  return auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function apiJson(body: unknown, status: number, origin: string | null = null) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...corsHeaders(origin) } });
}

/** Answers browser preflights for origins that some site has allowed. */
export async function preflight(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || !(await isAllowedOrigin(origin))) return new NextResponse(null, { status: 204 });
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

type AuthResult = { site: Site; origin: string | null } | { response: NextResponse };

/** Resolves the calling site from its API key and checks the browser origin, if any. */
export async function authenticateSite(request: Request): Promise<AuthResult> {
  const origin = request.headers.get('origin');
  const key = apiKeyFrom(request);
  if (!key) return { response: apiJson({ error: 'Missing API key. Send it in the x-api-key header.' }, 401) };

  const site = await getSiteByApiKey(key);
  if (!site) return { response: apiJson({ error: 'Invalid API key.' }, 401) };

  // Browsers always send Origin on cross-origin requests; servers usually don't.
  if (origin && !site.allowedOrigins.includes(origin)) {
    return {
      response: apiJson(
        { error: `Origin ${origin} is not allowed for this site. Add it under Websites in the dashboard.` },
        403,
      ),
    };
  }

  return { site, origin };
}
