'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSite, deleteSite, rotateSiteKey, updateSite } from '@/app/actions/sites';
import { SITE_MODULES, slugifySiteId } from '@/lib/site-constants';
import { Site, SiteModule } from '@/types';

interface Draft {
  id: string;
  name: string;
  url: string;
  origins: string;
  modules: SiteModule[];
}

const emptyDraft: Draft = { id: '', name: '', url: '', origins: '', modules: [] };

const card: React.CSSProperties = { background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' };
const input: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: '0.875rem' };
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' };
const muted: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.8125rem' };
const ghostBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' };
const code: React.CSSProperties = { display: 'block', whiteSpace: 'pre', overflowX: 'auto', background: '#0F172A', color: '#E2E8F0', padding: '14px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', lineHeight: 1.6, fontFamily: 'ui-monospace, monospace' };

const toPayload = (d: Draft) => ({
  name: d.name,
  url: d.url.trim(),
  allowedOrigins: d.origins.split(/[\s,]+/).map((o) => o.trim()).filter(Boolean),
  modules: d.modules,
});

function SiteForm({
  draft,
  setDraft,
  isNew,
  builtIn,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  isNew: boolean;
  builtIn?: boolean;
}) {
  const [idTouched, setIdTouched] = useState(false);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      <div>
        <label style={label} htmlFor="site-name">Website name</label>
        <input
          id="site-name"
          style={input}
          value={draft.name}
          disabled={builtIn}
          placeholder="The CMO Assembly"
          onChange={(e) =>
            setDraft({ ...draft, name: e.target.value, id: isNew && !idTouched ? slugifySiteId(e.target.value) : draft.id })
          }
        />
      </div>
      {isNew && (
        <div>
          <label style={label} htmlFor="site-id">Site id</label>
          <input
            id="site-id"
            style={{ ...input, fontFamily: 'ui-monospace, monospace' }}
            value={draft.id}
            placeholder="cmo-assembly"
            onChange={(e) => {
              setIdTouched(true);
              setDraft({ ...draft, id: e.target.value.toLowerCase() });
            }}
          />
          <p style={{ ...muted, marginTop: 4 }}>Permanent. Lowercase letters, numbers and dashes.</p>
        </div>
      )}
      <div>
        <label style={label} htmlFor="site-url">Website URL</label>
        <input id="site-url" style={input} value={draft.url} placeholder="https://thecmoassembly.com" onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={label} htmlFor="site-origins">Allowed browser origins (optional)</label>
        <textarea
          id="site-origins"
          rows={2}
          style={{ ...input, fontFamily: 'ui-monospace, monospace' }}
          value={draft.origins}
          placeholder={'https://thecmoassembly.com\nhttps://www.thecmoassembly.com'}
          onChange={(e) => setDraft({ ...draft, origins: e.target.value })}
        />
        <p style={{ ...muted, marginTop: 4 }}>
          Only needed if the website&apos;s pages call the API straight from the browser. Server-side calls don&apos;t need this.
        </p>
      </div>
      {!builtIn && (
        <fieldset style={{ gridColumn: '1 / -1', border: 0, padding: 0, margin: 0 }}>
          <legend style={label}>Extra features</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {SITE_MODULES.map((m) => (
              <label key={m.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={draft.modules.includes(m.key)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      modules: e.target.checked ? [...draft.modules, m.key] : draft.modules.filter((x) => x !== m.key),
                    })
                  }
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong>{m.label}</strong>
                  <span style={{ ...muted, display: 'block' }}>{m.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

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
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ siteId: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>, after?: () => void) => {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.success) return setError(res.error ?? 'Something went wrong.');
    after?.();
    router.refresh();
  };

  const startEdit = (s: Site) => {
    setEditing(s.id);
    setEditDraft({ id: s.id, name: s.name, url: s.url ?? '', origins: s.allowedOrigins.join('\n'), modules: s.modules });
  };

  const rotate = async (s: Site) => {
    const replacing = Boolean(s.apiKeyPrefix);
    if (replacing && !confirm(`Replace the API key for ${s.name}? The current key stops working immediately.`)) return;
    setBusy(true);
    setError(null);
    const res = await rotateSiteKey(s.id);
    setBusy(false);
    if (!res.success) return setError(res.error);
    setCopied(false);
    setRevealed({ siteId: s.id, key: res.key });
    router.refresh();
  };

  const copyKey = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.key);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!canWrite && (
        <div style={{ ...card, background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E', fontSize: '0.875rem' }}>
          The database isn&apos;t connected in this environment, so websites can&apos;t be added or changed here.
        </div>
      )}
      {error && (
        <div role="alert" style={{ padding: '12px 18px', background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {sites.map((s) => {
        const isEditing = editing === s.id;
        return (
          <section key={s.id} style={card} aria-label={s.name}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {s.name}
                  {s.builtIn && (
                    <span className="badge-pill badge-navy" style={{ marginLeft: 10, fontSize: '0.625rem', verticalAlign: 'middle' }}>
                      This app
                    </span>
                  )}
                </h2>
                <p style={{ ...muted, marginTop: 4 }}>
                  <code>{s.id}</code>
                  {s.url && (
                    <>
                      {' · '}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
                        {s.url.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {' · '}
                  {leadCounts[s.id] ?? 0} lead{(leadCounts[s.id] ?? 0) === 1 ? '' : 's'}
                  {s.modules.length > 0 && ` · ${s.modules.map((m) => SITE_MODULES.find((x) => x.key === m)?.label).join(', ')}`}
                </p>
              </div>
              {!isEditing && canWrite && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" style={ghostBtn} disabled={busy} onClick={() => startEdit(s)}>
                    Edit
                  </button>
                  <button type="button" style={ghostBtn} disabled={busy} onClick={() => rotate(s)}>
                    {s.apiKeyPrefix ? 'Replace API key' : 'Create API key'}
                  </button>
                  {!s.builtIn && (
                    <button
                      type="button"
                      style={{ ...ghostBtn, color: '#B91C1C', borderColor: '#FECACA' }}
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`Remove ${s.name}? Its content, leaders and testimonials are deleted. Its leads stay in the inbox.`)) {
                          run(() => deleteSite(s.id));
                        }
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <p style={{ ...muted, marginTop: 12 }}>
              API key:{' '}
              {s.apiKeyPrefix ? <code>{s.apiKeyPrefix}…</code> : <strong style={{ color: '#B45309' }}>none yet</strong>}
              {s.allowedOrigins.length > 0 && <> · Browser origins: {s.allowedOrigins.join(', ')}</>}
            </p>

            {revealed?.siteId === s.id && (
              <div style={{ marginTop: 16, padding: 16, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 700, color: '#047857', marginBottom: 8, fontSize: '0.875rem' }}>
                  Copy this key now. It won&apos;t be shown again.
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <code style={{ ...code, flex: '1 1 320px', padding: '10px 12px' }}>{revealed.key}</code>
                  <button type="button" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.8125rem' }} onClick={copyKey}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                  <button type="button" style={ghostBtn} onClick={() => setRevealed(null)}>
                    Done
                  </button>
                </div>
                <p style={{ ...muted, marginTop: 8 }}>
                  Store it as a server-side environment variable on {s.name}, e.g. <code>ASSEMBLY_API_KEY</code>.
                </p>
              </div>
            )}

            {isEditing && (
              <div style={{ marginTop: 20 }}>
                <SiteForm draft={editDraft} setDraft={setEditDraft} isNew={false} builtIn={s.builtIn} />
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.875rem' }}
                    disabled={busy}
                    onClick={() => run(() => updateSite(s.id, toPayload(editDraft)), () => setEditing(null))}
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" style={ghostBtn} onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {canWrite &&
        (adding ? (
          <section style={card} aria-label="Add a website">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 20 }}>Add a website</h2>
            <SiteForm draft={newDraft} setDraft={setNewDraft} isNew />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.875rem' }}
                disabled={busy}
                onClick={() =>
                  run(() => createSite({ id: newDraft.id, ...toPayload(newDraft) }), () => {
                    setAdding(false);
                    setNewDraft(emptyDraft);
                  })
                }
              >
                {busy ? 'Adding…' : 'Add website'}
              </button>
              <button type="button" style={ghostBtn} onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </section>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', padding: '12px 22px', fontSize: '0.875rem' }}
            onClick={() => setAdding(true)}
          >
            + Add a website
          </button>
        ))}

      <details style={card}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, color: 'var(--color-primary)' }}>Connecting a website to this dashboard</summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16, fontSize: '0.875rem' }}>
          <p>
            1. Add the website above and create its API key. 2. Save the key on that website as a server-side environment
            variable. 3. Call these two endpoints from its server code:
          </p>
          <p style={{ fontWeight: 700 }}>Fetch content (settings, sections, and leaders / testimonials if turned on)</p>
          <code style={code}>{`const res = await fetch('${baseUrl}/api/v1/content', {
  headers: { 'x-api-key': process.env.ASSEMBLY_API_KEY },
  next: { revalidate: 60 }, // Next.js: refresh at most once a minute
});
const { settings, content, leaders, voices } = await res.json();
// content.hero.headline, content.about.paragraphs[0], …`}</code>
          <p style={{ fontWeight: 700 }}>Send a form submission</p>
          <code style={code}>{`const res = await fetch('${baseUrl}/api/v1/leads', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-key': process.env.ASSEMBLY_API_KEY },
  body: JSON.stringify({
    fullName: 'Jane Doe',            // required
    email: 'jane@company.com',       // required
    company: 'Acme', designation: 'CMO', phone: '', linkedinUrl: '', message: '',
    type: 'other',                   // 'cx_leader' | 'partner' | 'other'
    source: { cta: 'hero', page: '/about' },   // which button, which page
    extra: { city: 'Mumbai' },       // any other form fields
    hp_field: '',                    // honeypot: leave empty
  }),
});
// 201 { ok: true, id } · 401 bad key · 422 { error, fields } · 503 retry later`}</code>
          <p style={muted}>
            Only show visitors a &quot;thank you&quot; when the response is <code>201</code>. On any other status, show an
            error so the lead isn&apos;t lost.
          </p>
        </div>
      </details>
    </div>
  );
}
