'use client';

import { useState } from 'react';
import { ContentFieldValue, ContentSections } from '@/types';
import { deleteContentSection, saveContentSection } from '@/features/content/actions';

/**
 * Content editor for websites other than the one this app renders. Their page
 * layouts live in their own code, so content here is free-form: sections of
 * named text or list fields, which the site reads as content.<section>.<field>.
 */

interface Field {
  key: string;
  value: ContentFieldValue;
}

interface Section {
  key: string;
  fields: Field[];
  dirty: boolean;
}

const KEY = /^[A-Za-z][A-Za-z0-9_-]{0,59}$/;
const KEY_HINT = 'Start with a letter; letters, numbers, - and _ only.';

const card: React.CSSProperties = { background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' };
const input: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: '0.875rem' };
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px', fontFamily: 'ui-monospace, monospace' };
const ghostBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' };

const toSections = (content: ContentSections): Section[] =>
  Object.entries(content)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, fields]) => ({
      key,
      fields: Object.entries(fields).map(([k, v]) => ({ key: k, value: v })),
      dirty: false,
    }));

export default function SectionsEditor({
  siteId,
  siteName,
  initialContent,
}: {
  siteId: string;
  siteName: string;
  initialContent: ContentSections;
}) {
  const [sections, setSections] = useState<Section[]>(() => toSections(initialContent));
  const [newSection, setNewSection] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const flash = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const update = (key: string, fn: (s: Section) => Section) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...fn(s), dirty: true } : s)));

  const addSection = () => {
    const key = newSection.trim();
    if (!KEY.test(key)) return flash(false, `Section key: ${KEY_HINT}`);
    if (sections.some((s) => s.key === key)) return flash(false, `There is already a "${key}" section.`);
    setSections((prev) => [...prev, { key, fields: [{ key: 'headline', value: '' }], dirty: true }]);
    setNewSection('');
  };

  const save = async (section: Section) => {
    const keys = section.fields.map((f) => f.key);
    if (keys.some((k) => !KEY.test(k))) return flash(false, `Field keys: ${KEY_HINT}`);
    if (new Set(keys).size !== keys.length) return flash(false, 'Two fields in this section have the same key.');

    setBusy(section.key);
    const fields = Object.fromEntries(
      section.fields.map((f) => [f.key, Array.isArray(f.value) ? f.value.map((v) => v.trim()).filter(Boolean) : f.value]),
    );
    const res = await saveContentSection(siteId, section.key, fields);
    setBusy(null);
    if (!res.success) return flash(false, res.error ?? 'Failed to save.');
    setSections((prev) => prev.map((s) => (s.key === section.key ? { ...s, dirty: false } : s)));
    flash(true, `Saved "${section.key}". ${siteName} picks it up on its next content fetch.`);
  };

  const remove = async (section: Section) => {
    if (!confirm(`Delete the "${section.key}" section and all its fields?`)) return;
    setBusy(section.key);
    const res = await deleteContentSection(siteId, section.key);
    setBusy(null);
    if (!res.success) return flash(false, res.error ?? 'Failed to delete.');
    setSections((prev) => prev.filter((s) => s.key !== section.key));
    flash(true, `Deleted "${section.key}".`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {notice && (
        <div
          role="status"
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: notice.ok ? '#ECFDF5' : '#FEF2F2',
            color: notice.ok ? '#047857' : '#B91C1C',
            border: `1px solid ${notice.ok ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          {notice.ok ? '✓ ' : ''}
          {notice.text}
        </div>
      )}

      {sections.length === 0 && (
        <div style={{ ...card, color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          No content yet. Add a section for each part of the website (for example <code>hero</code> or{' '}
          <code>about</code>), then add the fields its page shows.
        </div>
      )}

      {sections.map((section) => (
        <section key={section.key} style={card} aria-label={`Section ${section.key}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'ui-monospace, monospace' }}>
              {section.key}
              {section.dirty && <span style={{ marginLeft: 10, fontSize: '0.75rem', color: '#B45309', fontFamily: 'inherit' }}>unsaved</span>}
            </h2>
            <button type="button" style={{ ...ghostBtn, color: '#B91C1C', borderColor: '#FECACA' }} disabled={busy !== null} onClick={() => remove(section)}>
              Delete section
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {section.fields.map((field, i) => {
              const isList = Array.isArray(field.value);
              const id = `${section.key}-${i}`;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <input
                      aria-label="Field key"
                      value={field.key}
                      onChange={(e) =>
                        update(section.key, (s) => ({ ...s, fields: s.fields.map((f, j) => (j === i ? { ...f, key: e.target.value.trim() } : f)) }))
                      }
                      style={{ ...input, ...label, width: 220, marginBottom: 0, padding: '6px 8px' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{isList ? 'list · one item per line' : 'text'}</span>
                    <button
                      type="button"
                      aria-label={`Remove field ${field.key}`}
                      onClick={() => update(section.key, (s) => ({ ...s, fields: s.fields.filter((_, j) => j !== i) }))}
                      style={{ ...ghostBtn, marginLeft: 'auto', padding: '4px 10px' }}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    id={id}
                    rows={isList ? Math.max(3, (field.value as string[]).length + 1) : Math.min(8, Math.max(2, Math.ceil(String(field.value).length / 90)))}
                    value={isList ? (field.value as string[]).join('\n') : (field.value as string)}
                    onChange={(e) =>
                      update(section.key, (s) => ({
                        ...s,
                        fields: s.fields.map((f, j) => (j === i ? { ...f, value: isList ? e.target.value.split('\n') : e.target.value } : f)),
                      }))
                    }
                    style={input}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20, alignItems: 'center' }}>
            <button
              type="button"
              style={ghostBtn}
              onClick={() => update(section.key, (s) => ({ ...s, fields: [...s.fields, { key: `field${s.fields.length + 1}`, value: '' }] }))}
            >
              + Text field
            </button>
            <button
              type="button"
              style={ghostBtn}
              onClick={() => update(section.key, (s) => ({ ...s, fields: [...s.fields, { key: `list${s.fields.length + 1}`, value: [] }] }))}
            >
              + List field
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginLeft: 'auto', padding: '10px 22px', fontSize: '0.875rem' }}
              disabled={busy !== null || !section.dirty}
              onClick={() => save(section)}
            >
              {busy === section.key ? 'Saving…' : 'Save section'}
            </button>
          </div>
        </section>
      ))}

      <form
        style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}
        onSubmit={(e) => {
          e.preventDefault();
          addSection();
        }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor="new-section" style={{ ...label, fontFamily: 'inherit' }}>
            New section key
          </label>
          <input id="new-section" placeholder="e.g. hero" value={newSection} onChange={(e) => setNewSection(e.target.value)} style={input} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>
          Add section
        </button>
      </form>
    </div>
  );
}
