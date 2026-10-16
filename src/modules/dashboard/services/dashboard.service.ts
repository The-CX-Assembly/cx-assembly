import 'server-only';
import { cache } from 'react';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminDb } from '@/config/firebase-admin';
import { siteCollection } from '@/modules/sites/services/sites.service';
import { DEFAULT_SITE_ID } from '@/modules/sites/models/site.constants';
import { sampleSpeakers } from '@/modules/content/models/content.defaults';
import { InterestType, Lead, LeadSource, LeadStatus } from '@/modules/leads/models/lead.model';

import { TZ, timeAgo } from '@/utils/format';

// Day/month buckets follow IST (see lib/format.ts).
export { timeAgo };
const DAY_MS = 24 * 60 * 60 * 1000;

export type TrendRange = 'week' | 'month' | 'year';
export type MixRange = 'all' | 'month' | 'week';
export type PipelineFilter = 'all' | 'cx_leader' | 'partner';

export interface SeriesPoint {
  label: string;
  tooltip: string;
  value: number;
}

export interface PipelineSlice {
  status: LeadStatus;
  count: number;
}

export interface MixSlice {
  type: InterestType;
  count: number;
}

/** All leads, newest first. Cached so the layout and page share one query per request. */
export const getAllLeads = cache(async (): Promise<Lead[]> => {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snap = await db.collection('leads').orderBy('createdAt', 'desc').get();
    const leads: Lead[] = [];
    snap.forEach((doc) => {
      leads.push({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
    });
    return leads;
  } catch (e) {
    console.warn('Could not load leads for admin stats:', e);
    return [];
  }
});

export interface ShellSummary {
  newLeads: Lead[];
  speakerCount: number;
}

/**
 * Just what the admin shell needs (badges + new-lead notifications), using
 * count and equality queries instead of loading whole collections on every admin page.
 * Leads come from every website, since the inbox is shared; the speaker count
 * is for the website being managed (`siteId`).
 */
export const getShellSummary = cache(async (siteId: string | null): Promise<ShellSummary> => {
  // Empty collections fall back to the sample content the original site shows.
  const usesSamples = siteId === DEFAULT_SITE_ID;
  const fallback = {
    newLeads: [],
    speakerCount: usesSamples ? sampleSpeakers.length : 0,
  };
  const db = getAdminDb();
  if (!db) return fallback;

  const countSpeakers = async () =>
    siteId ? (await siteCollection(db, siteId, 'leaders').count().get()).data().count : 0;

  try {
    const [newSnap, speakerCount] = await Promise.all([
      // Equality-only filter: needs no composite index, and the 'new' set stays small.
      db.collection('leads').where('status', '==', 'new').get(),
      countSpeakers(),
    ]);
    const toLead = (doc: QueryDocumentSnapshot) => ({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
    return {
      newLeads: newSnap.docs.map(toLead).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
      speakerCount: speakerCount || fallback.speakerCount,
    };
  } catch (e) {
    console.warn('Could not load admin shell summary:', e);
    return fallback;
  }
});

export function greeting(now = new Date()): string {
  const hour = Number(now.toLocaleString('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: TZ }));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function todayLabel(now = new Date()): string {
  return now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });
}

const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

function countBy(leads: Lead[], keyOf: (d: Date) => string) {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    if (!lead.createdAt) continue;
    const date = new Date(lead.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = keyOf(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function dailySeries(leads: Lead[], days: number, now: Date, labelStyle: 'weekday' | 'day'): SeriesPoint[] {
  const counts = countBy(leads, dayKey);
  const points: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * DAY_MS);
    points.push({
      label:
        labelStyle === 'weekday'
          ? date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: TZ })
          : date.toLocaleDateString('en-IN', { day: 'numeric', timeZone: TZ }),
      tooltip: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ }),
      value: counts.get(dayKey(date)) ?? 0,
    });
  }
  return points;
}

function monthlySeries(leads: Lead[], months: number, now: Date): SeriesPoint[] {
  const counts = countBy(leads, (d) => dayKey(d).slice(0, 7));
  const [year, month] = dayKey(now).split('-').map(Number);
  const points: SeriesPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    // Mid-month UTC noon keeps the IST conversion inside the same month.
    const date = new Date(Date.UTC(year, month - 1 - i, 15, 12));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    points.push({
      label: date.toLocaleDateString('en-IN', { month: 'short', timeZone: TZ }),
      tooltip: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: TZ }),
      value: counts.get(key) ?? 0,
    });
  }
  return points;
}

const STATUSES: LeadStatus[] = ['new', 'reviewed', 'approved', 'rejected'];
const TYPES: InterestType[] = ['cx_leader', 'partner', 'other'];

function pipelineFor(leads: Lead[]): PipelineSlice[] {
  return STATUSES.map((status) => ({ status, count: leads.filter((l) => l.status === status).length }));
}

function mixFor(leads: Lead[]): MixSlice[] {
  return TYPES.map((type) => ({ type, count: leads.filter((l) => l.type === type).length }));
}

function within(leads: Lead[], ms: number, now: Date) {
  const since = now.getTime() - ms;
  return leads.filter((l) => l.createdAt && new Date(l.createdAt).getTime() >= since);
}

// ---------- Lead sources (campaign attribution) ----------

export type SourceDimension = 'campaign' | 'channel' | 'button' | 'landing';

export interface SourceRow {
  label: string;
  leads: number;
  approved: number;
}

export interface SourceBreakdown {
  total: number;
  /** Leads that arrived on a link with campaign tags (utm_*). */
  tagged: number;
  rows: Record<SourceDimension, SourceRow[]>;
}

const NOT_TRACKED = 'Not tracked';
const MAX_ROWS = 6;

// Matched against utm_source first, then the referring site's host.
const CHANNELS: [RegExp, string][] = [
  [/linkedin|lnkd\.in/, 'LinkedIn'],
  [/google/, 'Google'],
  [/facebook|^fb$|fb\.|instagram|meta/, 'Meta (Facebook / Instagram)'],
  [/twitter|^t\.co$|(^|\.)x\.com$|^x$/, 'X (Twitter)'],
  [/whatsapp|wa\.me/, 'WhatsApp'],
  [/youtube|youtu\.be/, 'YouTube'],
  [/bing/, 'Bing'],
  [/mail|newsletter/, 'Email'],
];

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const titleCase = (v: string) => v.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Leads from before tracking existed carry no source at all. */
const isTracked = (s?: LeadSource): s is LeadSource => Boolean(s && (s.cta || s.page || s.landingPage || s.utmSource));

function channelOf(s?: LeadSource): string {
  if (!isTracked(s)) return NOT_TRACKED;
  const tag = s.utmSource?.trim().toLowerCase() ?? '';
  const host = s.referrer ? hostOf(s.referrer) : '';
  for (const probe of [tag, host]) {
    if (!probe) continue;
    const match = CHANNELS.find(([re]) => re.test(probe));
    if (match) return match[1];
  }
  if (s.utmMedium?.toLowerCase().includes('email')) return 'Email';
  if (tag) return titleCase(tag);
  if (host) return host;
  return 'Direct / unknown';
}

const LABEL: Record<SourceDimension, (s?: LeadSource) => string> = {
  campaign: (s) => (!isTracked(s) ? NOT_TRACKED : s.utmCampaign?.trim() || 'No campaign tag'),
  channel: channelOf,
  button: (s) => (s?.cta ? titleCase(s.cta) : NOT_TRACKED),
  landing: (s) => s?.landingPage || s?.page || NOT_TRACKED,
};

function rank(leads: Lead[], labelOf: (s?: LeadSource) => string): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  for (const lead of leads) {
    const label = labelOf(lead.source);
    const row = rows.get(label) ?? { label, leads: 0, approved: 0 };
    row.leads += 1;
    if (lead.status === 'approved') row.approved += 1;
    rows.set(label, row);
  }
  const sorted = [...rows.values()].sort((a, b) => b.leads - a.leads || a.label.localeCompare(b.label));
  if (sorted.length <= MAX_ROWS) return sorted;
  // Fold the long tail into one row so the list stays scannable.
  const rest = sorted.slice(MAX_ROWS - 1).reduce(
    (acc, r) => ({ ...acc, leads: acc.leads + r.leads, approved: acc.approved + r.approved }),
    { label: `${sorted.length - MAX_ROWS + 1} others`, leads: 0, approved: 0 },
  );
  return [...sorted.slice(0, MAX_ROWS - 1), rest];
}

function sourcesFor(leads: Lead[]): SourceBreakdown {
  return {
    total: leads.length,
    tagged: leads.filter((l) => l.source?.utmSource || l.source?.utmCampaign).length,
    rows: {
      campaign: rank(leads, LABEL.campaign),
      channel: rank(leads, LABEL.channel),
      button: rank(leads, LABEL.button),
      landing: rank(leads, LABEL.landing),
    },
  };
}

export function buildDashboard(leads: Lead[], now = new Date()) {
  return {
    sources: {
      all: sourcesFor(leads),
      month: sourcesFor(within(leads, 30 * DAY_MS, now)),
      week: sourcesFor(within(leads, 7 * DAY_MS, now)),
    } satisfies Record<MixRange, SourceBreakdown>,
    trend: {
      week: dailySeries(leads, 7, now, 'weekday'),
      month: dailySeries(leads, 30, now, 'day'),
      year: monthlySeries(leads, 12, now),
    } satisfies Record<TrendRange, SeriesPoint[]>,
    pipeline: {
      all: pipelineFor(leads),
      cx_leader: pipelineFor(leads.filter((l) => l.type === 'cx_leader')),
      partner: pipelineFor(leads.filter((l) => l.type === 'partner')),
    } satisfies Record<PipelineFilter, PipelineSlice[]>,
    mix: {
      all: mixFor(leads),
      month: mixFor(within(leads, 30 * DAY_MS, now)),
      week: mixFor(within(leads, 7 * DAY_MS, now)),
    } satisfies Record<MixRange, MixSlice[]>,
  };
}

export type DashboardData = ReturnType<typeof buildDashboard>;
