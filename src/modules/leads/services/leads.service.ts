import 'server-only';
import { getAdminDb } from '@/config/firebase-admin';
import { Lead } from '../models/lead.model';

export type NewLead = Omit<Lead, 'id' | 'status' | 'notes' | 'createdAt'>;

export type SaveLeadResult = { ok: true; id: string } | { ok: false; error: string };

/** Firestore rejects undefined values, and blank optional fields aren't worth storing. */
function compact<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && !(typeof v === 'object' && v && !Object.keys(v).length)),
  ) as Partial<T>;
}

/**
 * Stores a lead for any website. Failures are reported, never swallowed: a
 * visitor must not be told "application received" when nothing was saved.
 */
export async function saveLead(lead: NewLead): Promise<SaveLeadResult> {
  const db = getAdminDb();
  if (!db) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Lead not saved: Firestore is not configured.');
      return { ok: false, error: 'Database not connected' };
    }
    console.info('Local dev lead submission (no Admin DB configured):', lead);
    return { ok: true, id: 'local-dev' };
  }

  try {
    const ref = await db.collection('leads').add({
      ...compact({ ...lead, source: lead.source ? compact(lead.source) : undefined }),
      // Kept even when empty so the inbox can always show and search them.
      designation: lead.designation ?? '',
      company: lead.company ?? '',
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    return { ok: true, id: ref.id };
  } catch (error) {
    console.error('Error writing lead to Firestore:', error);
    return { ok: false, error: 'Could not save the lead' };
  }
}
