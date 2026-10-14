'use server';

import { leadSchema } from '@/lib/validation';
import { saveLead } from '@/lib/leads';
import { DEFAULT_SITE_ID } from '@/lib/site-constants';

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
    message:
      'Thank you for submitting your application! The CX Assembly curates each membership carefully and our team will get in touch with you shortly.',
  };
}
