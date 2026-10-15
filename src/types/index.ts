import type { AdminRole, AdminSection } from '@/features/auth/sections';

export type InterestType = 'cx_leader' | 'partner' | 'other';
export type LeadStatus = 'new' | 'reviewed' | 'approved' | 'rejected';

/** A CMO Speaker profile (stored in the "leaders" collection). */
export interface Speaker {
  id: string;
  name: string;
  designation: string;
  company: string;
  photoUrl: string;
  linkedinUrl?: string;
  bio?: string;
  order: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface CommunityVoice {
  id: string;
  quote: string;
  name: string;
  designation: string;
  company: string;
  photoUrl?: string;
  order: number;
  published: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  linkedinUrl: string;
  contactEmail: string;
  credibilityText: string;
  foundingCount: string;
}

export interface SectionHero {
  headline: string;
  subheadline: string;
  tagline: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
}

export interface SectionWhyWeExist {
  badge: string;
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  conclusion: string;
}

export interface SectionPhilosophy {
  badge: string;
  headline: string;
  intro?: string;
  pillars: Array<{
    title: string;
    description: string;
  }>;
}

export interface SectionForLeaders {
  badge: string;
  headline: string;
  subheadline: string;
  callout: string;
  takeaways: string[];
  closing?: string;
  ctaText: string;
  note: string;
}

export interface SectionForPartners {
  badge: string;
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  principle: string;
}

export interface SectionAboutUs {
  badge: string;
  headline: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  founderNote: string;
}

export interface SectionFounding50 {
  headline: string;
  subheadline: string;
  leadParagraph: string;
  description: string;
}

export interface SiteContent {
  hero: SectionHero;
  whyWeExist: SectionWhyWeExist;
  philosophy: SectionPhilosophy;
  forLeaders: SectionForLeaders;
  forPartners: SectionForPartners;
  aboutUs: SectionAboutUs;
  founding50: SectionFounding50;
  privacyPolicy: string;
}

/** Optional per-site features: the original site's speaker roster. */
export type SiteModule = 'leaders';

/** A website managed from this dashboard. */
export interface Site {
  id: string;
  name: string;
  /** Public URL of the website, e.g. https://thecxassembly.com */
  url?: string;
  /** Browser origins allowed to post leads directly to the API. */
  allowedOrigins: string[];
  modules: SiteModule[];
  /** The site this app itself renders. Defined in code and can't be removed. */
  builtIn?: boolean;
  /** First characters of the API key, so admins can tell keys apart. */
  apiKeyPrefix?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A free-form content section for sites other than the original one. */
export type ContentFieldValue = string | string[];
export type ContentSections = Record<string, Record<string, ContentFieldValue>>;

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  sections: AdminSection[];
  active: boolean;
  /** Super admins defined in code; they can't be edited or removed from the UI. */
  builtIn?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}
