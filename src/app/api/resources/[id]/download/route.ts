import { Readable } from 'node:stream';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminBucket, getAdminDb } from '@/server/firebase-admin';
import { siteCollection } from '@/features/sites/server';
import { getResource, verifyDownloadToken } from '@/features/media/server';

/**
 * GET /api/resources/:id/download?t=<token>
 * Streams a private PDF to a visitor who has just filled in the form. The token
 * (from requestResource) names this PDF and expires after 15 minutes.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get('t') ?? '';
  const grant = verifyDownloadToken(token);
  if (!grant || grant.resourceId !== id) {
    return new Response('This download link has expired. Please request the document again.', { status: 403 });
  }

  const resource = await getResource(grant.siteId, id);
  const bucket = getAdminBucket();
  if (!resource || !resource.published || !bucket) return new Response('Not found', { status: 404 });

  const file = bucket.file(resource.storagePath);
  const [exists] = await file.exists();
  if (!exists) return new Response('Not found', { status: 404 });

  // Count downloads; never let a counting hiccup block the file.
  const db = getAdminDb();
  if (db) {
    siteCollection(db, grant.siteId, 'resources')
      .doc(id)
      .update({ downloads: FieldValue.increment(1) })
      .catch((e) => console.warn('Could not count download:', e));
  }

  const safeName = resource.fileName.replace(/[^a-zA-Z0-9._ -]/g, '_') || 'document.pdf';
  return new Response(Readable.toWeb(file.createReadStream()) as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
