'use client';

import { useEffect, useState } from 'react';
import { ContentFieldValue, ContentSections } from '../models/content.model';
import { deleteContentSection, saveContentSection } from '../controllers/content.actions';
import { IconClose, IconEdit, IconPlus, IconTrash } from '@/components/admin/AdminIcons';
import { EmptyState, Field, cx, ui, useToast } from '@/components/admin/ui';

/**
 * Content editor for websites other than the one this app renders. Their page
 * layouts live in their own code, so content here is free-form: sections of
 * named text or list fields, which the site reads as content.<section>.<field>.
 */

interface FieldEntry {
  key: string;
  value: ContentFieldValue;
}

interface Section {
  key: string;
  fields: FieldEntry[];
  dirty: boolean;
}

const KEY = /^[A-Za-z][A-Za-z0-9_-]{0,59}$/;
const KEY_HINT = 'Start with a letter; letters, numbers, - and _ only.';

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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(null), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const update = (key: string, fn: (s: Section) => Section) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...fn(s), dirty: true } : s)));

  const addSection = (e: React.FormEvent) => {
    e.preventDefault();
    const key = newSection.trim();
    if (!KEY.test(key)) return showToast(`Section key: ${KEY_HINT}`, 'error');
    if (sections.some((s) => s.key === key)) return showToast(`There is already a "${key}" section.`, 'error');
    setSections((prev) => [...prev, { key, fields: [{ key: 'headline', value: '' }], dirty: true }]);
    setNewSection('');
  };

  const save = async (section: Section) => {
    const keys = section.fields.map((f) => f.key);
    if (keys.some((k) => !KEY.test(k))) return showToast(`Field keys: ${KEY_HINT}`, 'error');
    if (new Set(keys).size !== keys.length) return showToast('Two fields in this section have the same key.', 'error');

    setBusy(section.key);
    const fields = Object.fromEntries(
      section.fields.map((f) => [f.key, Array.isArray(f.value) ? f.value.map((v) => v.trim()).filter(Boolean) : f.value]),
    );
    const res = await saveContentSection(siteId, section.key, fields);
    setBusy(null);
    if (!res.success) return showToast(res.error ?? 'Failed to save.', 'error');
    setSections((prev) => prev.map((s) => (s.key === section.key ? { ...s, dirty: false } : s)));
    showToast(`Saved “${section.key}”. ${siteName} picks it up on its next content fetch.`);
  };

  const remove = async (section: Section) => {
    if (confirmDelete !== section.key) return setConfirmDelete(section.key);
    setConfirmDelete(null);
    setBusy(section.key);
    const res = await deleteContentSection(siteId, section.key);
    setBusy(null);
    if (!res.success) return showToast(res.error ?? 'Failed to delete.', 'error');
    setSections((prev) => prev.filter((s) => s.key !== section.key));
    showToast(`Deleted “${section.key}”.`);
  };

  return (
    <>
      {sections.length === 0 && (
        <section className={ui.panel}>
          <EmptyState icon={<IconEdit size={22} />} title="No content yet">
            Add a section for each part of the website (for example <span className={ui.inlineCode}>hero</span> or{' '}
            <span className={ui.inlineCode}>about</span>), then add the fields its page shows.
          </EmptyState>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.key} className={ui.panel} aria-label={`Section ${section.key}`}>
          <div className={ui.panelHead}>
            <div>
              <h2 className={cx(ui.panelTitle, ui.mono)}>content.{section.key}</h2>
              <p className={ui.panelSub}>
                {section.fields.length} field{section.fields.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              className={cx(confirmDelete === section.key ? ui.btnDanger : ui.btnGhostDanger, ui.btnSm)}
              disabled={busy !== null}
              onClick={() => remove(section)}
            >
              <IconTrash size={14} /> {confirmDelete === section.key ? 'Confirm delete' : 'Delete section'}
            </button>
          </div>

          <div className={ui.panelBody}>
            <div className={ui.repeater}>
              {section.fields.map((field, i) => {
                const isList = Array.isArray(field.value);
                return (
                  <div key={i} className={ui.repeaterItem}>
                    <div className={ui.repeaterHead}>
                      <input
                        aria-label="Field key"
                        className={cx(ui.input, ui.mono)}
                        style={{ height: 34, maxWidth: 260, textTransform: 'none', letterSpacing: 0 }}
                        value={field.key}
                        onChange={(e) =>
                          update(section.key, (s) => ({
                            ...s,
                            fields: s.fields.map((f, j) => (j === i ? { ...f, key: e.target.value.trim() } : f)),
                          }))
                        }
                      />
                      <span style={{ marginLeft: 'auto' }}>{isList ? 'List · one item per line' : 'Text'}</span>
                      <button
                        type="button"
                        className={ui.btnIcon}
                        aria-label={`Remove field ${field.key}`}
                        onClick={() => update(section.key, (s) => ({ ...s, fields: s.fields.filter((_, j) => j !== i) }))}
                      >
                        <IconClose size={16} />
                      </button>
                    </div>
                    <textarea
                      className={ui.textarea}
                      aria-label={`Value of ${field.key}`}
                      rows={
                        isList
                          ? Math.max(3, (field.value as string[]).length + 1)
                          : Math.min(8, Math.max(2, Math.ceil(String(field.value).length / 90)))
                      }
                      value={isList ? (field.value as string[]).join('\n') : (field.value as string)}
                      onChange={(e) =>
                        update(section.key, (s) => ({
                          ...s,
                          fields: s.fields.map((f, j) => (j === i ? { ...f, value: isList ? e.target.value.split('\n') : e.target.value } : f)),
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={ui.panelFoot}>
            <button
              type="button"
              className={cx(ui.btnGhost, ui.btnSm)}
              style={{ marginRight: 'auto' }}
              onClick={() => update(section.key, (s) => ({ ...s, fields: [...s.fields, { key: `field${s.fields.length + 1}`, value: '' }] }))}
            >
              <IconPlus size={14} /> Text field
            </button>
            <button
              type="button"
              className={cx(ui.btnGhost, ui.btnSm)}
              onClick={() => update(section.key, (s) => ({ ...s, fields: [...s.fields, { key: `list${s.fields.length + 1}`, value: [] }] }))}
            >
              <IconPlus size={14} /> List field
            </button>
            {section.dirty && (
              <span className={ui.unsaved} style={{ marginRight: 0 }}>
                <span className={ui.dirtyDot} /> Unsaved
              </span>
            )}
            <button type="button" className={ui.btnPrimary} disabled={busy !== null || !section.dirty} onClick={() => save(section)}>
              {busy === section.key ? 'Saving…' : 'Save section'}
            </button>
          </div>
        </section>
      ))}

      <form className={ui.panel} onSubmit={addSection} aria-label="Add a section">
        <div className={ui.panelBody} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px' }}>
            <Field label="New section key" hint={KEY_HINT}>
              <input className={cx(ui.input, ui.mono)} placeholder="e.g. hero" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
            </Field>
          </div>
          <button type="submit" className={ui.btnPrimary} style={{ marginBottom: 22 }}>
            <IconPlus size={16} /> Add section
          </button>
        </div>
      </form>

      {toast}
    </>
  );
}
