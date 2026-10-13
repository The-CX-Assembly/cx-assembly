'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/lib/firebase-admin';
import { Leader, CommunityVoice, SiteSettings, LeadStatus } from '@/types';

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) updateData.notes = notes;

    await db.collection('leads').doc(leadId).update(updateData);
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error: 'Failed to update lead status' };
  }
}

export async function updateSectionContent(
  sectionKey: string,
  data: Record<string, unknown>
) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('siteContent').doc(sectionKey).set(data, { merge: true });
    revalidatePath('/');
    revalidatePath('/founding-50');
    revalidatePath('/community-voices');
    revalidatePath('/privacy-policy');
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error) {
    console.error('Error updating section content:', error);
    return { success: false, error: 'Failed to update content' };
  }
}

export async function saveLeader(leader: Omit<Leader, 'id'> & { id?: string }) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = leader;
    const now = new Date().toISOString();

    if (id && !id.startsWith('temp-')) {
      await db
        .collection('leaders')
        .doc(id)
        .set({ ...data, updatedAt: now }, { merge: true });
    } else {
      await db.collection('leaders').add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath('/');
    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error saving leader:', error);
    return { success: false, error: 'Failed to save leader' };
  }
}

export async function deleteLeader(leaderId: string) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('leaders').doc(leaderId).delete();
    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting leader:', error);
    return { success: false, error: 'Failed to delete leader' };
  }
}

export async function reorderLeaders(orderedIds: string[]) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const batch = db.batch();
    orderedIds.forEach((id, index) => {
      const ref = db.collection('leaders').doc(id);
      batch.update(ref, { order: index + 1 });
    });
    await batch.commit();

    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error reordering leaders:', error);
    return { success: false, error: 'Failed to reorder leaders' };
  }
}

export async function saveVoice(voice: Omit<CommunityVoice, 'id'> & { id?: string }) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = voice;
    if (id && !id.startsWith('temp-')) {
      await db.collection('voices').doc(id).set(data, { merge: true });
    } else {
      await db.collection('voices').add(data);
    }

    revalidatePath('/community-voices');
    revalidatePath('/admin/voices');
    return { success: true };
  } catch (error) {
    console.error('Error saving community voice:', error);
    return { success: false, error: 'Failed to save voice' };
  }
}

export async function deleteVoice(voiceId: string) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('voices').doc(voiceId).delete();
    revalidatePath('/community-voices');
    revalidatePath('/admin/voices');
    return { success: true };
  } catch (error) {
    console.error('Error deleting voice:', error);
    return { success: false, error: 'Failed to delete voice' };
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('settings').doc('general').set(settings, { merge: true });
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
