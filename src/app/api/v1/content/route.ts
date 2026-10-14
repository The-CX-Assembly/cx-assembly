import { getAllLeadersAdmin, getAllVoicesAdmin, getContentSections, getSiteSettings } from '@/lib/content';
import { apiJson, authenticateSite, preflight } from '@/lib/public-api';

export const OPTIONS = preflight;

/**
 * GET /api/v1/content: everything a website needs to render, as edited in the
 * dashboard. Unpublished leaders and testimonials are left out.
 */
export async function GET(request: Request) {
  const auth = await authenticateSite(request);
  if ('response' in auth) return auth.response;
  const { site, origin } = auth;

  const [content, settings, leaders, voices] = await Promise.all([
    getContentSections(site.id),
    getSiteSettings(site.id),
    site.modules.includes('leaders') ? getAllLeadersAdmin(site.id) : Promise.resolve(undefined),
    site.modules.includes('voices') ? getAllVoicesAdmin(site.id) : Promise.resolve(undefined),
  ]);

  return apiJson(
    {
      site: { id: site.id, name: site.name, url: site.url ?? null },
      settings,
      content,
      ...(leaders && { leaders: leaders.filter((l) => l.published) }),
      ...(voices && { voices: voices.filter((v) => v.published) }),
    },
    200,
    origin,
  );
}
