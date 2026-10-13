'use server';

import { leadSchema } from '@/lib/validation';
import { getAdminDb } from '@/lib/firebase-admin';

export interface SubmitLeadState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

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

  const db = getAdminDb();
  if (db) {
    try {
      await db.collection('leads').add({
        ...validLead,
        status: 'new',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error writing lead to Firestore:', error);
      // Even if Firestore fails temporarily in offline dev, don't break the client UX
    }
  } else {
    console.info('Local dev lead submission (no Admin DB configured):', validLead);
  }

  return {
    success: true,
    message:
      'Thank you for submitting your application! The CX Assembly curates each membership carefully and our team will get in touch with you shortly.',
  };
}
