import 'server-only';
import { cache } from 'react';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { sampleLeaders, sampleVoices } from './default-content';
import { InterestType, Lead, LeadStatus, Leader } from '@/types';

// The community is India-based, so day/month buckets follow IST rather than
// the server's (UTC) clock.
const TZ = 'Asia/Kolkata';
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

export interface ActivityItem {
  id: string;
  kind: 'cx_leader' | 'partner' | 'other' | 'leader';
  title: string;
  description: string;
  href: string;
  chips: string[];
  at: number;
}

export interface ShellLead {
  id: string;
  name: string;
  meta: string;
  status: LeadStatus;
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

export const getVoiceCounts = cache(async (): Promise<{ total: number; published: number }> => {
  const db = getAdminDb();
  const fallback = { total: sampleVoices.length, published: sampleVoices.length };
  if (!db) return fallback;

  try {
    const snap = await db.collection('voices').get();
    if (snap.empty) return fallback;
    let published = 0;
    snap.forEach((doc) => {
      if (doc.data().published) published += 1;
    });
    return { total: snap.size, published };
  } catch (e) {
    console.warn('Could not count voices:', e);
    return fallback;
  }
});

export interface ShellSummary {
  newLeads: Lead[];
  recentLeads: Lead[];
  leaderCount: number;
  voiceCount: number;
}

/**
 * Just what the admin shell needs (badges + recent lists), using count and
 * limit queries instead of loading whole collections on every admin page.
 */
export const getShellSummary = cache(async (): Promise<ShellSummary> => {
  const fallback = { newLeads: [], recentLeads: [], leaderCount: sampleLeaders.length, voiceCount: sampleVoices.length };
  const db = getAdminDb();
  if (!db) return fallback;

  try {
    const [newSnap, recentSnap, leaderAgg, voiceAgg] = await Promise.all([
      // Equality-only filter: needs no composite index, and the 'new' set stays small.
      db.collection('leads').where('status', '==', 'new').get(),
      db.collection('leads').orderBy('createdAt', 'desc').limit(6).get(),
      db.collection('leaders').count().get(),
      db.collection('voices').count().get(),
    ]);
    const toLead = (doc: QueryDocumentSnapshot) => ({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
    const leaderCount = leaderAgg.data().count;
    const voiceCount = voiceAgg.data().count;
    return {
      newLeads: newSnap.docs.map(toLead).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
      recentLeads: recentSnap.docs.map(toLead),
      // Empty collections fall back to the sample content the pages show.
      leaderCount: leaderCount || sampleLeaders.length,
      voiceCount: voiceCount || sampleVoices.length,
    };
  } catch (e) {
    console.warn('Could not load admin shell summary:', e);
    return fallback;
  }
});

export function timeAgo(iso: string | undefined, now = Date.now()): string {
  if (!iso) return 'Recently';
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return 'Recently';

  const minutes = Math.floor(Math.max(0, now - time) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: TZ });
}

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

const TYPE_LABEL: Record<InterestType, string> = {
  cx_leader: 'CX Leader',
  partner: 'Partner',
  other: 'General',
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  reviewed: 'Reviewing',
  approved: 'Approved',
  rejected: 'Archived',
};

export function buildShellLeads(leads: Lead[], now = Date.now()): ShellLead[] {
  return leads.slice(0, 6).map((lead) => ({
    id: lead.id,
    name: lead.fullName,
    meta: timeAgo(lead.createdAt, now),
    status: lead.status,
  }));
}

export function buildDashboard(leads: Lead[], leaders: Leader[], now = new Date()) {
  const nowMs = now.getTime();

  const activity: ActivityItem[] = [
    ...leads.slice(0, 8).map<ActivityItem>((lead) => ({
      id: `lead-${lead.id}`,
      kind: lead.type,
      title: lead.fullName,
      description: lead.message?.trim() || `${lead.designation || 'Leader'} at ${lead.company}`,
      href: `/admin/leads?q=${encodeURIComponent(lead.fullName)}`,
      chips: [timeAgo(lead.createdAt, nowMs), TYPE_LABEL[lead.type], STATUS_LABEL[lead.status]],
      at: new Date(lead.createdAt).getTime() || 0,
    })),
    ...leaders
      .filter((l) => l.updatedAt || l.createdAt)
      .map<ActivityItem>((leader) => {
        const stamp = (leader.updatedAt || leader.createdAt) as string;
        return {
          id: `leader-${leader.id}`,
          kind: 'leader',
          title: leader.name,
          description: `${leader.designation} at ${leader.company}`,
          href: '/admin/leaders',
          chips: [timeAgo(stamp, nowMs), 'Founding 50', leader.published ? 'Live' : 'Draft'],
          at: new Date(stamp).getTime() || 0,
        };
      }),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 10);

  return {
    activity,
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
