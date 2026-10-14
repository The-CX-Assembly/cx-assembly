'use client';

import { useState } from 'react';
import type { MixRange, MixSlice } from '@/lib/admin-stats';
import type { InterestType } from '@/types';
import Segmented from './Segmented';
import { formatNumber, useCountUp } from './useCountUp';
import styles from './dashboard.module.css';

const META: Record<InterestType, { label: string; color: string }> = {
  cx_leader: { label: 'CX Leaders', color: '#2F6BFF' },
  partner: { label: 'Partners', color: '#FFB547' },
  other: { label: 'General', color: '#F25F5C' },
};

const RANGES: { value: MixRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'month', label: '30 days' },
  { value: 'week', label: '7 days' },
];

const R = 62;
const CIRC = 2 * Math.PI * R;
const GAP = 6; // px of empty arc between segments

function Metric({ label, color, value, share, index }: { label: string; color: string; value: number; share: number; index: number }) {
  const shown = useCountUp(value, 1100, index * 80);
  return (
    <div className={styles.metric} style={{ '--c': color } as React.CSSProperties}>
      <span className={styles.legendDot} />
      <div>
        <span className={styles.metricLabel}>{label}</span>
        <strong className={styles.metricValue}>
          {formatNumber(shown)}
          <small>{share}%</small>
        </strong>
      </div>
    </div>
  );
}

export default function MixGauge({ mix }: { mix: Record<MixRange, MixSlice[]> }) {
  const [range, setRange] = useState<MixRange>('all');
  const slices = mix[range];
  const total = slices.reduce((s, x) => s + x.count, 0);
  const shownTotal = useCountUp(total, 1200, 200);
  const nonEmpty = slices.filter((s) => s.count > 0).length;

  const fullLengths = slices.map((slice) => (total ? (slice.count / total) * CIRC : 0));
  const arcs = slices.map((slice, i) => {
    const full = fullLengths[i];
    const gap = nonEmpty > 1 && full > 0 ? GAP : 0;
    const start = fullLengths.slice(0, i).reduce((sum, n) => sum + n, 0);
    return { slice, length: Math.max(0, full - gap), offset: -start };
  });

  return (
    <section className={`${styles.card} ${styles.reveal}`} style={{ '--d': 5 } as React.CSSProperties}>
      <header className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Audience Mix</h2>
        <Segmented label="Audience range" options={RANGES} value={range} onChange={setRange} />
      </header>

      <div className={styles.mix}>
        <div className={styles.metrics}>
          {slices.map((slice, i) => (
            <Metric
              key={slice.type}
              label={META[slice.type].label}
              color={META[slice.type].color}
              value={slice.count}
              share={total ? Math.round((slice.count / total) * 100) : 0}
              index={i}
            />
          ))}
          <Metric label="Total" color="#8B6CFF" value={total} share={100} index={3} />
        </div>

        <div className={styles.donutWrap}>
          <svg viewBox="0 0 160 160" className={styles.donut} role="img" aria-label={`${total} applicants by type`}>
            <circle cx="80" cy="80" r={R} className={styles.donutTrack} />
            {arcs.map(({ slice, length, offset }) => (
              <circle
                key={slice.type}
                cx="80"
                cy="80"
                r={R}
                className={styles.donutArc}
                stroke={META[slice.type].color}
                strokeDasharray={`${length} ${CIRC}`}
                strokeDashoffset={offset}
                style={{ opacity: length > 0 ? 1 : 0 }}
              />
            ))}
          </svg>
          <div className={styles.donutCenter}>
            <strong>{formatNumber(shownTotal)}</strong>
            <span>applicants</span>
          </div>
        </div>
      </div>
    </section>
  );
}
