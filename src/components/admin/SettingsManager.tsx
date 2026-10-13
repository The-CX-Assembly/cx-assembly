'use client';

import { useState } from 'react';
import { SiteSettings } from '@/types';
import { updateSiteSettings } from '@/app/actions/admin';

export default function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateSiteSettings(settings);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to update site settings.');
    }
    setIsSaving(false);
  };

  return (
    <div style={{ background: '#FFFFFF', padding: '36px 32px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', maxWidth: '720px' }}>
      {saved && (
        <div style={{ padding: '12px 18px', background: '#ECFDF5', color: '#047857', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: 600 }}>
          ✓ Site settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
            Website Title (Meta Title)
          </label>
          <input
            type="text"
            required
            value={settings.siteTitle}
            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
            SEO Meta Description
          </label>
          <textarea
            rows={3}
            required
            value={settings.metaDescription}
            onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              LinkedIn Page URL
            </label>
            <input
              type="url"
              required
              value={settings.linkedinUrl}
              onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Official Contact Email
            </label>
            <input
              type="email"
              required
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Credibility Strip Label 1
            </label>
            <input
              type="text"
              value={settings.credibilityText}
              onChange={(e) => setSettings({ ...settings, credibilityText: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Credibility Strip Label 2
            </label>
            <input
              type="text"
              value={settings.foundingCount}
              onChange={(e) => setSettings({ ...settings, foundingCount: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary"
          style={{ padding: '14px', marginTop: '12px' }}
        >
          {isSaving ? 'Saving Settings...' : 'Save Site Settings'}
        </button>
      </form>
    </div>
  );
}
