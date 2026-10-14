'use client';

import { useState } from 'react';
import { Lead, LeadStatus } from '@/types';
import { updateLeadStatus } from '@/app/actions/admin';
import { ALL_SITES, siteIdOf } from '@/lib/site-constants';

/** "for-leaders-tile" → "For leaders tile" */
const ctaLabel = (cta?: string) => (cta ? cta.charAt(0).toUpperCase() + cta.slice(1).replace(/[-_]/g, ' ') : '');

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const multiSite = sites.length > 1;
  const siteName = (lead: Lead) => sites.find((s) => s.id === siteIdOf(lead))?.name ?? siteIdOf(lead);

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [lead.fullName, lead.company, lead.email, lead.designation].some((v) =>
      (v ?? '').toLowerCase().includes(term),
    );

    const matchesSite = siteFilter === ALL_SITES || siteIdOf(lead) === siteFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesType = typeFilter === 'all' || lead.type === typeFilter;

    return matchesSearch && matchesSite && matchesStatus && matchesType;
  });

  // Handle status update
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setIsUpdating(true);
    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setIsUpdating(false);
  };

  // CSV Export functionality
  // Exports what's on screen, matching the count on the button.
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export.');
      return;
    }

    const headers = [
      'ID',
      'Website',
      'Full Name',
      'Designation',
      'Company',
      'Email',
      'Phone',
      'Type',
      'LinkedIn',
      'Message',
      'Status',
      'Source Button',
      'Source Page',
      'Extra Fields',
      'Submitted At',
    ];

    const cell = (v: string | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredLeads.map((lead) => [
      cell(lead.id),
      cell(siteName(lead)),
      cell(lead.fullName),
      cell(lead.designation),
      cell(lead.company),
      cell(lead.email),
      cell(lead.phone),
      cell(lead.type),
      cell(lead.linkedinUrl),
      cell(lead.message),
      cell(lead.status),
      cell(lead.source?.cta),
      cell(lead.source?.page),
      cell(lead.extra ? JSON.stringify(lead.extra) : ''),
      cell(lead.createdAt),
    ]);

    // A Blob keeps characters like # intact (a data: URI would truncate at them).
    const csv = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${siteFilter === ALL_SITES ? 'all-websites' : siteFilter}-leads-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls Bar */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Search Input */}
          <div style={{ minWidth: '240px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Website Filter */}
          {multiSite && (
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              aria-label="Website"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                outline: 'none',
                background: '#FFFFFF',
              }}
            >
              <option value={ALL_SITES}>All Websites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #CBD5E1',
              fontSize: '0.875rem',
              outline: 'none',
              background: '#FFFFFF',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #CBD5E1',
              fontSize: '0.875rem',
              outline: 'none',
              background: '#FFFFFF',
            }}
          >
            <option value="all">All Categories</option>
            <option value="cx_leader">CX Leaders</option>
            <option value="partner">Partners</option>
            <option value="other">General</option>
          </select>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.875rem' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ marginRight: '6px' }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV ({filteredLeads.length})
        </button>
      </div>

      {/* Leads Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {filteredLeads.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No applications found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '14px 18px' }}>Applicant</th>
                  <th style={{ padding: '14px 18px' }}>Designation & Company</th>
                  <th style={{ padding: '14px 18px' }}>Contact</th>
                  <th style={{ padding: '14px 18px' }}>{multiSite ? 'Website & Category' : 'Category'}</th>
                  <th style={{ padding: '14px 18px' }}>Source</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>Submitted</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td style={{ padding: '16px 18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {lead.fullName}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{lead.designation}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{lead.company}</div>
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--color-accent)', display: 'block' }}>
                        {lead.email}
                      </a>
                      {lead.phone && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{lead.phone}</span>}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      {multiSite && <div style={{ fontWeight: 600, marginBottom: 4 }}>{siteName(lead)}</div>}
                      <span className="badge-pill badge-navy" style={{ fontSize: '0.6875rem' }}>
                        {lead.type === 'cx_leader' ? 'CX Leader' : lead.type === 'partner' ? 'Partner' : 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 18px', fontSize: '0.8125rem' }}>
                      {lead.source?.cta || lead.source?.page ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{ctaLabel(lead.source.cta) || '—'}</div>
                          {lead.source.page && <div style={{ color: 'var(--color-text-muted)' }}>{lead.source.page}</div>}
                        </>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Not tracked</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 18px' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid #CBD5E1',
                          background:
                            lead.status === 'new'
                              ? '#EFF6FF'
                              : lead.status === 'approved'
                              ? '#ECFDF5'
                              : lead.status === 'rejected'
                              ? '#FEF2F2'
                              : '#F8FAFC',
                          color:
                            lead.status === 'new'
                              ? '#1D4ED8'
                              : lead.status === 'approved'
                              ? '#047857'
                              : lead.status === 'rejected'
                              ? '#B91C1C'
                              : '#475569',
                        }}
                      >
                        <option value="new">NEW</option>
                        <option value="reviewed">REVIEWED</option>
                        <option value="approved">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px 18px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-accent)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                        }}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Details Drawer / Modal */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 35, 57, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '560px',
              width: '100%',
              padding: '36px 32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedLead(null)}
              aria-label="Close details"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <span className="badge-pill badge-navy" style={{ marginBottom: '12px' }}>
              {selectedLead.type === 'cx_leader' ? 'CX Leader Application' : selectedLead.type === 'partner' ? 'Partner Inquiry' : 'General Inquiry'}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
              {selectedLead.fullName}
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '2px' }}>
              {selectedLead.designation}
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              {selectedLead.company}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Email</span>
                <a href={`mailto:${selectedLead.email}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedLead.email}
                </a>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Phone</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedLead.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>LinkedIn</span>
                {selectedLead.linkedinUrl ? (
                  <a href={selectedLead.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                    View LinkedIn Profile
                  </a>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>Not provided</span>
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Status</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedLead.status}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Website</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{siteName(selectedLead)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Came from</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedLead.source?.cta || selectedLead.source?.page
                    ? [ctaLabel(selectedLead.source.cta), selectedLead.source.page && `on ${selectedLead.source.page}`]
                        .filter(Boolean)
                        .join(' ')
                    : 'Not tracked'}
                </span>
              </div>
              {selectedLead.extra &&
                Object.entries(selectedLead.extra).map(([key, value]) => (
                  <div key={key}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{key}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)', wordBreak: 'break-word' }}>{value}</span>
                  </div>
                ))}
            </div>

            {selectedLead.message && (
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  Applicant Priorities / Message
                </span>
                <p style={{ marginTop: '8px', fontSize: '0.9375rem', color: 'var(--color-text-body)', lineHeight: 1.6, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                  {selectedLead.message}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                onClick={() => handleStatusChange(selectedLead.id, 'approved')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Approve Application
              </button>
              <button
                onClick={() => handleStatusChange(selectedLead.id, 'rejected')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
