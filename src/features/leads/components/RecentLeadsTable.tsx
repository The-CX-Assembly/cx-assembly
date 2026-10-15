'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lead } from '@/types';

export default function RecentLeadsTable({ leads }: { leads: Lead[] }) {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'cx_leader' | 'partner'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'new') return lead.status === 'new';
    if (activeTab === 'cx_leader') return lead.type === 'cx_leader';
    if (activeTab === 'partner') return lead.type === 'partner';
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'new':
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #BFDBFE',
          dot: '#3B82F6',
        };
      case 'approved':
        return {
          bg: '#ECFDF5',
          color: '#047857',
          border: '1px solid #A7F3D0',
          dot: '#10B981',
        };
      case 'reviewed':
        return {
          bg: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FDE68A',
          dot: '#F59E0B',
        };
      case 'rejected':
        return {
          bg: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
          dot: '#EF4444',
        };
      default:
        return {
          bg: '#F8FAFC',
          color: '#475569',
          border: '1px solid #E2E8F0',
          dot: '#94A3B8',
        };
    }
  };

  const getAvatarGradient = (name: string) => {
    const charCode = name.charCodeAt(0) || 65;
    if (charCode % 3 === 0) return 'linear-gradient(135deg, #0C2339, #2C7AAB)';
    if (charCode % 3 === 1) return 'linear-gradient(135deg, #C59B27, #9A7416)';
    return 'linear-gradient(135deg, #1E3A8A, #3B82F6)';
  };

  return (
    <div className="admin-card" style={{ padding: '28px', overflow: 'hidden' }}>
      {/* Table Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              Recent Applications & Inquiries
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              {filtered.length} visible
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Latest applicants from brand-side CX leaders and corporate partners.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.8125rem',
                outline: 'none',
                width: '190px',
                backgroundColor: '#FFFFFF',
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              style={{ position: 'absolute', left: '10px', top: '10px' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          <Link
            href="/admin/leads"
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            Full Inbox →
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
          marginBottom: '16px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'all', label: 'All Recent' },
          { id: 'new', label: 'New / Unreviewed' },
          { id: 'cx_leader', label: 'CX Leaders' },
          { id: 'partner', label: 'Partners & Sponsors' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              type="button"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? '#EEF2F6' : 'transparent',
                border: isActive ? '1px solid #CBD5E1' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
            margin: '8px 0',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#EEF2F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--color-text-muted)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
            No applications match this filter
          </h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            {searchTerm ? 'Try adjusting your search keywords.' : 'New submissions will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid #E2E8F0',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '12px 14px' }}>Applicant</th>
                <th style={{ padding: '12px 14px' }}>Role & Organization</th>
                <th style={{ padding: '12px 14px' }}>Contact</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 6).map((lead) => {
                const badge = getStatusBadgeStyle(lead.status);
                const initial = lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'A';

                return (
                  <tr
                    key={lead.id}
                    className="admin-table-row"
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    {/* Applicant */}
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: getAvatarGradient(lead.fullName),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <span
                            style={{
                              fontWeight: 700,
                              color: 'var(--color-primary)',
                              display: 'block',
                            }}
                          >
                            {lead.fullName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Company */}
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'block' }}>
                        {lead.designation || 'Speaker'}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        {lead.company}
                      </span>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 14px' }}>
                      <a
                        href={`mailto:${lead.email}`}
                        style={{
                          color: 'var(--color-accent)',
                          fontWeight: 500,
                          fontSize: '0.8125rem',
                          display: 'block',
                        }}
                      >
                        {lead.email}
                      </a>
                      {lead.linkedinUrl && (
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0077B5',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                          }}
                        >
                          <span>LinkedIn</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                        </a>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          backgroundColor:
                            lead.type === 'cx_leader'
                              ? 'rgba(12, 35, 57, 0.08)'
                              : lead.type === 'partner'
                              ? 'rgba(197, 155, 39, 0.15)'
                              : '#F1F5F9',
                          color:
                            lead.type === 'cx_leader'
                              ? 'var(--color-primary)'
                              : lead.type === 'partner'
                              ? '#9A7416'
                              : 'var(--color-text-muted)',
                        }}
                      >
                        {lead.type === 'cx_leader'
                          ? 'CX LEADER'
                          : lead.type === 'partner'
                          ? 'PARTNER'
                          : 'GENERAL'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 14px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: badge.border,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: badge.dot,
                          }}
                        />
                        {lead.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/leads?id=${lead.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--color-accent)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(44, 122, 171, 0.08)',
                        }}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
