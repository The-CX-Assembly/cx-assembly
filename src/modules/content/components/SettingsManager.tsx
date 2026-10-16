'use client';

import { useState } from 'react';
import { SiteSettings } from '../models/content.model';
import { updateSiteSettings } from '../controllers/content.actions';
import { Field, cx, ui, useToast } from '@/components/admin/ui';

// Google shows roughly this much of a title / description before cutting it off.
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

function hostOf(url?: string) {
  try {
    return url ? new URL(url).host : '';
  } catch {
    return '';
  }
}

function Counter({ length, limit }: { length: number; limit: number }) {
  const over = length > limit;
  return (
    <span style={{ color: over ? 'var(--a-warn)' : undefined }}>
      {length}/{limit} characters{over ? ' · Google may cut this short' : ''}
    </span>
  );
}

export default function SettingsManager({
  siteId,
  siteUrl,
  initialSettings,
}: {
  siteId: string;
  siteUrl?: string;
  initialSettings: SiteSettings;
}) {
  const host = hostOf(siteUrl) || 'your-website.com';
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saved, setSaved] = useState<SiteSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, showToast] = useToast();

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
  const set = (patch: Partial<SiteSettings>) => setSettings((s) => ({ ...s, ...patch }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateSiteSettings(siteId, settings);
    setIsSaving(false);
    if (!res.success) return showToast(res.error ?? 'Couldn’t save the settings.', 'error');
    setSaved(settings);
    showToast('Settings saved. The website updates within a minute.');
  };

  return (
    <form onSubmit={handleSave}>
      <section className={ui.panel} aria-label="Search and sharing">
        <div className={ui.panelHead}>
          <div>
            <h2 className={ui.panelTitle}>Search &amp; sharing</h2>
            <p className={ui.panelSub}>The home page’s title and description in Google and in link previews.</p>
          </div>
        </div>
        <div className={ui.panelBody}>
          <div className={ui.formGrid}>
            <Field label="Page title" required full hint={<Counter length={settings.siteTitle.length} limit={TITLE_LIMIT} />}>
              <input className={ui.input} required value={settings.siteTitle} onChange={(e) => set({ siteTitle: e.target.value })} />
            </Field>
            <Field
              label="Description"
              required
              full
              hint={<Counter length={settings.metaDescription.length} limit={DESCRIPTION_LIMIT} />}
            >
              <textarea
                className={ui.textarea}
                rows={3}
                required
                value={settings.metaDescription}
                onChange={(e) => set({ metaDescription: e.target.value })}
              />
            </Field>

            <div className={cx(ui.section, ui.full)}>
              <span className={ui.sectionLabel}>Preview in Google</span>
              {/* Google's own colours on white, in light and dark mode alike. */}
              <div className={ui.details} style={{ display: 'block', background: '#FFFFFF' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#4D5156' }}>{host}</span>
                <span
                  style={{
                    display: 'block',
                    margin: '2px 0 4px',
                    fontSize: '1.125rem',
                    color: '#1A0DAB',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {settings.siteTitle || 'Page title'}
                </span>
                <span style={{ display: 'block', fontSize: '0.875rem', lineHeight: 1.5, color: '#4D5156', fontWeight: 400 }}>
                  {settings.metaDescription.length > DESCRIPTION_LIMIT
                    ? `${settings.metaDescription.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
                    : settings.metaDescription || 'Description'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={ui.panel} aria-label="Contact and social">
        <div className={ui.panelHead}>
          <div>
            <h2 className={ui.panelTitle}>Contact &amp; social</h2>
            <p className={ui.panelSub}>Shown in the footer and in the site’s structured data.</p>
          </div>
        </div>
        <div className={ui.panelBody}>
          <div className={ui.formGrid}>
            <Field label="Contact email">
              <input
                className={ui.input}
                type="email"
                value={settings.contactEmail}
                placeholder="contact@thecxassembly.com"
                onChange={(e) => set({ contactEmail: e.target.value })}
              />
            </Field>
            <Field label="LinkedIn page">
              <input
                className={ui.input}
                type="url"
                value={settings.linkedinUrl}
                placeholder="https://www.linkedin.com/company/…"
                onChange={(e) => set({ linkedinUrl: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className={ui.panel} aria-label="Highlights">
        <div className={ui.panelHead}>
          <div>
            <h2 className={ui.panelTitle}>Highlights</h2>
            <p className={ui.panelSub}>The short credibility lines in the home page hero.</p>
          </div>
        </div>
        <div className={ui.panelBody}>
          <div className={ui.formGrid}>
            <Field label="Credibility line" hint="E.g. “Launched on World CX Day 2026”.">
              <input className={ui.input} value={settings.credibilityText} onChange={(e) => set({ credibilityText: e.target.value })} />
            </Field>
            <Field label="Members line" hint="Start with a number, e.g. “50 Founding CX Leaders”: the number is shown large.">
              <input className={ui.input} value={settings.foundingCount} onChange={(e) => set({ foundingCount: e.target.value })} />
            </Field>
          </div>
        </div>
      </section>

      {/* Appears once something changes and follows the bottom of the screen. */}
      {(dirty || isSaving) && (
        <div className={ui.saveBar} role="region" aria-label="Unsaved changes">
          <span className={ui.unsaved}>
            <span className={ui.dirtyDot} /> Unsaved changes
          </span>
          <button type="button" className={ui.btnGhost} onClick={() => setSettings(saved)} disabled={isSaving}>
            Discard
          </button>
          <button type="submit" className={ui.btnPrimary} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      )}

      {toast}
    </form>
  );
}
