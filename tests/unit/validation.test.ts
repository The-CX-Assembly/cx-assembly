import { describe, expect, it } from 'vitest';
import { apiLeadSchema, leadSchema } from '@/modules/leads/models/lead.schema';

const validForm = {
  fullName: 'Asha Rao',
  designation: 'Head of CX',
  company: 'Acme',
  email: 'asha@acme.com',
  type: 'cx_leader',
};

describe('leadSchema (CX Assembly join form)', () => {
  it('accepts a complete application', () => {
    expect(leadSchema.safeParse(validForm).success).toBe(true);
  });

  it.each(['fullName', 'designation', 'company'])('requires %s', (field) => {
    const result = leadSchema.safeParse({ ...validForm, [field]: ' ' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(leadSchema.safeParse({ ...validForm, email: 'not-an-email' }).success).toBe(false);
  });

  it('flags a filled honeypot', () => {
    expect(leadSchema.safeParse({ ...validForm, honeypot: 'bot' }).success).toBe(false);
  });
});

describe('apiLeadSchema (leads from other websites)', () => {
  it('needs only a name and email, and defaults the type', () => {
    const result = apiLeadSchema.safeParse({ fullName: 'Jo Lee', email: 'jo@x.com' });
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('other');
  });

  it('keeps campaign tags and extra fields', () => {
    const result = apiLeadSchema.safeParse({
      fullName: 'Jo Lee',
      email: 'jo@x.com',
      source: { cta: 'hero', utmSource: 'linkedin', utmCampaign: 'launch' },
      extra: { city: 'Mumbai' },
    });
    expect(result.success).toBe(true);
    expect(result.data?.source?.utmCampaign).toBe('launch');
    expect(result.data?.extra).toEqual({ city: 'Mumbai' });
  });

  it('limits extra fields to 30', () => {
    const extra = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`f${i}`, 'x']));
    expect(apiLeadSchema.safeParse({ fullName: 'Jo Lee', email: 'jo@x.com', extra }).success).toBe(false);
  });

  it('rejects a malformed LinkedIn URL', () => {
    expect(apiLeadSchema.safeParse({ fullName: 'Jo Lee', email: 'jo@x.com', linkedinUrl: 'linkedin' }).success).toBe(
      false,
    );
  });
});
