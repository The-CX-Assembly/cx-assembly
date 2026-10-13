export type InterestType = 'cx_leader' | 'partner' | 'other';
export type LeadStatus = 'new' | 'reviewed' | 'approved' | 'rejected';

export interface Leader {
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

export interface Lead {
  id: string;
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
