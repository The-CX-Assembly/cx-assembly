'use client';

import { useMemo, useState } from 'react';
import { InterestType, Lead, LeadStatus } from '../models/lead.model';
import { updateLeadStatus } from '../controllers/leads.actions';
import { ALL_SITES, siteIdOf } from '@/modules/sites/models/site.constants';
import { formatDateTime, timeAgo } from '@/utils/format';
import Pagination from '@/components/admin/Pagination';
import {
  IconDownload,
  IconExternal,
  IconInbox,
  IconLinkedIn,
  IconMail,
  IconPhone,
  IconSearch,
} from '@/components/admin/AdminIcons';
import {
  Avatar,
  Badge,
  Drawer,
  EmptyState,
  PageHeader,
  SearchField,
  Stats,
  Tabs,
  Tone,
  cx,
  toneStyle,
  ui,
  useToast,
} from '@/components/admin/ui';

const PAGE_SIZE = 20;

const STATUSES: { value: LeadStatus; label: string; tone: Tone }[] = [
  { value: 'new', label: 'New', tone: 'blue' },
  { value: 'reviewed', label: 'Reviewing', tone: 'amber' },
  { value: 'approved', label: 'Approved', tone: 'green' },
  { value: 'rejected', label: 'Archived', tone: 'gray' },
];
const STATUS = Object.fromEntries(STATUSES.map((s) => [s.value, s])) as Record<LeadStatus, (typeof STATUSES)[number]>;

const TYPES: Record<InterestType, { label: string; tone: Tone }> = {
  cx_leader: { label: 'CX Leader', tone: 'violet' },
  partner: { label: 'Partner', tone: 'amber' },
  other: { label: 'General', tone: 'gray' },
};

/** "for-leaders-tile" → "For leaders tile" */
const ctaLabel = (cta?: string) => (cta ? cta.charAt(0).toUpperCase() + cta.slice(1).replace(/[-_]/g, ' ') : '');

type StatusFilter = 'all' | LeadStatus;

export default function LeadsManager({
  initialLeads,
  initialSearch = '',
  initialSite = ALL_SITES,
  sites,
}: {
  initialLeads: Lead[];
  initialSearch?: string;
  initialSite?: string;
  sites: { id: string; name: string }[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [siteFilter, setSiteFilter] = useState<string>(initialSite);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());
  const [toast, showToast] = useToast();

  const multiSite = sites.length > 1;
  const siteName = (lead: Lead) => sites.find((s) => s.id === siteIdOf(lead))?.name ?? siteIdOf(lead);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  // Everything except the status filter: the tab counts show what each tab would contain.
  const scoped = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !term ||
        [lead.fullName, lead.company, lead.email, lead.designation, lead.source?.utmCampaign].some((v) =>
          (v ?? '').toLowerCase().includes(term),
        );
      const matchesSite = siteFilter === ALL_SITES || siteIdOf(lead) === siteFilter;
      const matchesType = typeFilter === 'all' || lead.type === typeFilter;
      return matchesSearch && matchesSite && matchesType;
    });
  }, [leads, searchTerm, siteFilter, typeFilter]);

  const filteredLeads = statusFilter === 'all' ? scoped : scoped.filter((l) => l.status === statusFilter);
  const countOf = (status: LeadStatus) => scoped.filter((l) => l.status === status).length;

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageLeads = filteredLeads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Any filter change starts again from the first page.
  const refilter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const stats = {
    total: leads.length,
    fresh: leads.filter((l) => l.status === 'new').length,
    approved: leads.filter((l) => l.status === 'approved').length,
    month: leads.filter((l) => new Date(l.createdAt).getTime() >= monthAgo).length,
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const previous = leads.find((l) => l.id === leadId)?.status;
    if (!previous || previous === newStatus) return;
    setUpdating(leadId);
    // Optimistic: the pill changes at once and rolls back if saving fails.
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    const res = await updateLeadStatus(leadId, newStatus);
    setUpdating(null);
    if (!res.success) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: previous } : l)));
      showToast(res.error ?? 'Couldn’t update the status.', 'error');
    } else {
      showToast(`Marked as ${STATUS[newStatus].label}.`);
    }
  };

  // Exports what's on screen (all pages), matching the count on the button.
  const exportToCSV = () => {
    if (filteredLeads.length === 0) return showToast('No leads to export.', 'error');

    const headers = [
      'ID', 'Website', 'Full Name', 'Designation', 'Company', 'Email', 'Phone', 'Type', 'LinkedIn', 'Message',
      'Status', 'Source Button', 'Source Page', 'Landing Page', 'Referrer', 'UTM Source', 'UTM Medium',
      'UTM Campaign', 'UTM Term', 'UTM Content', 'Extra Fields', 'Submitted At',
    ];
    const cell = (v: string | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredLeads.map((lead) => [
      cell(lead.id), cell(siteName(lead)), cell(lead.fullName), cell(lead.designation), cell(lead.company),
      cell(lead.email), cell(lead.phone), cell(lead.type), cell(lead.linkedinUrl), cell(lead.message),
      cell(lead.status), cell(lead.source?.cta), cell(lead.source?.page), cell(lead.source?.landingPage),
      cell(lead.source?.referrer), cell(lead.source?.utmSource), cell(lead.source?.utmMedium),
      cell(lead.source?.utmCampaign), cell(lead.source?.utmTerm), cell(lead.source?.utmContent),
      cell(lead.extra ? JSON.stringify(lead.extra) : ''), cell(lead.createdAt),
    ]);

    // A Blob keeps characters like # intact (a data: URI would truncate at them).
    const csv = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteFilter === ALL_SITES ? 'all-websites' : siteFilter}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtersActive = Boolean(searchTerm) || siteFilter !== ALL_SITES || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className={ui.page}>
      <PageHeader
        title="Leads"
        actions={
          <button type="button" className={ui.btnGhost} onClick={exportToCSV} disabled={filteredLeads.length === 0}>
            <IconDownload size={16} /> Export CSV ({filteredLeads.length})
          </button>
        }
      />

      <Stats
        items={[
          { label: 'Total leads', value: stats.total, color: 'var(--a-violet)', onClick: () => refilter(setStatusFilter)('all') },
          { label: 'Waiting for review', value: stats.fresh, color: 'var(--a-primary)', onClick: () => refilter(setStatusFilter)('new') },
          { label: 'Approved', value: stats.approved, color: 'var(--a-green)', onClick: () => refilter(setStatusFilter)('approved') },
          { label: 'Last 30 days', value: stats.month, color: 'var(--a-amber)' },
        ]}
      />

      <section className={ui.panel} aria-label="Leads">
        <Tabs
          label="Filter by status"
          value={statusFilter}
          onChange={refilter(setStatusFilter)}
          items={[
            { value: 'all', label: 'All', count: scoped.length },
            ...STATUSES.map((s) => ({ value: s.value, label: s.label, count: countOf(s.value) })),
          ]}
        />

        <div className={ui.toolbar}>
          <SearchField
            value={searchTerm}
            onChange={refilter(setSearchTerm)}
            placeholder="Search name, company, email or campaign…"
          />
          {multiSite && (
            <select
              className={ui.select}
              value={siteFilter}
              onChange={(e) => refilter(setSiteFilter)(e.target.value)}
              aria-label="Website"
            >
              <option value={ALL_SITES}>All websites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <select
            className={ui.select}
            value={typeFilter}
            onChange={(e) => refilter(setTypeFilter)(e.target.value)}
            aria-label="Category"
          >
            <option value="all">All categories</option>
            <option value="cx_leader">CX Leaders</option>
            <option value="partner">Partners</option>
            <option value="other">General</option>
          </select>
          {filtersActive && (
            <div className={ui.toolbarEnd}>
              <button
                type="button"
                className={cx(ui.btnGhost, ui.btnSm)}
                onClick={() => {
                  setSearchTerm('');
                  setSiteFilter(ALL_SITES);
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {filteredLeads.length === 0 ? (
          <EmptyState icon={leads.length ? <IconSearch size={22} /> : <IconInbox size={22} />} title={leads.length ? 'No leads match these filters' : 'No leads yet'}>
            {leads.length
              ? 'Try a different search, status or category.'
              : 'Applications from the website’s Join buttons and from connected websites appear here.'}
          </EmptyState>
        ) : (
          <div className={ui.tableWrap}>
            <table className={cx(ui.table, ui.tableCards)}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {pageLeads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={ui.rowClickable}
                    style={{ '--i': i } as React.CSSProperties}
                    onClick={() => setSelectedId(lead.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedId(lead.id)}
                    aria-label={`Open ${lead.fullName}`}
                  >
                    <td>
                      <div className={ui.person}>
                        <Avatar name={lead.fullName} />
                        <div>
                          <span className={ui.cellMain}>{lead.fullName}</span>
                          <span className={ui.cellSub}>{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={ui.cardFull}>
                      <span className={ui.cellMain} style={{ fontWeight: 500 }}>
                        {lead.designation || '—'}
                      </span>
                      <span className={ui.cellSub}>
                        {[lead.company, multiSite ? siteName(lead) : ''].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </td>
                    <td className={ui.cardFull}>
                      {lead.source?.cta || lead.source?.page ? (
                        <>
                          <span className={ui.cellMain} style={{ fontWeight: 500 }}>
                            {ctaLabel(lead.source.cta) || 'Form'}
                            {lead.source.utmCampaign && (
                              <>
                                {' '}
                                <Badge tone="blue">{lead.source.utmCampaign}</Badge>
                              </>
                            )}
                          </span>
                          <span className={ui.cellSub}>
                            {[lead.source.utmSource, lead.source.landingPage || lead.source.page].filter(Boolean).join(' · ')}
                          </span>
                        </>
                      ) : (
                        <span className={ui.cellSub}>Not tracked</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={ui.statusSelect}
                        style={toneStyle(STATUS[lead.status].tone)}
                        value={lead.status}
                        disabled={updating === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        aria-label={`Status of ${lead.fullName}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td title={formatDateTime(lead.createdAt)}>
                      <span className={ui.cellMain} style={{ fontWeight: 500 }}>
                        {timeAgo(lead.createdAt, now)}
                      </span>
                      <span className={ui.cellSub}>
                        <Badge tone={TYPES[lead.type].tone}>{TYPES[lead.type].label}</Badge>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filteredLeads.length} onChange={setPage} noun="leads" />
      </section>

      {selected && (
        <Drawer
          label={`Lead: ${selected.fullName}`}
          onClose={() => setSelectedId(null)}
          title={
            <span className={ui.person}>
              <Avatar name={selected.fullName} size="lg" />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block' }}>{selected.fullName}</span>
                <span className={ui.drawerSub} style={{ display: 'block', fontWeight: 400 }}>
                  {[selected.designation, selected.company].filter(Boolean).join(' at ') || selected.email}
                </span>
              </span>
            </span>
          }
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => setSelectedId(null)}>
                Close
              </button>
              <a className={ui.btnPrimary} href={`mailto:${selected.email}`}>
                <IconMail size={16} /> Email {selected.fullName.split(' ')[0]}
              </a>
            </>
          }
        >
          <div className={ui.section}>
            <span className={ui.sectionLabel}>Status</span>
            <div className={ui.segmented} role="radiogroup" aria-label="Status" style={{ '--n': STATUSES.length } as React.CSSProperties}>
              {STATUSES.map((s) => {
                const on = selected.status === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={updating === selected.id}
                    className={cx(ui.segment, on && ui.segmentOn)}
                    style={on ? toneStyle(s.tone) : undefined}
                    onClick={() => handleStatusChange(selected.id, s.value)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={ui.section}>
            <span className={ui.sectionLabel}>Contact</span>
            <dl className={ui.details}>
              <dt>
                <IconMail size={14} /> Email
              </dt>
              <dd>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </dd>
              <dt>
                <IconPhone size={14} /> Phone
              </dt>
              <dd>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : '—'}</dd>
              <dt>
                <IconLinkedIn size={14} /> LinkedIn
              </dt>
              <dd>
                {selected.linkedinUrl ? (
                  <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    View profile <IconExternal size={12} />
                  </a>
                ) : (
                  '—'
                )}
              </dd>
              <dt>Category</dt>
              <dd>
                <Badge tone={TYPES[selected.type].tone}>{TYPES[selected.type].label}</Badge>
              </dd>
              <dt>Submitted</dt>
              <dd>{formatDateTime(selected.createdAt)}</dd>
            </dl>
          </div>

          {selected.message && (
            <div className={ui.section}>
              <span className={ui.sectionLabel}>Message</span>
              <p className={ui.quote}>{selected.message}</p>
            </div>
          )}

          <div className={ui.section}>
            <span className={ui.sectionLabel}>Where they came from</span>
            <dl className={ui.details}>
              {multiSite && (
                <>
                  <dt>Website</dt>
                  <dd>{siteName(selected)}</dd>
                </>
              )}
              <dt>Button</dt>
              <dd>{ctaLabel(selected.source?.cta) || 'Not tracked'}</dd>
              <dt>Submitted on</dt>
              <dd>{selected.source?.page || '—'}</dd>
              <dt>Landed on</dt>
              <dd>{selected.source?.landingPage || '—'}</dd>
              <dt>Referred by</dt>
              <dd>{selected.source?.referrer || 'Direct / unknown'}</dd>
              <dt>Campaign</dt>
              <dd>
                {selected.source?.utmCampaign || selected.source?.utmSource
                  ? [selected.source?.utmCampaign, selected.source?.utmSource, selected.source?.utmMedium]
                      .filter(Boolean)
                      .join(' · ')
                  : 'No campaign tags'}
              </dd>
            </dl>
          </div>

          {selected.extra && Object.keys(selected.extra).length > 0 && (
            <div className={ui.section}>
              <span className={ui.sectionLabel}>Other answers</span>
              <dl className={ui.details}>
                {Object.entries(selected.extra).map(([key, value]) => (
                  <div key={key} style={{ display: 'contents' }}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Drawer>
      )}

      {toast}
    </div>
  );
}
