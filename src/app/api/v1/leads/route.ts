import { apiLeadSchema } from '@/features/leads/validation';
import { saveLead } from '@/features/leads/server';
import { apiJson, authenticateSite, preflight } from '@/features/sites/public-api';

export const OPTIONS = preflight;

/**
 * POST /api/v1/leads: stores a form submission from any managed website.
 * The lead's site comes from the API key, never from the request body.
 */
export async function POST(request: Request) {
  const auth = await authenticateSite(request);
  if ('response' in auth) return auth.response;
  const { site, origin } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiJson({ error: 'Body must be JSON.' }, 400, origin);
  }

  const parsed = apiLeadSchema.safeParse(body);
  if (!parsed.success) {
    return apiJson(
      {
        error: 'Invalid lead.',
        fields: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.') || '_', i.message])),
      },
      422,
      origin,
    );
  }

  const { hp_field, ...lead } = parsed.data;
  // Honeypot filled in: pretend it worked so bots don't adapt.
  if (hp_field) return apiJson({ ok: true }, 201, origin);

  const saved = await saveLead({
    ...lead,
    designation: lead.designation ?? '',
    company: lead.company ?? '',
    siteId: site.id,
  });
  if (!saved.ok) return apiJson({ error: 'Could not save the lead. Please retry.' }, 503, origin);

  return apiJson({ ok: true, id: saved.id }, 201, origin);
}
