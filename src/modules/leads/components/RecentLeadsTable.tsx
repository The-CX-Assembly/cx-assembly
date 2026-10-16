'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Badge, EmptyState, SearchField, Tabs, cx, type Tone } from '@/components/admin/ui';
import ui from '@/components/admin/ui.module.css';
import { IconInbox } from '@/components/admin/AdminIcons';
import { formatDateTime } from '@/utils/format';
import type { InterestType, Lead, LeadStatus } from '../models/lead.model';

type Filter = 'all' | 'new' | 'cx_leader' | 'partner';

const SHOWN = 6;

const STATUS: Record<LeadStatus, { label: string; tone: Tone }> = {
  new: { label: 'New', tone: 'blue' },
  reviewed: { label: 'Reviewing', tone: 'amber' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Archived', tone: 'gray' },
};

const TYPE: Record<InterestType, { label: string; tone: Tone }> = {
  cx_leader: { label: 'CX Leader', tone: 'violet' },
  partner: { label: 'Partner', tone: 'amber' },
  other: { label: 'General', tone: 'gray' },
};

/** The newest leads on the dashboard, with a link into the full inbox. */
export default function RecentLeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const matches = (lead: Lead) =>
    !q || [lead.fullName, lead.company, lead.designation, lead.email].some((v) => v?.toLowerCase().includes(q));
  const inFilter = (lead: Lead, f: Filter) =>
    f === 'all' ? true : f === 'new' ? lead.status === 'new' : lead.type === f;

  const searched = leads.filter(matches);
  const visible = searched.filter((lead) => inFilter(lead, filter));
  const countOf = (f: Filter) => searched.filter((lead) => inFilter(lead, f)).length;

  return (
    <section className={ui.panel} aria-labelledby="recent-leads-title">
      <div className={ui.panelHead}>
        <div>
          <h2 id="recent-leads-title" className={ui.panelTitle}>
            Recent applications
          </h2>
          <p className={ui.panelSub}>The latest people to apply or enquire.</p>
        </div>
        <Link href="/admin/leads" className={cx(ui.btnGhost, ui.btnSm)}>
          Full inbox →
        </Link>
      </div>

      <Tabs
        label="Filter recent applications"
        value={filter}
        onChange={setFilter}
        items={[
          { value: 'all', label: 'All', count: countOf('all') },
          { value: 'new', label: 'New', count: countOf('new') },
          { value: 'cx_leader', label: 'CX Leaders', count: countOf('cx_leader') },
          { value: 'partner', label: 'Partners', count: countOf('partner') },
        ]}
      />
      <div className={ui.toolbar}>
        <SearchField value={search} onChange={setSearch} placeholder="Search name, company, role or email…" />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<IconInbox size={22} />} title="No applications match">
          {q ? 'Try a different search.' : 'New submissions appear here automatically.'}
        </EmptyState>
      ) : (
        <div className={ui.tableWrap}>
          <table className={cx(ui.table, ui.tableCards)}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Role</th>
                <th>Category</th>
                <th>Submitted</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, SHOWN).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className={ui.person}>
                      <Avatar name={lead.fullName} />
                      <div>
                        <span className={ui.cellMain}>{lead.fullName}</span>
                        <a className={ui.cellSub} href={`mailto:${lead.email}`}>
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className={ui.cardFull}>
                    <span className={ui.cellMain} style={{ fontWeight: 500 }}>
                      {lead.designation}
                    </span>
                    <span className={ui.cellSub}>{lead.company}</span>
                  </td>
                  <td>
                    <Badge tone={TYPE[lead.type]?.tone ?? 'gray'}>{TYPE[lead.type]?.label ?? 'General'}</Badge>
                  </td>
                  <td>
                    <span className={ui.cellSub}>{formatDateTime(lead.createdAt)}</span>
                  </td>
                  <td>
                    <Badge tone={STATUS[lead.status].tone} dot>
                      {STATUS[lead.status].label}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/leads?lead=${encodeURIComponent(lead.id)}`} className={cx(ui.btnGhost, ui.btnSm)}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
