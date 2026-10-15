'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Speaker } from '@/types';
import { ArrowUpRight, LinkedIn, Plus } from '@/components/site/Icons';

export default function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [open, setOpen] = useState(false);
  const photo = speaker.photoUrl || '/brand/leader-sample-1.jpg';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button type="button" className="person reveal" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <div className="person__photo">
          <Image
            src={photo}
            alt={speaker.name}
            fill
            sizes="(max-width: 760px) 50vw, (max-width: 1080px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="person__meta">
          <div>
            <p className="person__name">{speaker.name}</p>
            <p className="person__role">
              {speaker.designation}
              <br />
              {speaker.company}
            </p>
          </div>
          <span className="person__plus">
            <Plus />
          </span>
        </div>
      </button>

      {open && (
        <div className="dialog" onClick={() => setOpen(false)}>
          <div
            className="dialog__panel"
            role="dialog"
            aria-modal="true"
            aria-label={speaker.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="dialog__close" onClick={() => setOpen(false)} autoFocus>
              <span aria-hidden="true">←</span> Close
            </button>

            <div className="dialog__photo">
              <Image src={photo} alt={speaker.name} fill sizes="240px" style={{ objectFit: 'cover' }} />
            </div>

            <p className="eyebrow">Founding CX Speaker</p>
            <h2 className="h-lg" style={{ marginTop: 14 }}>
              {speaker.name}
            </h2>
            <p className="lede" style={{ marginTop: 10 }}>
              {speaker.designation}, {speaker.company}
            </p>

            <hr className="rule" style={{ margin: '32px 0' }} />

            <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {speaker.bio ||
                'Founding speaker contributing to candid peer conversations and shaping what customer experience in India needs to become next.'}
            </p>

            {speaker.linkedinUrl && (
              <a
                href={speaker.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
                style={{ marginTop: 32 }}
              >
                <LinkedIn size={16} />
                View on LinkedIn
                <ArrowUpRight />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
