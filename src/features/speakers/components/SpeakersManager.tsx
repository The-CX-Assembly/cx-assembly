'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Speaker } from '@/types';
import { saveSpeaker, deleteSpeaker, reorderSpeakers, uploadSpeakerPhoto } from '@/features/speakers/actions';
import Pagination from '@/components/admin/Pagination';

const PAGE_SIZE = 10;

export default function SpeakersManager({ siteId, initialSpeakers }: { siteId: string; initialSpeakers: Speaker[] }) {
  const [speakers, setSpeakers] = useState<Speaker[]>(initialSpeakers);
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<Speaker> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(speakers.length / PAGE_SIZE));
  // Stay on a real page after deletions shrink the list.
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const pageSpeakers = speakers.slice(offset, offset + PAGE_SIZE);

  // Reorder up/down
  const moveSpeaker = async (index: number, direction: 'up' | 'down') => {
    const newSpeakers = [...speakers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSpeakers.length) return;

    const temp = newSpeakers[index];
    newSpeakers[index] = newSpeakers[targetIndex];
    newSpeakers[targetIndex] = temp;

    setSpeakers(newSpeakers);
    await reorderSpeakers(siteId, newSpeakers.map((l) => l.id));
  };

  // Upload photo to Firebase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadSpeakerPhoto(siteId, formData);
      if (result.success) {
        setEditingSpeaker((prev) => (prev ? { ...prev, photoUrl: result.url } : { photoUrl: result.url }));
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.warn('Photo upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker?.name || !editingSpeaker?.company) {
      alert('Name and Company are required.');
      return;
    }

    setIsSaving(true);
    const speakerData: Omit<Speaker, 'id'> & { id?: string } = {
      id: editingSpeaker.id,
      name: editingSpeaker.name,
      designation: editingSpeaker.designation || '',
      company: editingSpeaker.company,
      photoUrl: editingSpeaker.photoUrl || '/brand/leader-sample-1.jpg',
      linkedinUrl: editingSpeaker.linkedinUrl || '',
      bio: editingSpeaker.bio || '',
      order: editingSpeaker.order ?? speakers.length + 1,
      published: editingSpeaker.published ?? true,
    };

    const res = await saveSpeaker(siteId, speakerData);
    if (res.success) {
      if (editingSpeaker.id) {
        setSpeakers((prev) =>
          prev.map((l) => (l.id === editingSpeaker.id ? ({ ...speakerData, id: l.id } as Speaker) : l))
        );
      } else {
        // Use the stored id so editing this speaker again updates the same record.
        setSpeakers((prev) => [...prev, { ...speakerData, id: res.id ?? `temp-${Date.now()}` } as Speaker]);
        setPage(Math.ceil((speakers.length + 1) / PAGE_SIZE));
      }
      setEditingSpeaker(null);
    } else {
      alert(res.error ?? 'Failed to save the speaker profile.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this CMO Speaker?')) return;
    const res = await deleteSpeaker(siteId, id);
    if (res.success) {
      setSpeakers((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Manage the CMO Speakers shown on the website. Changes update the public site immediately.
        </p>
        <button
          onClick={() =>
            setEditingSpeaker({
              name: '',
              designation: '',
              company: '',
              photoUrl: '/brand/leader-sample-1.jpg',
              linkedinUrl: '',
              bio: '',
              order: speakers.length + 1,
              published: true,
            })
          }
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.875rem' }}
        >
          + Add CMO Speaker
        </button>
      </div>

      {/* Speakers Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '14px 18px', width: '70px' }}>Order</th>
              <th style={{ padding: '14px 18px' }}>Speaker</th>
              <th style={{ padding: '14px 18px' }}>Designation & Company</th>
              <th style={{ padding: '14px 18px' }}>LinkedIn</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageSpeakers.map((speaker, i) => {
              // Position in the full list: ordering spans pages.
              const idx = offset + i;
              return (
              <tr key={speaker.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 700, width: '18px' }}>{idx + 1}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        disabled={idx === 0}
                        onClick={() => moveSpeaker(idx, 'up')}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === speakers.length - 1}
                        onClick={() => moveSpeaker(idx, 'down')}
                        style={{ background: 'none', border: 'none', cursor: idx === speakers.length - 1 ? 'default' : 'pointer', opacity: idx === speakers.length - 1 ? 0.3 : 1 }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      <Image
                        src={speaker.photoUrl || '/brand/leader-sample-1.jpg'}
                        alt={speaker.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>
                        {speaker.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 600 }}>{speaker.designation}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{speaker.company}</div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  {speaker.linkedinUrl ? (
                    <a href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: '0.8125rem' }}>
                      View Profile
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: speaker.published ? '#ECFDF5' : '#F1F5F9',
                      color: speaker.published ? '#047857' : '#64748B',
                    }}
                  >
                    {speaker.published ? 'LIVE' : 'DRAFT'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setEditingSpeaker(speaker)}
                      style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(speaker.id)}
                      style={{ padding: '6px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={speakers.length} onChange={setPage} noun="speakers" />
      </div>

      {/* Add / Edit Speaker Modal */}
      {editingSpeaker && (
        <div
          onClick={() => setEditingSpeaker(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 35, 57, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '600px',
              width: '100%',
              padding: '36px 32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setEditingSpeaker(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '24px' }}>
              {editingSpeaker.id ? 'Edit CMO Speaker' : 'Add CMO Speaker'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Photo Upload & Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Speaker Headshot Photo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', border: '2px solid #CBD5E1' }}>
                    <Image
                      src={editingSpeaker.photoUrl || '/brand/leader-sample-1.jpg'}
                      alt="Preview"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ fontSize: '0.8125rem' }}
                    />
                    {isUploading && <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', display: 'block' }}>Uploading image to Storage...</span>}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  Or Direct Image URL
                </label>
                <input
                  type="text"
                  value={editingSpeaker.photoUrl || ''}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, photoUrl: e.target.value })}
                  placeholder="/brand/leader-sample-1.jpg or https://..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSpeaker.name || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSpeaker.company || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, company: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.designation || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, designation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editingSpeaker.linkedinUrl || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  Executive Bio & Perspective
                </label>
                <textarea
                  rows={4}
                  value={editingSpeaker.bio || ''}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })}
                  placeholder="Overview of CX journey, initiatives, and leadership philosophy..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="published"
                  checked={editingSpeaker.published ?? true}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, published: e.target.checked })}
                />
                <label htmlFor="published" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Publish on live website
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Speaker Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSpeaker(null)}
                  style={{ padding: '12px 20px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
