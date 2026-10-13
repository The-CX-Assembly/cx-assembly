'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Leader } from '@/types';

export default function LeaderCard({ leader }: { leader: Leader }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="leader-card"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-card-border)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Photo Container */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
          <Image
            src={leader.photoUrl || '/brand/leader-sample-1.jpg'}
            alt={leader.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
            className="leader-photo"
          />
          {leader.linkedinUrl && (
            <a
              href={leader.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${leader.name} LinkedIn`}
              className="linkedin-badge"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
            {leader.name}
          </h3>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '4px', lineHeight: 1.3 }}>
            {leader.designation}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {leader.company}
          </p>

          {leader.bio && (
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-body)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginTop: 'auto',
            }}>
              {leader.bio}
            </p>
          )}

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            <span>Read profile</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 35, 57, 0.75)',
            backdropFilter: 'blur(6px)',
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
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                zIndex: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '24px', padding: '32px 32px 20px', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid var(--color-bg-alt)' }}>
                  <Image
                    src={leader.photoUrl || '/brand/leader-sample-1.jpg'}
                    alt={leader.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span className="badge-pill badge-gold" style={{ fontSize: '0.6875rem', marginBottom: '8px' }}>
                    Founding CX Leader
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    {leader.name}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '2px' }}>
                    {leader.designation}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {leader.company}
                  </p>
                </div>
              </div>

              <div style={{ padding: '24px 32px 32px' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  Leadership & Experience Perspective
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-body)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {leader.bio || 'Founding leader contributing to candid peer-level dialogues and shaping customer experience benchmarks across India.'}
                </p>

                {leader.linkedinUrl && (
                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                    <a
                      href={leader.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-navy"
                      style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      Connect on LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .leader-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(44, 122, 171, 0.4);
        }
        .leader-card:hover .leader-photo {
          transform: scale(1.04);
        }
        .leader-photo {
          transition: transform 0.4s ease;
        }
        .linkedin-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(12, 35, 57, 0.85);
          color: #FFFFFF;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .linkedin-badge:hover {
          background: #0077B5;
        }
      `}</style>
    </>
  );
}
