'use client';

import { useEffect, useState } from 'react';
import { MediaSettings, Resource, Video } from '@/types';
import {
  deleteResource,
  deleteVideo,
  reorderMedia,
  saveResource,
  saveVideo,
  updateMediaSettings,
  type ResourceDraft,
  type VideoDraft,
} from '@/features/media/actions';
import { embedUrl, formatBytes, parseVideoUrl, youtubeThumbnail } from '@/features/media/embed';
import { uploadFile } from '@/features/media/upload';
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconExternal,
  IconFile,
  IconPlus,
  IconTrash,
  IconUpload,
  IconVideo,
} from '@/components/admin/AdminIcons';
import {
  Badge,
  Drawer,
  EmptyState,
  Field,
  PageHeader,
  Stats,
  Switch,
  Tabs,
  cx,
  ui,
  useToast,
} from '@/components/admin/ui';

type Tab = 'videos' | 'pdfs' | 'placement';

const PROVIDER_LABEL: Record<Video['provider'], string> = { youtube: 'YouTube', vimeo: 'Vimeo', upload: 'Uploaded' };

function useConfirm() {
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 4000);
    return () => clearTimeout(t);
  }, [pending]);
  /** First call arms, second call (within 4s) confirms. */
  const confirm = (key: string) => {
    if (pending === key) {
      setPending(null);
      return true;
    }
    setPending(key);
    return false;
  };
  return { pending, confirm };
}

function UploadProgress({ fraction, label }: { fraction: number; label: string }) {
  return (
    <div className={ui.section} aria-live="polite">
      <div className={ui.progress} role="progressbar" aria-valuenow={Math.round(fraction * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={ui.progressBar} style={{ '--p': `${Math.round(fraction * 100)}%` } as React.CSSProperties} />
      </div>
      <span className={ui.fieldHint}>
        {label}… {Math.round(fraction * 100)}%
      </span>
    </div>
  );
}

function OrderButtons({ index, total, onMove, name }: { index: number; total: number; onMove: (dir: -1 | 1) => void; name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <span className={ui.count} style={{ minWidth: 22, fontWeight: 700 }}>
        {index + 1}
      </span>
      <button type="button" className={ui.btnIcon} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${name} up`}>
        <IconArrowUp size={16} />
      </button>
      <button type="button" className={ui.btnIcon} disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Move ${name} down`}>
        <IconArrowDown size={16} />
      </button>
    </div>
  );
}

export default function MediaManager({
  siteId,
  siteUrl,
  initialVideos,
  initialResources,
  initialSettings,
  canWrite,
}: {
  siteId: string;
  siteUrl?: string;
  initialVideos: Video[];
  initialResources: Resource[];
  initialSettings: MediaSettings;
  canWrite: boolean;
}) {
  const [tab, setTab] = useState<Tab>('videos');
  const [videos, setVideos] = useState(initialVideos);
  const [resources, setResources] = useState(initialResources);
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [videoDraft, setVideoDraft] = useState<VideoDraft | null>(null);
  const [pdfDraft, setPdfDraft] = useState<ResourceDraft | null>(null);
  const [progress, setProgress] = useState<{ fraction: number; label: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, showToast] = useToast();
  const { pending, confirm } = useConfirm();

  const liveVideos = videos.filter((v) => v.published);
  const homeVideos = liveVideos.filter((v) => v.showOnHome);
  const livePdfs = resources.filter((r) => r.published);
  const downloads = resources.reduce((n, r) => n + (r.downloads ?? 0), 0);
  const settingsDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const publicUrl = (path: string) => (siteUrl ? `${siteUrl.replace(/\/$/, '')}${path}` : path);

  // ---- shared list helpers ----
  const move = async <T extends { id: string }>(
    kind: 'videos' | 'resources',
    list: T[],
    set: (l: T[]) => void,
    index: number,
    dir: -1 | 1,
  ) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    set(next);
    const res = await reorderMedia(siteId, kind, next.map((x) => x.id));
    if (!res.success) {
      set(list);
      showToast(res.error, 'error');
    }
  };

  const upload = async (kind: 'video' | 'pdf' | 'image', file: File, label: string) => {
    setProgress({ fraction: 0, label });
    try {
      return await uploadFile(siteId, kind, file, (fraction) => setProgress({ fraction, label }));
    } catch (e) {
      showToast((e as Error).message, 'error');
      return null;
    } finally {
      setProgress(null);
    }
  };

  // ---- videos ----
  const toggleVideo = async (video: Video, patch: Partial<Video>) => {
    const updated = { ...video, ...patch };
    setBusy(video.id);
    setVideos((list) => list.map((v) => (v.id === video.id ? updated : v)));
    const res = await saveVideo(siteId, { ...updated, link: video.originalUrl });
    setBusy(null);
    if (!res.success) {
      setVideos((list) => list.map((v) => (v.id === video.id ? video : v)));
      showToast(res.error, 'error');
    }
  };

  const submitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoDraft) return;
    setBusy('video-form');
    const res = await saveVideo(siteId, videoDraft);
    setBusy(null);
    if (!res.success) return showToast(res.error, 'error');
    setVideos((list) => (videoDraft.id ? list.map((v) => (v.id === res.video.id ? res.video : v)) : [...list, res.video]));
    setVideoDraft(null);
    showToast(res.video.published ? `Saved “${res.video.title}”.` : `Saved “${res.video.title}” as a draft. Switch it on when it’s ready to go live.`);
  };

  const removeVideo = async (video: Video) => {
    if (!confirm(`video-${video.id}`)) return;
    setBusy(video.id);
    const res = await deleteVideo(siteId, video.id);
    setBusy(null);
    if (!res.success) return showToast(res.error, 'error');
    setVideos((list) => list.filter((v) => v.id !== video.id));
    showToast(`Deleted “${video.title}”.`);
  };

  // ---- PDFs ----
  const togglePdf = async (resource: Resource) => {
    const updated = { ...resource, published: !resource.published };
    setBusy(resource.id);
    setResources((list) => list.map((r) => (r.id === resource.id ? updated : r)));
    const res = await saveResource(siteId, updated);
    setBusy(null);
    if (!res.success) {
      setResources((list) => list.map((r) => (r.id === resource.id ? resource : r)));
      showToast(res.error, 'error');
    }
  };

  const submitPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfDraft) return;
    setBusy('pdf-form');
    const res = await saveResource(siteId, pdfDraft);
    setBusy(null);
    if (!res.success) return showToast(res.error, 'error');
    setResources((list) => (pdfDraft.id ? list.map((r) => (r.id === res.resource.id ? res.resource : r)) : [...list, res.resource]));
    setPdfDraft(null);
    showToast(`Saved “${res.resource.title}”.`);
  };

  const removePdf = async (resource: Resource) => {
    if (!confirm(`pdf-${resource.id}`)) return;
    setBusy(resource.id);
    const res = await deleteResource(siteId, resource.id);
    setBusy(null);
    if (!res.success) return showToast(res.error, 'error');
    setResources((list) => list.filter((r) => r.id !== resource.id));
    showToast(`Deleted “${resource.title}”.`);
  };

  // ---- placement ----
  const saveSettings = async () => {
    setBusy('settings');
    const res = await updateMediaSettings(siteId, settings);
    setBusy(null);
    if (!res.success) return showToast(res.error, 'error');
    setSavedSettings(settings);
    showToast('Saved. The website updates within a minute.');
  };

  const linkPreview = videoDraft?.provider !== 'upload' ? parseVideoUrl(videoDraft?.link ?? '') : null;
  const draftThumb =
    videoDraft?.thumbnailUrl || (linkPreview?.provider === 'youtube' ? youtubeThumbnail(linkPreview.id) : undefined);

  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Website"
        icon={<IconVideo size={14} />}
        title="Videos & PDFs"
        description="Add videos and downloadable PDFs. Nothing appears on the website until you switch it on."
        actions={
          canWrite &&
          (tab === 'pdfs' ? (
            <button type="button" className={ui.btnPrimary} onClick={() => setPdfDraft({ published: false })}>
              <IconPlus size={16} /> Add PDF
            </button>
          ) : (
            <button type="button" className={ui.btnPrimary} onClick={() => setVideoDraft({ provider: 'youtube', published: false, showOnHome: true })}>
              <IconPlus size={16} /> Add video
            </button>
          ))
        }
      />

      {!canWrite && (
        <div className={ui.notice}>Storage and the database aren’t connected in this environment, so media can’t be added here.</div>
      )}

      <Stats
        items={[
          { label: 'Videos live', value: `${liveVideos.length}/${videos.length}`, color: 'var(--a-primary)', onClick: () => setTab('videos') },
          { label: 'On the home page', value: settings.videosOnHome ? homeVideos.length : 'Off', color: 'var(--a-violet)', onClick: () => setTab('placement') },
          { label: 'PDFs live', value: `${livePdfs.length}/${resources.length}`, color: 'var(--a-coral)', onClick: () => setTab('pdfs') },
          { label: 'PDF downloads', value: downloads, color: 'var(--a-green)' },
        ]}
      />

      <section className={ui.panel} aria-label="Videos and PDFs">
        <Tabs
          label="Media"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'videos', label: 'Videos', count: videos.length },
            { value: 'pdfs', label: 'PDFs', count: resources.length },
            { value: 'placement', label: 'Where they appear' },
          ]}
        />

        {tab === 'videos' &&
          (videos.length === 0 ? (
            <EmptyState icon={<IconVideo size={22} />} title="No videos yet">
              Add a YouTube or Vimeo link, or upload a video file. It stays a draft until you switch it on.
            </EmptyState>
          ) : (
            <div className={ui.tableWrap}>
              <table className={cx(ui.table, ui.tableCards)}>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Home page</th>
                    <th>Order</th>
                    <th>Live</th>
                    <th className={ui.alignRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v, i) => (
                    <tr key={v.id} style={{ '--i': i } as React.CSSProperties}>
                      <td>
                        <div className={ui.person}>
                          <span className={ui.thumb}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" /> : <IconVideo size={20} />}
                          </span>
                          <div>
                            <span className={ui.cellMain}>{v.title}</span>
                            <span className={ui.cellSub}>
                              <Badge tone={v.provider === 'upload' ? 'violet' : 'gray'}>{PROVIDER_LABEL[v.provider]}</Badge>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Switch
                          checked={v.showOnHome}
                          disabled={busy === v.id}
                          onChange={(on) => toggleVideo(v, { showOnHome: on })}
                          label={v.showOnHome ? `Remove “${v.title}” from the home page` : `Show “${v.title}” on the home page`}
                        />
                      </td>
                      <td>
                        <OrderButtons index={i} total={videos.length} name={v.title} onMove={(d) => move('videos', videos, setVideos, i, d)} />
                      </td>
                      <td>
                        <div className={ui.statusLine}>
                          <Switch
                            checked={v.published}
                            disabled={busy === v.id}
                            onChange={(on) => toggleVideo(v, { published: on })}
                            label={v.published ? `Take “${v.title}” off the website` : `Make “${v.title}” live`}
                          />
                          <Badge tone={v.published ? 'green' : 'gray'} dot>
                            {v.published ? 'Live' : 'Draft'}
                          </Badge>
                        </div>
                      </td>
                      <td className={cx(ui.alignRight, ui.cardFull)}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className={cx(ui.btnGhost, ui.btnSm)}
                            onClick={() => setVideoDraft({ ...v, link: v.originalUrl })}
                          >
                            <IconEdit size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className={cx(pending === `video-${v.id}` ? ui.btnDanger : ui.btnGhostDanger, ui.btnSm)}
                            disabled={busy === v.id}
                            onClick={() => removeVideo(v)}
                          >
                            <IconTrash size={14} /> {pending === `video-${v.id}` ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === 'pdfs' &&
          (resources.length === 0 ? (
            <EmptyState icon={<IconFile size={22} />} title="No PDFs yet">
              Upload a report, playbook or brochure. Visitors fill in their name, email and company to download it, and each
              download appears in Leads.
            </EmptyState>
          ) : (
            <div className={ui.tableWrap}>
              <table className={cx(ui.table, ui.tableCards)}>
                <thead>
                  <tr>
                    <th>PDF</th>
                    <th>Downloads</th>
                    <th>Order</th>
                    <th>Live</th>
                    <th className={ui.alignRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r, i) => (
                    <tr key={r.id} style={{ '--i': i } as React.CSSProperties}>
                      <td>
                        <div className={ui.person}>
                          <span className={cx(ui.thumb, ui.thumbDoc)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {r.coverUrl ? <img src={r.coverUrl} alt="" /> : 'PDF'}
                          </span>
                          <div>
                            <span className={ui.cellMain}>{r.title}</span>
                            <span className={ui.cellSub}>
                              {r.fileName} · {formatBytes(r.fileSize)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={ui.cellMain}>{r.downloads ?? 0}</span>
                      </td>
                      <td>
                        <OrderButtons index={i} total={resources.length} name={r.title} onMove={(d) => move('resources', resources, setResources, i, d)} />
                      </td>
                      <td>
                        <div className={ui.statusLine}>
                          <Switch
                            checked={r.published}
                            disabled={busy === r.id}
                            onChange={() => togglePdf(r)}
                            label={r.published ? `Take “${r.title}” off the website` : `Make “${r.title}” live`}
                          />
                          <Badge tone={r.published ? 'green' : 'gray'} dot>
                            {r.published ? 'Live' : 'Draft'}
                          </Badge>
                        </div>
                      </td>
                      <td className={cx(ui.alignRight, ui.cardFull)}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button type="button" className={cx(ui.btnGhost, ui.btnSm)} onClick={() => setPdfDraft({ ...r })}>
                            <IconEdit size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className={cx(pending === `pdf-${r.id}` ? ui.btnDanger : ui.btnGhostDanger, ui.btnSm)}
                            disabled={busy === r.id}
                            onClick={() => removePdf(r)}
                          >
                            <IconTrash size={14} /> {pending === `pdf-${r.id}` ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === 'placement' && (
          <div className={ui.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className={ui.section}>
              <span className={ui.sectionLabel}>Videos</span>
              <label className={ui.switchRow}>
                <span className={ui.switchText}>
                  <strong>Video section on the home page</strong>
                  <small>
                    Shows live videos marked “Home page” ({homeVideos.length} right now), after the Founding 50 section.
                  </small>
                </span>
                <Switch checked={settings.videosOnHome} onChange={(on) => setSettings((s) => ({ ...s, videosOnHome: on }))} label="Video section on the home page" />
              </label>
              <label className={ui.switchRow}>
                <span className={ui.switchText}>
                  <strong>Videos page</strong>
                  <small>
                    A page listing every live video ({liveVideos.length} right now) at{' '}
                    {savedSettings.videosPage ? (
                      <a className={ui.link} href={publicUrl('/videos')} target="_blank" rel="noopener noreferrer">
                        /videos <IconExternal size={11} />
                      </a>
                    ) : (
                      '/videos'
                    )}
                    .
                  </small>
                </span>
                <Switch checked={settings.videosPage} onChange={(on) => setSettings((s) => ({ ...s, videosPage: on }))} label="Videos page" />
              </label>
              <div className={ui.formGrid}>
                <Field label="Section title">
                  <input className={ui.input} value={settings.videosTitle} onChange={(e) => setSettings((s) => ({ ...s, videosTitle: e.target.value }))} />
                </Field>
                <Field label="Introduction">
                  <input className={ui.input} value={settings.videosIntro} onChange={(e) => setSettings((s) => ({ ...s, videosIntro: e.target.value }))} />
                </Field>
              </div>
            </div>

            <div className={ui.section}>
              <span className={ui.sectionLabel}>PDFs</span>
              <label className={ui.switchRow}>
                <span className={ui.switchText}>
                  <strong>Resources page</strong>
                  <small>
                    Lists every live PDF ({livePdfs.length} right now) at{' '}
                    {savedSettings.resourcesPage ? (
                      <a className={ui.link} href={publicUrl('/resources')} target="_blank" rel="noopener noreferrer">
                        /resources <IconExternal size={11} />
                      </a>
                    ) : (
                      '/resources'
                    )}
                    . Visitors give their name, email and company before each download.
                  </small>
                </span>
                <Switch checked={settings.resourcesPage} onChange={(on) => setSettings((s) => ({ ...s, resourcesPage: on }))} label="Resources page" />
              </label>
              <div className={ui.formGrid}>
                <Field label="Page title">
                  <input className={ui.input} value={settings.resourcesTitle} onChange={(e) => setSettings((s) => ({ ...s, resourcesTitle: e.target.value }))} />
                </Field>
                <Field label="Introduction">
                  <input className={ui.input} value={settings.resourcesIntro} onChange={(e) => setSettings((s) => ({ ...s, resourcesIntro: e.target.value }))} />
                </Field>
              </div>
            </div>
          </div>
        )}
      </section>

      {tab === 'placement' && (settingsDirty || busy === 'settings') && (
        <div className={ui.saveBar} role="region" aria-label="Unsaved changes">
          <span className={ui.unsaved}>
            <span className={ui.dirtyDot} /> Unsaved changes
          </span>
          <button type="button" className={ui.btnGhost} onClick={() => setSettings(savedSettings)} disabled={busy === 'settings'}>
            Discard
          </button>
          <button type="button" className={ui.btnPrimary} onClick={saveSettings} disabled={busy === 'settings'}>
            {busy === 'settings' ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {videoDraft && (
        <Drawer
          title={videoDraft.id ? 'Edit video' : 'Add video'}
          subtitle="Saved as a draft unless you switch on “Live”."
          onClose={() => !progress && setVideoDraft(null)}
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => setVideoDraft(null)} disabled={Boolean(progress)}>
                Cancel
              </button>
              <button type="submit" form="video-form" className={ui.btnPrimary} disabled={busy === 'video-form' || Boolean(progress)}>
                {busy === 'video-form' ? 'Saving…' : 'Save video'}
              </button>
            </>
          }
        >
          <form id="video-form" className={ui.form} onSubmit={submitVideo}>
            <div className={ui.segmented} role="radiogroup" aria-label="Video source" style={{ '--n': 2 } as React.CSSProperties}>
              {(['link', 'upload'] as const).map((mode) => {
                const on = mode === 'upload' ? videoDraft.provider === 'upload' : videoDraft.provider !== 'upload';
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={cx(ui.segment, on && ui.segmentOn)}
                    onClick={() => setVideoDraft((d) => ({ ...d, provider: mode === 'upload' ? 'upload' : 'youtube' }))}
                  >
                    {mode === 'link' ? 'YouTube / Vimeo link' : 'Upload a file'}
                  </button>
                );
              })}
            </div>

            {videoDraft.provider !== 'upload' ? (
              <>
                <Field label="Video link" required hint="Paste the address of a YouTube or Vimeo video (unlisted works too).">
                  <input
                    className={ui.input}
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={videoDraft.link ?? ''}
                    onChange={(e) => setVideoDraft((d) => ({ ...d, link: e.target.value }))}
                  />
                </Field>
                {linkPreview ? (
                  <div className={ui.preview}>
                    <iframe
                      src={embedUrl({ provider: linkPreview.provider, source: linkPreview.id })!.replace('autoplay=1', 'autoplay=0')}
                      title="Video preview"
                      allow="encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  videoDraft.link && <span className={ui.fieldHint} style={{ color: '#B45309' }}>That doesn’t look like a YouTube or Vimeo video link.</span>
                )}
              </>
            ) : (
              <div className={ui.section}>
                {videoDraft.source ? (
                  <div className={ui.preview}>
                    <video src={videoDraft.source} poster={videoDraft.thumbnailUrl} controls preload="metadata" />
                  </div>
                ) : null}
                {progress ? (
                  <UploadProgress fraction={progress.fraction} label={progress.label} />
                ) : (
                  <label className={ui.dropzone}>
                    <IconUpload size={22} />
                    <strong>{videoDraft.source ? 'Replace the video file' : 'Choose a video file'}</strong>
                    <span className={ui.fieldHint}>MP4, WebM or MOV, up to 500 MB. MP4 plays everywhere.</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        const res = await upload('video', file, 'Uploading video');
                        if (res?.url) setVideoDraft((d) => ({ ...d, provider: 'upload', source: res.url, storagePath: res.path }));
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            <Field label="Title" required>
              <input
                className={ui.input}
                required
                value={videoDraft.title ?? ''}
                onChange={(e) => setVideoDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </Field>
            <Field label="Description">
              <textarea
                className={ui.textarea}
                rows={3}
                value={videoDraft.description ?? ''}
                onChange={(e) => setVideoDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </Field>

            <div className={ui.section}>
              <span className={ui.sectionLabel}>Thumbnail</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={ui.thumb} style={{ width: 140 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {draftThumb ? <img src={draftThumb} alt="" /> : <IconVideo size={20} />}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className={cx(ui.btnGhost, ui.btnSm)} style={{ cursor: 'pointer' }}>
                    <IconUpload size={14} /> {videoDraft.thumbnailUrl ? 'Replace image' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        const res = await upload('image', file, 'Uploading thumbnail');
                        if (res?.url) setVideoDraft((d) => ({ ...d, thumbnailUrl: res.url }));
                      }}
                    />
                  </label>
                  <span className={ui.fieldHint}>
                    {videoDraft.provider === 'upload' ? 'Recommended for uploaded videos.' : 'Optional: YouTube and Vimeo thumbnails are used automatically.'}
                  </span>
                </div>
              </div>
            </div>

            <label className={ui.switchRow}>
              <span className={ui.switchText}>
                <strong>Show on the home page</strong>
                <small>Appears in the home page video section (when that section is switched on).</small>
              </span>
              <Switch checked={Boolean(videoDraft.showOnHome)} onChange={(on) => setVideoDraft((d) => ({ ...d, showOnHome: on }))} label="Show on the home page" />
            </label>
            <label className={ui.switchRow}>
              <span className={ui.switchText}>
                <strong>Live on the website</strong>
                <small>Off keeps it as a draft that only admins can see.</small>
              </span>
              <Switch checked={Boolean(videoDraft.published)} onChange={(on) => setVideoDraft((d) => ({ ...d, published: on }))} label="Live on the website" />
            </label>
          </form>
        </Drawer>
      )}

      {pdfDraft && (
        <Drawer
          title={pdfDraft.id ? 'Edit PDF' : 'Add PDF'}
          subtitle="Visitors give their name, email and company to download it."
          onClose={() => !progress && setPdfDraft(null)}
          footer={
            <>
              <button type="button" className={ui.btnGhost} onClick={() => setPdfDraft(null)} disabled={Boolean(progress)}>
                Cancel
              </button>
              <button type="submit" form="pdf-form" className={ui.btnPrimary} disabled={busy === 'pdf-form' || Boolean(progress)}>
                {busy === 'pdf-form' ? 'Saving…' : 'Save PDF'}
              </button>
            </>
          }
        >
          <form id="pdf-form" className={ui.form} onSubmit={submitPdf}>
            {progress ? (
              <UploadProgress fraction={progress.fraction} label={progress.label} />
            ) : (
              <label className={ui.dropzone}>
                <IconFile size={22} />
                <strong>{pdfDraft.storagePath ? pdfDraft.fileName : 'Choose a PDF'}</strong>
                <span className={ui.fieldHint}>
                  {pdfDraft.storagePath ? `${formatBytes(pdfDraft.fileSize ?? 0)} · click to replace` : 'Up to 50 MB. Kept private: only shared after the form.'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    const res = await upload('pdf', file, 'Uploading PDF');
                    if (res)
                      setPdfDraft((d) => ({
                        ...d,
                        storagePath: res.path,
                        fileName: file.name,
                        fileSize: res.size,
                        title: d?.title || file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' '),
                      }));
                  }}
                />
              </label>
            )}

            <Field label="Title" required>
              <input className={ui.input} required value={pdfDraft.title ?? ''} onChange={(e) => setPdfDraft((d) => ({ ...d, title: e.target.value }))} />
            </Field>
            <Field label="Description" hint="What’s inside, in a sentence or two. Shown on the download card.">
              <textarea
                className={ui.textarea}
                rows={3}
                value={pdfDraft.description ?? ''}
                onChange={(e) => setPdfDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </Field>

            <div className={ui.section}>
              <span className={ui.sectionLabel}>Cover image (optional)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={cx(ui.thumb, ui.thumbDoc)} style={{ width: 66 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {pdfDraft.coverUrl ? <img src={pdfDraft.coverUrl} alt="" /> : 'PDF'}
                </span>
                <label className={cx(ui.btnGhost, ui.btnSm)} style={{ cursor: 'pointer' }}>
                  <IconUpload size={14} /> {pdfDraft.coverUrl ? 'Replace cover' : 'Upload cover'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const res = await upload('image', file, 'Uploading cover');
                      if (res?.url) setPdfDraft((d) => ({ ...d, coverUrl: res.url }));
                    }}
                  />
                </label>
              </div>
            </div>

            <label className={ui.switchRow}>
              <span className={ui.switchText}>
                <strong>Live on the website</strong>
                <small>Off keeps it as a draft. The Resources page must also be switched on.</small>
              </span>
              <Switch checked={Boolean(pdfDraft.published)} onChange={(on) => setPdfDraft((d) => ({ ...d, published: on }))} label="Live on the website" />
            </label>
          </form>
        </Drawer>
      )}

      {toast}
    </div>
  );
}
