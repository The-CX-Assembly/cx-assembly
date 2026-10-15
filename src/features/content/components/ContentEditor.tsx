'use client';

import { useMemo, useState } from 'react';
import { SiteContent } from '@/types';
import { updateSectionContent } from '@/features/content/actions';
import { IconPlus, IconTrash } from '@/components/admin/AdminIcons';
import { Field, cx, ui, useToast } from '@/components/admin/ui';

/**
 * Page copy for The CX Assembly. Each section below maps to one document in
 * siteContent/{key}; every field of every section is editable.
 */

type FieldKind = 'text' | 'textarea' | 'lines' | 'pillars' | 'markdown';

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  rows?: number;
  full?: boolean;
  hint?: string;
}

interface SectionDef {
  /** Document id in siteContent. */
  key: string;
  label: string;
  description: string;
  /** Where the copy lives in SiteContent. */
  read: (c: SiteContent) => Record<string, unknown>;
  write: (c: SiteContent, value: Record<string, unknown>) => SiteContent;
  fields: FieldDef[];
}

const LEAD_IN = 'Write it as “Lead in: the rest”. The part before the colon is emphasised on the page.';

const section = <K extends Exclude<keyof SiteContent, 'privacyPolicy'>>(
  key: K,
  label: string,
  description: string,
  fields: FieldDef[],
): SectionDef => ({
  key,
  label,
  description,
  read: (c) => c[key] as unknown as Record<string, unknown>,
  write: (c, value) => ({ ...c, [key]: value }),
  fields,
});

const SECTIONS: SectionDef[] = [
  section('hero', 'Hero', 'The first thing visitors see at the top of the home page.', [
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true, hint: 'The last two words are highlighted.' },
    { key: 'subheadline', label: 'Subheadline', kind: 'textarea', rows: 3, full: true },
    { key: 'tagline', label: 'Tagline', kind: 'text', full: true },
    { key: 'ctaPrimaryText', label: 'Join button text', kind: 'text' },
    { key: 'ctaSecondaryText', label: 'Founding leaders link text', kind: 'text' },
  ]),
  section('whyWeExist', 'Why We Exist', 'Section 01 on the home page.', [
    { key: 'badge', label: 'Section label', kind: 'text' },
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true },
    { key: 'paragraph1', label: 'Point 1', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph2', label: 'Point 2', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph3', label: 'Points 3 and 4', kind: 'textarea', rows: 4, full: true, hint: 'The first sentence becomes point 3; the rest becomes point 4.' },
    { key: 'conclusion', label: 'Closing line', kind: 'text', full: true },
  ]),
  section('philosophy', 'Philosophy', 'Section 02: how the community works.', [
    { key: 'badge', label: 'Section label', kind: 'text' },
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true },
    { key: 'intro', label: 'Introduction', kind: 'textarea', rows: 3, full: true },
    { key: 'pillars', label: 'Pillars', kind: 'pillars', full: true },
  ]),
  section('forLeaders', 'For CX Leaders', 'Section 03: what members get, with the Join tile.', [
    { key: 'badge', label: 'Section label', kind: 'text' },
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true },
    { key: 'subheadline', label: 'Subheadline', kind: 'textarea', rows: 2, full: true },
    { key: 'callout', label: 'Callout', kind: 'textarea', rows: 2, full: true },
    { key: 'takeaways', label: 'Benefit tiles', kind: 'lines', rows: 6, full: true, hint: `One tile per line. ${LEAD_IN}` },
    { key: 'closing', label: 'Closing line', kind: 'textarea', rows: 2, full: true },
    { key: 'ctaText', label: 'Join tile title', kind: 'text' },
    { key: 'note', label: 'Join tile text', kind: 'text' },
  ]),
  section('forPartners', 'For Partners', 'How brands and partners can work with the community.', [
    { key: 'badge', label: 'Section label', kind: 'text' },
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true },
    { key: 'paragraph1', label: 'Built through collaboration', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph2', label: 'Understanding before solutions', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph3', label: 'Meaningful industry engagement', kind: 'textarea', rows: 3, full: true },
    { key: 'principle', label: 'Guiding principle', kind: 'textarea', rows: 2, full: true, hint: LEAD_IN },
  ]),
  section('aboutUs', 'About Us', 'The Executive Assembly and its founder.', [
    { key: 'badge', label: 'Section label', kind: 'text' },
    { key: 'headline', label: 'Headline', kind: 'textarea', rows: 2, full: true },
    { key: 'paragraph1', label: 'Paragraph 1', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph2', label: 'Paragraph 2', kind: 'textarea', rows: 3, full: true },
    { key: 'paragraph3', label: 'Shared belief', kind: 'textarea', rows: 3, full: true, hint: LEAD_IN },
    { key: 'founderNote', label: 'Founder note', kind: 'textarea', rows: 3, full: true },
  ]),
  section('founding50', 'Founding 50', 'The intro on the Founding 50 page and its home-page teaser.', [
    { key: 'headline', label: 'Headline', kind: 'text', full: true },
    { key: 'subheadline', label: 'Subheadline', kind: 'text', full: true },
    { key: 'leadParagraph', label: 'Lead paragraph', kind: 'textarea', rows: 3, full: true },
    { key: 'description', label: 'Description', kind: 'textarea', rows: 6, full: true, hint: 'Leave a blank line between paragraphs.' },
  ]),
  {
    key: 'privacy',
    label: 'Privacy Policy',
    description: 'The full text of the Privacy Policy page.',
    read: (c) => ({ privacyPolicy: c.privacyPolicy }),
    write: (c, value) => ({ ...c, privacyPolicy: String(value.privacyPolicy ?? '') }),
    fields: [
      {
        key: 'privacyPolicy',
        label: 'Policy text',
        kind: 'markdown',
        rows: 22,
        full: true,
        hint: 'Start a line with “## ” for a heading and “- ” for a bullet; wrap words in **double asterisks** for bold.',
      },
    ],
  },
];

type Pillar = { title: string; description: string };

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saved, setSaved] = useState<SiteContent>(initialContent);
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, showToast] = useToast();

  const active = SECTIONS.find((s) => s.key === activeKey)!;
  const value = active.read(content);

  const dirtyKeys = useMemo(
    () => new Set(SECTIONS.filter((s) => JSON.stringify(s.read(content)) !== JSON.stringify(s.read(saved))).map((s) => s.key)),
    [content, saved],
  );
  const dirty = dirtyKeys.has(active.key);

  const setField = (key: string, fieldValue: unknown) => setContent((c) => active.write(c, { ...active.read(c), [key]: fieldValue }));

  const save = async () => {
    setIsSaving(true);
    const data = active.read(content);
    const res = await updateSectionContent(active.key, data);
    setIsSaving(false);
    if (!res.success) return showToast(res.error ?? 'Couldn’t save this section.', 'error');
    setSaved((s) => active.write(s, data));
    showToast(`${active.label} saved. The website updates within a minute.`);
  };

  const discard = () => setContent((c) => active.write(c, active.read(saved)));

  const renderField = (field: FieldDef) => {
    const v = value[field.key];

    if (field.kind === 'pillars') {
      const pillars = (Array.isArray(v) ? v : []) as Pillar[];
      const update = (next: Pillar[]) => setField(field.key, next);
      return (
        <div key={field.key} className={cx(ui.field, ui.full)}>
          <span className={ui.fieldLabel}>{field.label}</span>
          <div className={ui.repeater}>
            {pillars.map((p, i) => (
              <div key={i} className={ui.repeaterItem}>
                <div className={ui.repeaterHead}>
                  Pillar {i + 1}
                  <button
                    type="button"
                    className={cx(ui.btnGhostDanger, ui.btnSm)}
                    onClick={() => update(pillars.filter((_, j) => j !== i))}
                    aria-label={`Remove pillar ${i + 1}`}
                  >
                    <IconTrash size={14} /> Remove
                  </button>
                </div>
                <input
                  className={ui.input}
                  value={p.title}
                  aria-label={`Pillar ${i + 1} title`}
                  placeholder="Title"
                  onChange={(e) => update(pillars.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <textarea
                  className={ui.textarea}
                  rows={2}
                  value={p.description}
                  aria-label={`Pillar ${i + 1} description`}
                  placeholder="Description"
                  onChange={(e) => update(pillars.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
                />
              </div>
            ))}
            <button
              type="button"
              className={ui.btnGhost}
              style={{ alignSelf: 'flex-start' }}
              onClick={() => update([...pillars, { title: '', description: '' }])}
            >
              <IconPlus size={16} /> Add pillar
            </button>
          </div>
        </div>
      );
    }

    if (field.kind === 'lines') {
      const lines = Array.isArray(v) ? (v as string[]) : [];
      return (
        <Field key={field.key} label={field.label} hint={field.hint} full={field.full}>
          <textarea
            className={ui.textarea}
            rows={field.rows ?? 5}
            value={lines.join('\n')}
            onChange={(e) => setField(field.key, e.target.value.split('\n'))}
            onBlur={(e) => setField(field.key, e.target.value.split('\n').map((l) => l.trim()).filter(Boolean))}
          />
        </Field>
      );
    }

    const text = typeof v === 'string' ? v : '';
    return (
      <Field key={field.key} label={field.label} hint={field.hint} full={field.full}>
        {field.kind === 'text' ? (
          <input className={ui.input} value={text} onChange={(e) => setField(field.key, e.target.value)} />
        ) : (
          <textarea
            className={cx(ui.textarea, field.kind === 'markdown' && ui.mono)}
            rows={field.rows ?? 3}
            value={text}
            onChange={(e) => setField(field.key, e.target.value)}
          />
        )}
      </Field>
    );
  };

  return (
    <div className={ui.split}>
      <nav className={ui.sideList} aria-label="Page sections">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={cx(ui.sideItem, s.key === activeKey && ui.sideItemOn)}
            aria-current={s.key === activeKey ? 'page' : undefined}
            onClick={() => setActiveKey(s.key)}
          >
            {s.label}
            {dirtyKeys.has(s.key) && <span className={ui.dirtyDot} title="Unsaved changes" aria-label="Unsaved changes" />}
          </button>
        ))}
      </nav>

      <section className={ui.panel} aria-label={`${active.label} section`}>
        <div className={ui.panelHead}>
          <div>
            <h2 className={ui.panelTitle}>{active.label}</h2>
            <p className={ui.panelSub}>{active.description}</p>
          </div>
        </div>
        <form
          className={ui.panelBody}
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          id="content-form"
        >
          <div className={ui.formGrid}>{active.fields.map(renderField)}</div>
        </form>
        <div className={cx(ui.panelFoot, ui.stickyFoot)}>
          {dirty && (
            <span className={ui.unsaved}>
              <span className={ui.dirtyDot} /> Unsaved changes
            </span>
          )}
          <button type="button" className={ui.btnGhost} onClick={discard} disabled={!dirty || isSaving}>
            Discard
          </button>
          <button type="submit" form="content-form" className={ui.btnPrimary} disabled={!dirty || isSaving}>
            {isSaving ? 'Saving…' : `Save ${active.label}`}
          </button>
        </div>
      </section>

      {toast}
    </div>
  );
}
