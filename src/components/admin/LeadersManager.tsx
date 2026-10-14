'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Leader } from '@/types';
import { saveLeader, deleteLeader, reorderLeaders, uploadLeaderPhoto } from '@/app/actions/admin';

export default function LeadersManager({ siteId, initialLeaders }: { siteId: string; initialLeaders: Leader[] }) {
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders);
  const [editingLeader, setEditingLeader] = useState<Partial<Leader> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reorder up/down
  const moveLeader = async (index: number, direction: 'up' | 'down') => {
    const newLeaders = [...leaders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLeaders.length) return;

    const temp = newLeaders[index];
    newLeaders[index] = newLeaders[targetIndex];
    newLeaders[targetIndex] = temp;

    setLeaders(newLeaders);
    await reorderLeaders(siteId, newLeaders.map((l) => l.id));
  };

  // Upload photo to Firebase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadLeaderPhoto(siteId, formData);
      if (result.success) {
        setEditingLeader((prev) => (prev ? { ...prev, photoUrl: result.url } : { photoUrl: result.url }));
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
    if (!editingLeader?.name || !editingLeader?.company) {
      alert('Name and Company are required.');
      return;
    }

    setIsSaving(true);
    const leaderData: Omit<Leader, 'id'> & { id?: string } = {
      id: editingLeader.id,
      name: editingLeader.name,
      designation: editingLeader.designation || '',
      company: editingLeader.company,
      photoUrl: editingLeader.photoUrl || '/brand/leader-sample-1.jpg',
      linkedinUrl: editingLeader.linkedinUrl || '',
      bio: editingLeader.bio || '',
      order: editingLeader.order ?? leaders.length + 1,
      published: editingLeader.published ?? true,
    };

    const res = await saveLeader(siteId, leaderData);
    if (res.success) {
      if (editingLeader.id) {
        setLeaders((prev) =>
          prev.map((l) => (l.id === editingLeader.id ? ({ ...leaderData, id: l.id } as Leader) : l))
        );
      } else {
        setLeaders((prev) => [...prev, { ...leaderData, id: `leader-${Date.now()}` } as Leader]);
      }
      setEditingLeader(null);
    } else {
      alert('Failed to save leader profile.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this founding leader?')) return;
    const res = await deleteLeader(siteId, id);
    if (res.success) {
      setLeaders((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Manage the roster of India’s Founding CX Leaders. Changes update the public site immediately.
        </p>
        <button
          onClick={() =>
            setEditingLeader({
              name: '',
              designation: '',
              company: '',
              photoUrl: '/brand/leader-sample-1.jpg',
              linkedinUrl: '',
              bio: '',
              order: leaders.length + 1,
              published: true,
            })
          }
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.875rem' }}
        >
          + Add New Leader
        </button>
      </div>

      {/* Leaders Table */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '14px 18px', width: '70px' }}>Order</th>
              <th style={{ padding: '14px 18px' }}>Leader</th>
              <th style={{ padding: '14px 18px' }}>Designation & Company</th>
              <th style={{ padding: '14px 18px' }}>LinkedIn</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, idx) => (
              <tr key={leader.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 700, width: '18px' }}>{idx + 1}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        disabled={idx === 0}
                        onClick={() => moveLeader(idx, 'up')}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === leaders.length - 1}
                        onClick={() => moveLeader(idx, 'down')}
                        style={{ background: 'none', border: 'none', cursor: idx === leaders.length - 1 ? 'default' : 'pointer', opacity: idx === leaders.length - 1 ? 0.3 : 1 }}
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
                        src={leader.photoUrl || '/brand/leader-sample-1.jpg'}
                        alt={leader.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>
                        {leader.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 600 }}>{leader.designation}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{leader.company}</div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  {leader.linkedinUrl ? (
                    <a href={leader.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: '0.8125rem' }}>
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
                      background: leader.published ? '#ECFDF5' : '#F1F5F9',
                      color: leader.published ? '#047857' : '#64748B',
                    }}
                  >
                    {leader.published ? 'LIVE' : 'DRAFT'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setEditingLeader(leader)}
                      style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(leader.id)}
                      style={{ padding: '6px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Leader Modal */}
      {editingLeader && (
        <div
          onClick={() => setEditingLeader(null)}
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
              onClick={() => setEditingLeader(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '24px' }}>
              {editingLeader.id ? 'Edit Founding Leader' : 'Add Founding Leader'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Photo Upload & Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
                  Leader Headshot Photo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', border: '2px solid #CBD5E1' }}>
                    <Image
                      src={editingLeader.photoUrl || '/brand/leader-sample-1.jpg'}
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
                  value={editingLeader.photoUrl || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, photoUrl: e.target.value })}
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
                    value={editingLeader.name || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })}
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
                    value={editingLeader.company || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, company: e.target.value })}
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
                    value={editingLeader.designation || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, designation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editingLeader.linkedinUrl || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, linkedinUrl: e.target.value })}
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
                  value={editingLeader.bio || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, bio: e.target.value })}
                  placeholder="Overview of CX journey, initiatives, and leadership philosophy..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="published"
                  checked={editingLeader.published ?? true}
                  onChange={(e) => setEditingLeader({ ...editingLeader, published: e.target.checked })}
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
                  {isSaving ? 'Saving...' : 'Save Leader Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLeader(null)}
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
