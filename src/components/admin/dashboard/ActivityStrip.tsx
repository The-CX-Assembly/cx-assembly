'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ActivityItem } from '@/lib/admin-stats';
import { IconChevronLeft, IconChevronRight, IconFile, IconHandshake, IconInbox, IconStar } from '../AdminIcons';
import styles from './dashboard.module.css';

const KIND = {
  cx_leader: { icon: IconFile, color: '#2F6BFF', label: 'Application' },
  partner: { icon: IconHandshake, color: '#FF8A3D', label: 'Partner request' },
  other: { icon: IconInbox, color: '#F25F5C', label: 'General inquiry' },
  leader: { icon: IconStar, color: '#22C55E', label: 'Leader profile' },
} as const;

export default function ActivityStrip({ items }: { items: ActivityItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (items.length === 0) {
    return (
      <section className={`${styles.card} ${styles.activityEmpty} ${styles.reveal}`}>
        <IconInbox size={22} />
        <p>Recent applications and roster updates will show up here.</p>
      </section>
    );
  }

  return (
    <section className={`${styles.card} ${styles.activity} ${styles.reveal}`} style={{ '--d': 1 } as React.CSSProperties}>
      <div
        className={`${styles.activityTrack} ${edges.start ? '' : styles.fadeStart} ${edges.end ? '' : styles.fadeEnd}`}
        ref={trackRef}
      >
        {items.map((item, i) => {
          const kind = KIND[item.kind];
          const Icon = kind.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={styles.activityCard}
              style={{ '--c': kind.color, '--i': i } as React.CSSProperties}
            >
              <div className={styles.activityTop}>
                <span className={styles.activityIcon}>
                  <Icon size={18} />
                </span>
                <div className={styles.activityTitle}>
                  <small>{kind.label}</small>
                  <strong>{item.title}</strong>
                </div>
              </div>
              <p className={styles.activityDesc}>{item.description}</p>
              <div className={styles.chips}>
                {item.chips.map((chip) => (
                  <span key={chip} className={styles.chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {!edges.start && (
        <button type="button" className={`${styles.scrollBtn} ${styles.scrollPrev}`} onClick={() => scrollBy(-1)} aria-label="Scroll back">
          <IconChevronLeft size={18} />
        </button>
      )}
      {!edges.end && (
        <button type="button" className={`${styles.scrollBtn} ${styles.scrollNext}`} onClick={() => scrollBy(1)} aria-label="Scroll forward">
          <IconChevronRight size={18} />
        </button>
      )}
    </section>
  );
}
