'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSite, deleteSite, rotateSiteKey, updateSite } from '../controllers/sites.actions';
import { SITE_MODULES, slugifySiteId } from '../models/site.constants';
import { Site, SiteModule } from '../models/site.model';
import { IconChevronDown, IconEdit, IconExternal, IconGlobe, IconPlus, IconTrash } from '@/components/admin/AdminIcons';
import { Avatar, Badge, Drawer, EmptyState, Field, Switch, cx, ui, useToast } from '@/components/admin/ui';

interface Draft {
  id: string;
  name: string;
  url: string;
  origins: string;
  modules: SiteModule[];
}

const emptyDraft: Draft = { id: '', name: '', url: '', origins: '', modules: [] };

const toPayload = (d: Draft) => ({
  name: d.name,
  url: d.url.trim(),
  allowedOrigins: d.origins.split(/[\s,]+/).map((o) => o.trim()).filter(Boolean),
  modules: d.modules,
});

export default function SitesManager({
  sites,
  leadCounts,
  baseUrl,
  canWrite,
}: {
  sites: Site[];
  leadCounts: Record<string, number>;
  baseUrl: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  // null: drawer closed; isNew: adding; otherwise editing that site.
  const [form, setForm] = useState<{ draft: Draft; isNew: boolean; builtIn?: boolean } | null>(null);
  const [idTouched, setIdTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ siteId: string; action: 'rotate' | 'delete' } | null>(null);
  const [revealed, setRevealed] = useState<{ siteId: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, showToast] = useToast();

  // Destructive actions need a second click within a few seconds.
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 4000);
    return () => clearTimeout(t);
  }, [confirm]);

  const needsConfirm = (siteId: string, action: 'rotate' | 'delete') => {
    if (confirm?.siteId === siteId && confirm.action === action) {
      setConfirm(null);
      return false;
    }
    setConfirm({ siteId, action });
    return true;
  };

  const setDraft = (patch: Partial<Draft>) => setForm((f) => (f ? { ...f, draft: { ...f.draft, ...patch } } : f));

  const openNew = () => {
    setIdTouched(false);
    setForm({ draft: emptyDraft, isNew: true });
  };

  const openEdit = (s: Site) =>
    setForm({
      draft: { id: s.id, name: s.name, url: s.url ?? '', origins: s.allowedOrigins.join('\n'), modules: s.modules },
      isNew: false,
      builtIn: s.builtIn,
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    const res = form.isNew
      ? await createSite({ id: form.draft.id, ...toPayload(form.draft) })
      : await updateSite(form.draft.id, toPayload(form.draft));
    setBusy(false);
    if (!res.success) return showToast(res.error ?? 'Something went wrong.', 'error');
    showToast(form.isNew ? `Added ${form.draft.name}. Create its API key next.` : `Saved ${form.draft.name}.`);
    setForm(null);
    router.refresh();
  };

  const rotate = async (s: Site) => {
    if (s.apiKeyPrefix && needsConfirm(s.id, 'rotate')) return;
    setBusy(true);
    const res = await rotateSiteKey(s.id);
    setBusy(false);
    if (!res.success) return showToast(res.error, 'error');
    setCopied(false);
    setRevealed({ siteId: s.id, key: res.key });
    router.refresh();
  };

  const remove = async (s: Site) => {
    if (needsConfirm(s.id, 'delete')) return;
    setBusy(true);
    const res = await deleteSite(s.id);
    setBusy(false);
    if (!res.success) return showToast(res.error ?? 'Couldn’t remove the website.', 'error');
    showToast(`Removed ${s.name}. Its leads stay in the inbox.`);
    router.refresh();
  };

  const copyKey = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.key);
      setCopied(true);
    } catch {
      showToast('Couldn’t copy. Select the key and copy it manually.', 'error');
    }
  };

  const confirming = (siteId: string, action: 'rotate' | 'delete') => confirm?.siteId === siteId && confirm.action === action;

  return (
    <>
      {!canWrite && (
        <div className={ui.notice}>The database isn’t connected in this environment, so websites can’t be added or changed here.</div>
      )}

      {canWrite && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 16 }}>
          <button type="button" className={ui.btnPrimary} onClick={openNew}>
            <IconPlus size={16} /> Add a website
          </button>
        </div>
      )}

      {sites.length === 0 && (
        <section className={ui.panel}>
          <EmptyState icon={<IconGlobe size={22} />} title="No websites yet" />
        </section>
      )}

      {sites.map((s) => (
        <section key={s.id} className={ui.panel} aria-label={s.name}>
          <div className={ui.panelHead} style={{ flexWrap: 'wrap' }}>
            <div className={ui.person}>
              <Avatar name={s.name.replace(/^the\s+/i, '')} size="lg" />
              <div>
                <h2 className={ui.panelTitle}>
                  {s.name} {s.builtIn && <Badge tone="violet">This app</Badge>}
                </h2>
                <div className={ui.metaRow} style={{ marginTop: 4 }}>
                  <span className={ui.inlineCode}>{s.id}</span>
                  {s.url && (
                    <a className={ui.link} href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.url.replace(/^https?:\/\//, '')} <IconExternal size={12} />
                    </a>
                  )}
                  <span>
                    {leadCounts[s.id] ?? 0} lead{(leadCounts[s.id] ?? 0) === 1 ? '' : 's'}
                  </span>
                  {s.modules.map((m) => (
                    <Badge key={m} tone="gray">
                      {SITE_MODULES.find((x) => x.key === m)?.label ?? m}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {canWrite && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button type="button" className={cx(ui.btnGhost, ui.btnSm)} disabled={busy} onClick={() => openEdit(s)}>
                  <IconEdit size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={cx(confirming(s.id, 'rotate') ? ui.btnDanger : ui.btnGhost, ui.btnSm)}
                  disabled={busy}
                  onClick={() => rotate(s)}
                >
                  {confirming(s.id, 'rotate') ? 'Old key stops working: confirm' : s.apiKeyPrefix ? 'Replace API key' : 'Create API key'}
                </button>
                {!s.builtIn && (
                  <button
                    type="button"
                    className={cx(confirming(s.id, 'delete') ? ui.btnDanger : ui.btnGhostDanger, ui.btnSm)}
                    disabled={busy}
                    onClick={() => remove(s)}
                  >
                    <IconTrash size={14} /> {confirming(s.id, 'delete') ? 'Confirm remove' : 'Remove'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={ui.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={ui.metaRow}>
              <span>
                API key:{' '}
                {s.apiKeyPrefix ? (
                  <span className={ui.inlineCode}>{s.apiKeyPrefix}…</span>
                ) : (
                  <Badge tone="amber" dot>
                    Not created yet
                  </Badge>
                )}
              </span>
              <span>
                Browser origins:{' '}
                {s.allowedOrigins.length ? s.allowedOrigins.map((o) => <span key={o} className={ui.inlineCode} style={{ marginRight: 6 }}>{o}</span>) : 'none (server-side calls only)'}
              </span>
            </div>

            {revealed?.siteId === s.id && (
              <div className={ui.keyBox} role="status">
                <strong style={{ flexBasis: '100%', fontSize: '0.875rem', color: '#15803D' }}>
                  Copy this key now. It won’t be shown again.
                </strong>
                <code>{revealed.key}</code>
                <button type="button" className={ui.btnPrimary} onClick={copyKey}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <button type="button" className={ui.btnGhost} onClick={() => setRevealed(null)}>
                  Done
                </button>
                <span className={ui.fieldHint} style={{ flexBasis: '100%' }}>
                  Store it on {s.name} as a server-side environment variable, e.g. <span className={ui.inlineCode}>ASSEMBLY_API_KEY</span>.
                </span>
              </div>
            )}
          </div>
        </section>
      ))}

      <details className={cx(ui.panel, ui.guide)}>
        <summary>
          Connecting a website to this dashboard
          <IconChevronDown size={18} />
        </summary>
        <div className={ui.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.875rem' }}>
          <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--a-text-2)' }}>
            <li>Add the website and create its API key.</li>
            <li>Save the key on that website as a server-side environment variable.</li>
            <li>Call these two endpoints from its server code.</li>
          </ol>
          <span className={ui.sectionLabel}>Fetch content (settings, sections, and CMO Speakers if turned on)</span>
          <code className={ui.code}>{`const res = await fetch('${baseUrl}/api/v1/content', {
  headers: { 'x-api-key': process.env.ASSEMBLY_API_KEY },
  next: { revalidate: 60 }, // Next.js: refresh at most once a minute
});
const { settings, content, speakers } = await res.json();
// content.hero.headline, content.about.paragraphs[0], …`}</code>
          <span className={ui.sectionLabel}>Send a form submission</span>
          <code className={ui.code}>{`const res = await fetch('${baseUrl}/api/v1/leads', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-key': process.env.ASSEMBLY_API_KEY },
  body: JSON.stringify({
    fullName: 'Jane Doe',            // required
    email: 'jane@company.com',       // required
    company: 'Acme', designation: 'CMO', phone: '', linkedinUrl: '', message: '',
    type: 'other',                   // 'cx_leader' | 'partner' | 'other'
    source: {                        // which button and page, and the campaign link the visit started on
      cta: 'hero', page: '/about', landingPage: '/', referrer: 'https://www.linkedin.com/',
      utmSource: 'linkedin', utmMedium: 'social', utmCampaign: 'launch',
    },
    extra: { city: 'Mumbai' },       // any other form fields
    hp_field: '',                    // honeypot: leave empty
  }),
});
// 201 { ok: true, id } · 401 bad key · 422 { error, fields } · 503 retry later`}</code>
          <p className={ui.fieldHint} style={{ fontSize: '0.8125rem' }}>
            Only show visitors a “thank you” when the response is <span className={ui.inlineCode}>201</span>. On any other status, show an
            error so the lead isn’t lost.
          </p>
        </div>
      </details>

      {form && (
        <Drawer
          title={form.isNew ? 'Add a website' : `Edit ${form.draft.name}`}
          subtitle={form.isNew ? 'It gets its own content, leads and API key.' : form.draft.id}
          onClose={() => setForm(null)}
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" form="site-form" className={ui.btnPrimary} disabled={busy}>
                {busy ? 'Saving…' : form.isNew ? 'Add website' : 'Save changes'}
              </button>
            </>
          }
        >
          <form id="site-form" className={ui.form} onSubmit={submit}>
            <Field label="Website name" required>
              <input
                className={ui.input}
                value={form.draft.name}
                disabled={form.builtIn}
                placeholder="The CMO Assembly"
                required
                onChange={(e) =>
                  setDraft({
                    name: e.target.value,
                    ...(form.isNew && !idTouched ? { id: slugifySiteId(e.target.value) } : {}),
                  })
                }
              />
            </Field>
            {form.isNew && (
              <Field label="Site id" required hint="Permanent. Lowercase letters, numbers and dashes.">
                <input
                  className={cx(ui.input, ui.mono)}
                  value={form.draft.id}
                  placeholder="cmo-assembly"
                  required
                  onChange={(e) => {
                    setIdTouched(true);
                    setDraft({ id: e.target.value.toLowerCase() });
                  }}
                />
              </Field>
            )}
            <Field label="Website URL">
              <input
                className={ui.input}
                type="url"
                value={form.draft.url}
                placeholder="https://thecmoassembly.com"
                onChange={(e) => setDraft({ url: e.target.value })}
              />
            </Field>
            <Field
              label="Allowed browser origins"
              hint="Only needed if the website’s pages call the API straight from the browser. One per line."
            >
              <textarea
                className={cx(ui.textarea, ui.mono)}
                rows={3}
                value={form.draft.origins}
                placeholder={'https://thecmoassembly.com\nhttps://www.thecmoassembly.com'}
                onChange={(e) => setDraft({ origins: e.target.value })}
              />
            </Field>
            {!form.builtIn && (
              <div className={ui.section}>
                <span className={ui.sectionLabel}>Extra features</span>
                {SITE_MODULES.map((m) => {
                  const on = form.draft.modules.includes(m.key);
                  return (
                    <label key={m.key} className={ui.switchRow}>
                      <span className={ui.switchText}>
                        <strong>{m.label}</strong>
                        <small>{m.description}</small>
                      </span>
                      <Switch
                        checked={on}
                        label={m.label}
                        onChange={(v) =>
                          setDraft({ modules: v ? [...form.draft.modules, m.key] : form.draft.modules.filter((x) => x !== m.key) })
                        }
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </form>
        </Drawer>
      )}

      {toast}
    </>
  );
}
