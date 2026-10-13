'use client';

import { useState } from 'react';
import { SiteContent } from '@/types';
import { updateSectionContent } from '@/app/actions/admin';

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [activeTab, setActiveTab] = useState<'hero' | 'why' | 'philosophy' | 'leaders' | 'partners' | 'about' | 'founding50' | 'privacy'>('hero');
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const saveSection = async (sectionKey: string, data: Record<string, unknown>) => {
    setIsSaving(true);
    const res = await updateSectionContent(sectionKey, data);
    if (res.success) {
      setSavedSection(sectionKey);
      setTimeout(() => setSavedSection(null), 3000);
    } else {
      alert('Failed to save section content.');
    }
    setIsSaving(false);
  };

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '32px',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'hero', label: 'Hero Section' },
          { id: 'why', label: 'Why We Exist' },
          { id: 'philosophy', label: 'Philosophy' },
          { id: 'leaders', label: 'For CX Leaders' },
          { id: 'partners', label: 'For Partners' },
          { id: 'about', label: 'About Us' },
          { id: 'founding50', label: 'Founding 50 Intro' },
          { id: 'privacy', label: 'Privacy Policy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom: '-4px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {savedSection && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ECFDF5',
            color: '#047857',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #A7F3D0',
            marginBottom: '20px',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          ✓ Changes saved successfully! Public pages are updated.
        </div>
      )}

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
            Edit Hero Section
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Headline</label>
              <textarea
                rows={2}
                value={content.hero.headline}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Subheadline</label>
              <textarea
                rows={3}
                value={content.hero.subheadline}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheadline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Tagline</label>
              <input
                type="text"
                value={content.hero.tagline}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Primary Button Text</label>
                <input
                  type="text"
                  value={content.hero.ctaPrimaryText}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaPrimaryText: e.target.value } })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Secondary Button Text</label>
                <input
                  type="text"
                  value={content.hero.ctaSecondaryText}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, ctaSecondaryText: e.target.value } })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>
            <button
              onClick={() => saveSection('hero', content.hero as unknown as Record<string, unknown>)}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        </div>
      )}

      {/* Why We Exist Tab */}
      {activeTab === 'why' && (
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
            Edit Why We Exist Section
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Headline</label>
              <input
                type="text"
                value={content.whyWeExist.headline}
                onChange={(e) => setContent({ ...content, whyWeExist: { ...content.whyWeExist, headline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 1</label>
              <textarea
                rows={3}
                value={content.whyWeExist.paragraph1}
                onChange={(e) => setContent({ ...content, whyWeExist: { ...content.whyWeExist, paragraph1: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 2</label>
              <textarea
                rows={3}
                value={content.whyWeExist.paragraph2}
                onChange={(e) => setContent({ ...content, whyWeExist: { ...content.whyWeExist, paragraph2: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 3</label>
              <textarea
                rows={3}
                value={content.whyWeExist.paragraph3}
                onChange={(e) => setContent({ ...content, whyWeExist: { ...content.whyWeExist, paragraph3: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Conclusion Line</label>
              <input
                type="text"
                value={content.whyWeExist.conclusion}
                onChange={(e) => setContent({ ...content, whyWeExist: { ...content.whyWeExist, conclusion: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <button
              onClick={() => saveSection('whyWeExist', content.whyWeExist as unknown as Record<string, unknown>)}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save Why We Exist'}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Tab */}
      {activeTab === 'privacy' && (
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
            Edit Privacy Policy
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Full Markdown Text</label>
              <textarea
                rows={14}
                value={content.privacyPolicy}
                onChange={(e) => setContent({ ...content, privacyPolicy: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
            </div>
            <button
              onClick={() => saveSection('privacy', { privacyPolicy: content.privacyPolicy })}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save Privacy Policy'}
            </button>
          </div>
        </div>
      )}

      {/* For Partners Tab */}
      {activeTab === 'partners' && (
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
            Edit For Partners Section
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Headline</label>
              <input
                type="text"
                value={content.forPartners.headline}
                onChange={(e) => setContent({ ...content, forPartners: { ...content.forPartners, headline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 1</label>
              <textarea
                rows={3}
                value={content.forPartners.paragraph1}
                onChange={(e) => setContent({ ...content, forPartners: { ...content.forPartners, paragraph1: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 2</label>
              <textarea
                rows={3}
                value={content.forPartners.paragraph2}
                onChange={(e) => setContent({ ...content, forPartners: { ...content.forPartners, paragraph2: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Principle Statement</label>
              <input
                type="text"
                value={content.forPartners.principle}
                onChange={(e) => setContent({ ...content, forPartners: { ...content.forPartners, principle: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <button
              onClick={() => saveSection('forPartners', content.forPartners as unknown as Record<string, unknown>)}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save For Partners'}
            </button>
          </div>
        </div>
      )}

      {/* About Us Tab */}
      {activeTab === 'about' && (
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '20px' }}>
            Edit About Us Section
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Headline</label>
              <input
                type="text"
                value={content.aboutUs.headline}
                onChange={(e) => setContent({ ...content, aboutUs: { ...content.aboutUs, headline: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Paragraph 1</label>
              <textarea
                rows={3}
                value={content.aboutUs.paragraph1}
                onChange={(e) => setContent({ ...content, aboutUs: { ...content.aboutUs, paragraph1: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Founder Note</label>
              <textarea
                rows={3}
                value={content.aboutUs.founderNote}
                onChange={(e) => setContent({ ...content, aboutUs: { ...content.aboutUs, founderNote: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <button
              onClick={() => saveSection('aboutUs', content.aboutUs as unknown as Record<string, unknown>)}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ marginTop: '16px', alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save About Us'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
