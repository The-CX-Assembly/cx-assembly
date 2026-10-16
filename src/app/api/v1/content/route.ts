import { getContentSections, getSiteSettings } from '@/modules/content/services/content.service';
import { getAllSpeakersAdmin } from '@/modules/speakers/services/speakers.service';
import { apiJson, authenticateSite, preflight } from '@/middlewares/api-key.middleware';

export const OPTIONS = preflight;

/**
 * GET /api/v1/content: everything a website needs to render, as edited in the
 * dashboard. Unpublished speakers are left out.
 */
export async function GET(request: Request) {
  const auth = await authenticateSite(request);
  if ('response' in auth) return auth.response;
  const { site, origin } = auth;

  const [content, settings, speakers] = await Promise.all([
    getContentSections(site.id),
    getSiteSettings(site.id),
    site.modules.includes('leaders') ? getAllSpeakersAdmin(site.id) : Promise.resolve(undefined),
  ]);

  return apiJson(
    {
      site: { id: site.id, name: site.name, url: site.url ?? null },
      settings,
      content,
      ...(speakers && { speakers: speakers.filter((l) => l.published) }),
    },
    200,
    origin,
  );
}
