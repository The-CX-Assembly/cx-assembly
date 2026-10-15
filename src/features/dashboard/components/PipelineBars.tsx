'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PipelineFilter, PipelineSlice } from '@/features/dashboard/stats';
import type { LeadStatus } from '@/types';
import Segmented from './Segmented';
import { formatNumber, useCountUp } from './useCountUp';
import styles from './dashboard.module.css';

const META: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: '#8B6CFF' },
  reviewed: { label: 'Reviewing', color: '#FFB547' },
  approved: { label: 'Approved', color: '#22C55E' },
  rejected: { label: 'Archived', color: '#F25F5C' },
};

const FILTERS: { value: PipelineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cx_leader', label: 'Leaders' },
  { value: 'partner', label: 'Partners' },
];

function LegendRow({ slice, index }: { slice: PipelineSlice; index: number }) {
  const value = useCountUp(slice.count, 1100, index * 80);
  const meta = META[slice.status];
  return (
    <li className={styles.legendRow} style={{ '--c': meta.color } as React.CSSProperties}>
      <span className={styles.legendDot} />
      <span className={styles.legendText}>
        <strong>{meta.label}</strong>
        <span>{formatNumber(value)}</span>
      </span>
    </li>
  );
}

export default function PipelineBars({ pipeline }: { pipeline: Record<PipelineFilter, PipelineSlice[]> }) {
  const [filter, setFilter] = useState<PipelineFilter>('all');
  const slices = pipeline[filter];
  const total = slices.reduce((s, x) => s + x.count, 0);

  return (
    <section className={`${styles.card} ${styles.reveal}`} style={{ '--d': 3 } as React.CSSProperties}>
      <header className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Pipeline</h2>
        <Segmented label="Applicant type" options={FILTERS} value={filter} onChange={setFilter} />
      </header>

      <div className={styles.pipeline}>
        <ul className={styles.legend}>
          {slices.map((slice, i) => (
            <LegendRow key={slice.status} slice={slice} index={i} />
          ))}
        </ul>

        <div className={styles.bars}>
          {slices.map((slice, i) => {
            const pct = total ? Math.round((slice.count / total) * 100) : 0;
            const meta = META[slice.status];
            return (
              <Link
                key={slice.status}
                href="/admin/leads"
                className={styles.barCol}
                title={`${meta.label}: ${slice.count} of ${total}`}
                style={{ '--c': meta.color, '--h': pct / 100, '--i': i } as React.CSSProperties}
              >
                <span className={styles.barTrack}>
                  <span className={styles.barFill} />
                </span>
                <span className={styles.barPct}>{pct}%</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
