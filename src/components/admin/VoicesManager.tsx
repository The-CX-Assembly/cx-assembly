'use client';

import { useState } from 'react';
import { CommunityVoice } from '@/types';
import { saveVoice, deleteVoice } from '@/app/actions/admin';

export default function VoicesManager({ initialVoices }: { initialVoices: CommunityVoice[] }) {
  const [voices, setVoices] = useState<CommunityVoice[]>(initialVoices);
  const [editingVoice, setEditingVoice] = useState<Partial<CommunityVoice> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoice?.quote || !editingVoice?.name) {
      alert('Quote and Name are required.');
      return;
    }

    setIsSaving(true);
    const voiceData: Omit<CommunityVoice, 'id'> & { id?: string } = {
      id: editingVoice.id,
      quote: editingVoice.quote,
      name: editingVoice.name,
      designation: editingVoice.designation || '',
      company: editingVoice.company || '',
      order: editingVoice.order ?? voices.length + 1,
      published: editingVoice.published ?? true,
    };

    const res = await saveVoice(voiceData);
    if (res.success) {
      if (editingVoice.id) {
        setVoices((prev) =>
          prev.map((v) => (v.id === editingVoice.id ? ({ ...voiceData, id: v.id } as CommunityVoice) : v))
        );
      } else {
        setVoices((prev) => [...prev, { ...voiceData, id: `voice-${Date.now()}` } as CommunityVoice]);
      }
      setEditingVoice(null);
    } else {
      alert('Failed to save community voice.');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this quote?')) return;
    const res = await deleteVoice(id);
    if (res.success) {
      setVoices((prev) => prev.filter((v) => v.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Manage quotes and reflections displayed across the website.
        </p>
        <button
          onClick={() =>
            setEditingVoice({
              quote: '',
              name: '',
              designation: '',
              company: '',
              order: voices.length + 1,
              published: true,
            })
          }
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.875rem' }}
        >
          + Add New Voice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {voices.map((voice) => (
          <div
            key={voice.id}
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-body)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.6 }}>
                “{voice.quote}”
              </p>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {voice.name}
              </h4>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                {voice.designation} • {voice.company}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <button
                onClick={() => setEditingVoice(voice)}
                style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(voice.id)}
                style={{ padding: '6px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingVoice && (
        <div
          onClick={() => setEditingVoice(null)}
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
              maxWidth: '560px',
              width: '100%',
              padding: '36px 32px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setEditingVoice(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '24px' }}>
              {editingVoice.id ? 'Edit Voice' : 'Add New Voice'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  Quote Text *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingVoice.quote || ''}
                  onChange={(e) => setEditingVoice({ ...editingVoice, quote: e.target.value })}
                  placeholder="Share a reflection or feedback on the community..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  Speaker Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingVoice.name || ''}
                  onChange={(e) => setEditingVoice({ ...editingVoice, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editingVoice.designation || ''}
                    onChange={(e) => setEditingVoice({ ...editingVoice, designation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={editingVoice.company || ''}
                    onChange={(e) => setEditingVoice({ ...editingVoice, company: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Voice'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVoice(null)}
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
