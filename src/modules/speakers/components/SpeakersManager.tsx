'use client';

import { useEffect, useMemo, useState } from 'react';
import { Speaker } from '../models/speaker.model';
import { saveSpeaker, deleteSpeaker, reorderSpeakers, uploadSpeakerPhoto } from '../controllers/speakers.actions';
import Pagination from '@/components/admin/Pagination';
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconLinkedIn,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
  IconUpload,
} from '@/components/admin/AdminIcons';
import {
  Avatar,
  Badge,
  Drawer,
  EmptyState,
  Field,
  PageHeader,
  SearchField,
  Stats,
  Switch,
  Tabs,
  cx,
  ui,
  useToast,
} from '@/components/admin/ui';

const PAGE_SIZE = 10;

type Draft = Partial<Speaker>;
type Filter = 'all' | 'live' | 'draft';

const emptyDraft = (order: number): Draft => ({
  name: '',
  designation: '',
  company: '',
  photoUrl: '',
  linkedinUrl: '',
  bio: '',
  order,
  published: true,
});

export default function SpeakersManager({ siteId, initialSpeakers }: { siteId: string; initialSpeakers: Speaker[] }) {
  const [speakers, setSpeakers] = useState<Speaker[]>(initialSpeakers);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [toast, showToast] = useToast();

  // A delete needs a second click within a few seconds.
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(null), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return speakers.filter(
      (s) =>
        (filter === 'all' || (filter === 'live' ? s.published : !s.published)) &&
        (!term || [s.name, s.company, s.designation].some((v) => (v ?? '').toLowerCase().includes(term))),
    );
  }, [speakers, search, filter]);

  // Reordering only makes sense on the full, unfiltered list.
  const canReorder = filter === 'all' && !search.trim();

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const pageSpeakers = visible.slice(offset, offset + PAGE_SIZE);

  const live = speakers.filter((s) => s.published).length;

  const refilter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const moveSpeaker = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= speakers.length) return;
    const previous = speakers;
    const next = [...speakers];
    [next[index], next[target]] = [next[target], next[index]];
    setSpeakers(next);
    const res = await reorderSpeakers(siteId, next.map((s) => s.id));
    if (!res.success) {
      setSpeakers(previous);
      showToast(res.error ?? 'Couldn’t save the new order.', 'error');
    }
  };

  const togglePublished = async (speaker: Speaker) => {
    const updated = { ...speaker, published: !speaker.published };
    setBusyId(speaker.id);
    setSpeakers((prev) => prev.map((s) => (s.id === speaker.id ? updated : s)));
    const res = await saveSpeaker(siteId, updated);
    setBusyId(null);
    if (!res.success) {
      setSpeakers((prev) => prev.map((s) => (s.id === speaker.id ? speaker : s)));
      showToast(res.error ?? 'Couldn’t update the speaker.', 'error');
    } else {
      showToast(updated.published ? `${speaker.name} is now live on the website.` : `${speaker.name} is hidden from the website.`);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadSpeakerPhoto(siteId, formData);
      if (result.success) setDraft((prev) => ({ ...prev, photoUrl: result.url }));
      else showToast(result.error, 'error');
    } catch (err) {
      console.warn('Photo upload failed:', err);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.name?.trim() || !draft?.company?.trim()) {
      showToast('Name and company are required.', 'error');
      return;
    }

    setIsSaving(true);
    const data: Omit<Speaker, 'id'> & { id?: string } = {
      id: draft.id,
      name: draft.name.trim(),
      designation: draft.designation?.trim() || '',
      company: draft.company.trim(),
      photoUrl: draft.photoUrl?.trim() || '',
      linkedinUrl: draft.linkedinUrl?.trim() || '',
      bio: draft.bio?.trim() || '',
      order: draft.order ?? speakers.length + 1,
      published: draft.published ?? true,
    };

    const res = await saveSpeaker(siteId, data);
    setIsSaving(false);
    if (!res.success) {
      showToast(res.error ?? 'Failed to save the speaker.', 'error');
      return;
    }
    if (draft.id) {
      setSpeakers((prev) => prev.map((s) => (s.id === draft.id ? ({ ...data, id: s.id } as Speaker) : s)));
    } else {
      // Keep the stored id so editing this speaker again updates the same record.
      setSpeakers((prev) => [...prev, { ...data, id: res.id ?? `temp-${Date.now()}` } as Speaker]);
      setFilter('all');
      setSearch('');
      setPage(Math.ceil((speakers.length + 1) / PAGE_SIZE));
    }
    setDraft(null);
    showToast(draft.id ? `Saved ${data.name}.` : `Added ${data.name}.`);
  };

  const handleDelete = async (speaker: Speaker) => {
    if (confirmDelete !== speaker.id) return setConfirmDelete(speaker.id);
    setConfirmDelete(null);
    setBusyId(speaker.id);
    const res = await deleteSpeaker(siteId, speaker.id);
    setBusyId(null);
    if (res.success) {
      setSpeakers((prev) => prev.filter((s) => s.id !== speaker.id));
      showToast(`Removed ${speaker.name}.`);
    } else {
      showToast(res.error ?? 'Couldn’t remove the speaker.', 'error');
    }
  };

  const set = (patch: Draft) => setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <div className={cx(ui.page, ui.pageFill)} data-page-fill>
      <PageHeader
        title="CMO Speakers"
        count={speakers.length}
        actions={
          <button type="button" className={ui.btnPrimary} onClick={() => setDraft(emptyDraft(speakers.length + 1))}>
            <IconPlus size={16} /> Add CMO Speaker
          </button>
        }
      />

      <Stats
        items={[
          { label: 'Speakers', value: speakers.length, color: 'var(--a-violet)', onClick: () => refilter(setFilter)('all') },
          { label: 'Live on the website', value: live, color: 'var(--a-green)', onClick: () => refilter(setFilter)('live') },
          { label: 'Drafts', value: speakers.length - live, color: 'var(--a-gray)', onClick: () => refilter(setFilter)('draft') },
        ]}
      />

      <section className={ui.panel} aria-label="CMO Speakers">
        <Tabs
          label="Filter speakers"
          value={filter}
          onChange={refilter(setFilter)}
          items={[
            { value: 'all', label: 'All', count: speakers.length },
            { value: 'live', label: 'Live', count: live },
            { value: 'draft', label: 'Drafts', count: speakers.length - live },
          ]}
        />
        <div className={ui.toolbar}>
          <SearchField value={search} onChange={refilter(setSearch)} placeholder="Search name, company or role…" />
          {!canReorder && <span className={cx(ui.count, ui.toolbarEnd)}>Clear the search and filter to reorder</span>}
        </div>

        <div className={ui.panelScroll}>
          {visible.length === 0 ? (
            <EmptyState
              icon={speakers.length ? <IconSearch size={22} /> : <IconStar size={22} />}
              title={speakers.length ? 'No speakers match' : 'No speakers yet'}
            >
              {speakers.length ? 'Try a different search or filter.' : 'Add your first CMO Speaker to show them on the website.'}
            </EmptyState>
          ) : (
            <div className={ui.tableWrap}>
              <table className={cx(ui.table, ui.tableCards)}>
                <thead>
                  <tr>
                    <th>Speaker</th>
                    <th>Role</th>
                    <th>Order</th>
                    <th>On website</th>
                    <th className={ui.alignRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSpeakers.map((speaker, i) => {
                    // Position in the full list: ordering spans pages.
                    const idx = speakers.indexOf(speaker);
                    const busy = busyId === speaker.id;
                    return (
                      <tr key={speaker.id} style={{ '--i': i } as React.CSSProperties}>
                        <td>
                          <div className={ui.person}>
                            <Avatar name={speaker.name} src={speaker.photoUrl || undefined} />
                            <div>
                              <span className={ui.cellMain}>{speaker.name}</span>
                              <span className={ui.cellSub}>
                                {speaker.linkedinUrl ? (
                                  <a className={ui.link} href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <IconLinkedIn size={12} /> LinkedIn
                                  </a>
                                ) : (
                                  'No LinkedIn'
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={ui.cardFull}>
                          <span className={ui.cellMain} style={{ fontWeight: 500 }}>
                            {speaker.designation || '—'}
                          </span>
                          <span className={ui.cellSub}>{speaker.company}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span className={ui.count} style={{ minWidth: 24, fontWeight: 700 }}>
                              {idx + 1}
                            </span>
                            <button
                              type="button"
                              className={ui.btnIcon}
                              disabled={!canReorder || idx === 0}
                              onClick={() => moveSpeaker(idx, 'up')}
                              aria-label={`Move ${speaker.name} up`}
                              title="Move up"
                            >
                              <IconArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              className={ui.btnIcon}
                              disabled={!canReorder || idx === speakers.length - 1}
                              onClick={() => moveSpeaker(idx, 'down')}
                              aria-label={`Move ${speaker.name} down`}
                              title="Move down"
                            >
                              <IconArrowDown size={16} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Switch
                              checked={speaker.published}
                              disabled={busy}
                              onChange={() => togglePublished(speaker)}
                              label={speaker.published ? `Hide ${speaker.name} from the website` : `Show ${speaker.name} on the website`}
                            />
                            <Badge tone={speaker.published ? 'green' : 'gray'} dot>
                              {speaker.published ? 'Live' : 'Draft'}
                            </Badge>
                          </div>
                        </td>
                        <td className={cx(ui.alignRight, ui.cardFull)}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button type="button" className={cx(ui.btnGhost, ui.btnSm)} onClick={() => setDraft(speaker)} disabled={busy}>
                              <IconEdit size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className={cx(confirmDelete === speaker.id ? ui.btnDanger : ui.btnGhostDanger, ui.btnSm)}
                              onClick={() => handleDelete(speaker)}
                              disabled={busy}
                              aria-label={confirmDelete === speaker.id ? `Confirm removing ${speaker.name}` : `Delete ${speaker.name}`}
                            >
                              <IconTrash size={14} /> {confirmDelete === speaker.id ? 'Confirm' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onChange={setPage} noun="speakers" />
      </section>

      {draft && (
        <Drawer
          title={draft.id ? 'Edit CMO Speaker' : 'Add CMO Speaker'}
          subtitle={draft.id ? draft.name : 'Shown on the home page and the Founding 50 page.'}
          onClose={() => setDraft(null)}
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button type="submit" form="speaker-form" className={ui.btnPrimary} disabled={isSaving || isUploading}>
                {isSaving ? 'Saving…' : draft.id ? 'Save changes' : 'Add speaker'}
              </button>
            </>
          }
        >
          <form id="speaker-form" className={ui.form} onSubmit={handleSave}>
            <div className={ui.section}>
              <span className={ui.sectionLabel}>Headshot</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Avatar name={draft.name || '?'} src={draft.photoUrl || undefined} size="xl" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className={ui.btnGhost} style={{ cursor: isUploading ? 'progress' : 'pointer' }}>
                    <IconUpload size={16} /> {isUploading ? 'Uploading…' : draft.photoUrl ? 'Replace photo' : 'Upload photo'}
                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={isUploading} />
                  </label>
                  <span className={ui.fieldHint}>Square JPG or PNG, under 5 MB.</span>
                  {draft.photoUrl && (
                    <button type="button" className={cx(ui.btnGhostDanger, ui.btnSm)} onClick={() => set({ photoUrl: '' })}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={ui.formGrid}>
              <Field label="Full name" required>
                <input className={ui.input} value={draft.name ?? ''} onChange={(e) => set({ name: e.target.value })} required />
              </Field>
              <Field label="Company" required>
                <input className={ui.input} value={draft.company ?? ''} onChange={(e) => set({ company: e.target.value })} required />
              </Field>
              <Field label="Designation">
                <input
                  className={ui.input}
                  value={draft.designation ?? ''}
                  placeholder="Chief Customer Officer"
                  onChange={(e) => set({ designation: e.target.value })}
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  className={ui.input}
                  type="url"
                  value={draft.linkedinUrl ?? ''}
                  placeholder="https://linkedin.com/in/…"
                  onChange={(e) => set({ linkedinUrl: e.target.value })}
                />
              </Field>
              <Field label="Bio" full hint="Shown when visitors open the speaker’s card.">
                <textarea
                  className={ui.textarea}
                  rows={5}
                  value={draft.bio ?? ''}
                  placeholder="Their CX journey, current focus and perspective…"
                  onChange={(e) => set({ bio: e.target.value })}
                />
              </Field>
              <Field label="Photo URL" full hint="Filled in automatically when you upload; paste a link to use an image hosted elsewhere.">
                <input
                  className={cx(ui.input, ui.mono)}
                  value={draft.photoUrl ?? ''}
                  placeholder="https://…"
                  onChange={(e) => set({ photoUrl: e.target.value })}
                />
              </Field>
            </div>

            <label className={ui.switchRow}>
              <span className={ui.switchText}>
                <strong>Show on the website</strong>
                <small>Turn off to keep this speaker as a draft.</small>
              </span>
              <Switch checked={draft.published ?? true} onChange={(v) => set({ published: v })} label="Show on the website" />
            </label>
          </form>
        </Drawer>
      )}

      {toast}
    </div>
  );
}
