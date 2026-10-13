import { z } from 'zod';

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
