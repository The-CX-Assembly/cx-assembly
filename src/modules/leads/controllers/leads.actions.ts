'use server';

import { revalidatePath } from 'next/cache';
import { leadSchema } from '../models/lead.schema';
import { saveLead } from '../services/leads.service';
import { DEFAULT_SITE_ID } from '@/modules/sites/models/site.constants';
import { getAdminDb } from '@/config/firebase-admin';
import { NO_ACCESS, authorize } from '@/middlewares/auth.middleware';
import { LeadStatus } from '../models/lead.model';

export interface SubmitLeadState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  /** Echoed back on failure: React resets the form after every submission. */
  values?: Record<string, string>;
}

const field = (formData: FormData, name: string, max = 300) =>
  (formData.get(name)?.toString() || '').trim().slice(0, max);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const echo = ({ honeypot, ...values }: Record<string, string>) => values;

export async function submitLead(
  prevState: SubmitLeadState | null,
  formData: FormData
): Promise<SubmitLeadState> {
  const rawData = {
    fullName: formData.get('fullName')?.toString() || '',
    designation: formData.get('designation')?.toString() || '',
    company: formData.get('company')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    type: formData.get('type')?.toString() || 'cx_leader',
    linkedinUrl: formData.get('linkedinUrl')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
    message: formData.get('message')?.toString() || '',
    honeypot: formData.get('hp_field')?.toString() || '',
  };

  const validation = leadSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Please review and correct the errors below.',
      errors: fieldErrors,
      values: echo(rawData),
    };
  }

  const { honeypot, ...validLead } = validation.data;

  // Bot check
  if (honeypot && honeypot.length > 0) {
    // Pretend success so bots do not retry with alternate formats
    return {
      success: true,
      message: 'Your application has been received.',
    };
  }

  const saved = await saveLead({
    ...validLead,
    siteId: DEFAULT_SITE_ID,
    source: {
      cta: field(formData, 'source_cta', 80),
      page: field(formData, 'source_page'),
      referrer: field(formData, 'source_referrer', 500),
      landingPage: field(formData, 'source_landing_page'),
      utmSource: field(formData, 'utm_source', 100),
      utmMedium: field(formData, 'utm_medium', 100),
      utmCampaign: field(formData, 'utm_campaign', 150),
      utmTerm: field(formData, 'utm_term', 150),
      utmContent: field(formData, 'utm_content', 150),
    },
  });

  if (!saved.ok) {
    return {
      success: false,
      message:
        'Sorry, we couldn’t submit your application just now. Please try again in a moment, or email us at contact@thecxassembly.com.',
      values: echo(rawData),
    };
  }

  return {
    success: true,
    message: 'The CX Assembly curates each application carefully and our team will get in touch with you shortly.',
  };
}

/** Admin: moves a lead through the pipeline (new → reviewed → approved / rejected). */
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  if (!(await authorize('leads'))) return { success: false, error: NO_ACCESS };
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
