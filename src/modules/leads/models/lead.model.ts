export type InterestType = 'cx_leader' | 'partner' | 'other';
export type LeadStatus = 'new' | 'reviewed' | 'approved' | 'rejected';

/** Where on a website a lead came from. */
export interface LeadSource {
  /** Which call-to-action was used, e.g. "hero", "navbar", "footer". */
  cta?: string;
  /** Path of the page the form was submitted from. */
  page?: string;
  /** Where the visitor came from before reaching the website (external sites only). */
  referrer?: string;
  /** First page of the visit, e.g. a campaign landing page. */
  landingPage?: string;
  /** Campaign tags from the link the visitor arrived on (?utm_source=…). */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface Lead {
  id: string;
  /** The website this lead came from. Older leads have none and belong to the original site. */
  siteId?: string;
  source?: LeadSource;
  /** Extra form fields a website collects beyond the standard ones. */
  extra?: Record<string, string>;
  type: InterestType;
  fullName: string;
  designation: string;
  company: string;
  email: string;
  linkedinUrl?: string;
  phone?: string;
  message?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
}
