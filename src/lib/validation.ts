import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required (min 2 characters)'),
  designation: z.string().trim().min(2, 'Designation / Title is required'),
  company: z.string().trim().min(2, 'Company name is required'),
  email: z.string().trim().email('Please enter a valid email address'),
  type: z.enum(['cx_leader', 'partner', 'other']),
  linkedinUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  message: z.string().trim().optional().or(z.literal('')),
  honeypot: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadSourceSchema = z.object({
  cta: optionalText(80),
  page: optionalText(300),
  referrer: optionalText(500),
});

/**
 * Leads posted by other websites through the API. Only name and email are
 * required, since each site's form asks for different things; anything
 * site-specific goes in `extra`.
 */
export const apiLeadSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName is required (min 2 characters)').max(120),
  email: z.string().trim().email('email must be a valid email address').max(200),
  designation: optionalText(120),
  company: optionalText(160),
  type: z.enum(['cx_leader', 'partner', 'other']).default('other'),
  linkedinUrl: z.string().trim().url('linkedinUrl must be a URL').max(300).optional().or(z.literal('')),
  phone: optionalText(40),
  message: optionalText(5000),
  source: leadSourceSchema.optional(),
  extra: z
    .record(z.string().max(60), z.string().max(2000))
    .refine((o) => Object.keys(o).length <= 30, 'extra can have at most 30 fields')
    .optional(),
  /** Honeypot: real visitors leave it empty. */
  hp_field: z.string().optional(),
});

export type ApiLeadInput = z.infer<typeof apiLeadSchema>;
