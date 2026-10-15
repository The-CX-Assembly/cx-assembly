'use server';

import { z } from 'zod';
import { saveLead } from '@/features/leads/server';
import { DEFAULT_SITE_ID } from '@/features/sites/constants';
import { createDownloadToken, getResource } from './server';

export interface ResourceRequestState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  /** Where to fetch the PDF from; valid for 15 minutes. */
  downloadUrl?: string;
  values?: Record<string, string>;
}

const requestSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Please enter a valid work email'),
  company: z.string().trim().min(2, 'Company name is required'),
  designation: z.string().trim().max(120).optional().or(z.literal('')),
});

const field = (formData: FormData, name: string, max = 300) => (formData.get(name)?.toString() || '').trim().slice(0, max);

/**
 * A visitor asks for a PDF: their details become a lead (tagged with the PDF and
 * where they came from) and they get a short-lived download link.
 */
export async function requestResource(_prev: ResourceRequestState | null, formData: FormData): Promise<ResourceRequestState> {
  const values = {
    fullName: field(formData, 'fullName', 120),
    email: field(formData, 'email', 200),
    company: field(formData, 'company', 160),
    designation: field(formData, 'designation', 120),
  };

  // Honeypot: pretend it worked so bots don't adapt.
  if (field(formData, 'hp_field')) return { success: true, message: 'Thanks! Your download is ready.' };

  const parsed = requestSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: 'Please check the highlighted fields.', errors: parsed.error.flatten().fieldErrors, values };
  }

  const resourceId = field(formData, 'resourceId', 100);
  const resource = resourceId ? await getResource(DEFAULT_SITE_ID, resourceId) : null;
  if (!resource || !resource.published) return { success: false, message: 'This document is no longer available.', values };

  const saved = await saveLead({
    ...parsed.data,
    designation: parsed.data.designation ?? '',
    type: 'other',
    siteId: DEFAULT_SITE_ID,
    message: `Downloaded “${resource.title}”`,
    source: {
      cta: 'pdf-download',
      page: field(formData, 'source_page'),
      referrer: field(formData, 'source_referrer', 500),
      landingPage: field(formData, 'source_landing_page'),
      utmSource: field(formData, 'utm_source', 100),
      utmMedium: field(formData, 'utm_medium', 100),
      utmCampaign: field(formData, 'utm_campaign', 150),
      utmTerm: field(formData, 'utm_term', 150),
      utmContent: field(formData, 'utm_content', 150),
    },
    extra: { resource: resource.title, resourceId: resource.id },
  });
  // Same rule as the join form: never hand out the file without recording the lead.
  if (!saved.ok) return { success: false, message: 'Sorry, something went wrong. Please try again in a moment.', values };

  const token = createDownloadToken(DEFAULT_SITE_ID, resource.id);
  if (!token) return { success: false, message: 'Downloads are unavailable right now. Please try again later.', values };

  return {
    success: true,
    message: 'Thanks! Your download is ready.',
    downloadUrl: `/api/resources/${resource.id}/download?t=${encodeURIComponent(token)}`,
  };
}
