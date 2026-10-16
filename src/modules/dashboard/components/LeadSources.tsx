'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MixRange, SourceBreakdown, SourceDimension } from '../services/dashboard.service';
import Segmented from './Segmented';
import { formatNumber, useCountUp } from './useCountUp';
import styles from './dashboard.module.css';

const DIMENSIONS: { value: SourceDimension; label: string; noun: string }[] = [
  { value: 'campaign', label: 'Campaign', noun: 'campaign' },
  { value: 'channel', label: 'Channel', noun: 'channel' },
  { value: 'button', label: 'Button', noun: 'button' },
  { value: 'landing', label: 'Landing page', noun: 'landing page' },
];

const RANGES: { value: MixRange; label: string }[] = [
  { value: 'month', label: '30 days' },
  { value: 'week', label: '7 days' },
  { value: 'all', label: 'All time' },
];

const COLORS = ['#2F6BFF', '#8B6CFF', '#22C55E', '#FFB547', '#FF8A3D', '#A5AABB'];
// Rows that aren't a real source get a neutral color.
const NEUTRAL = new Set(['Not tracked', 'No campaign tag', 'Direct / unknown']);

function Row({ label, leads, approved, share, color, index }: { label: string; leads: number; approved: number; share: number; color: string; index: number }) {
  const shown = useCountUp(leads, 900, index * 70);
  const rate = leads ? Math.round((approved / leads) * 100) : 0;
  return (
    <li className={styles.sourceRow} style={{ '--c': color, '--w': `${share}%`, '--i': index } as React.CSSProperties}>
      <div className={styles.sourceTop}>
        <span className={styles.sourceLabel} title={label}>
          {label}
        </span>
        <span className={styles.sourceNums}>
          <strong>{formatNumber(shown)}</strong>
          <small>{share}%</small>
        </span>
      </div>
      <div className={styles.sourceTrack} aria-hidden="true">
        <span className={styles.sourceFill} />
      </div>
      <span className={styles.sourceMeta}>
        {approved} approved{leads ? ` · ${rate}% approval` : ''}
      </span>
    </li>
  );
}

/** Which campaigns, channels, buttons and pages bring in applications. */
export default function LeadSources({ sources }: { sources: Record<MixRange, SourceBreakdown> }) {
  const [dimension, setDimension] = useState<SourceDimension>('campaign');
  const [range, setRange] = useState<MixRange>('month');
  const data = sources[range];
  const rows = data.rows[dimension];
  const taggedShare = data.total ? Math.round((data.tagged / data.total) * 100) : 0;
  const noCampaigns = dimension === 'campaign' && rows.every((r) => NEUTRAL.has(r.label));

  return (
    <section className={`${styles.card} ${styles.reveal}`} aria-labelledby="lead-sources-title">
      <header className={styles.cardHead}>
        <div>
          <h2 id="lead-sources-title" className={styles.cardTitle}>
            Lead Sources
          </h2>
          <p className={styles.cardSub}>
            <strong>{data.total}</strong> application{data.total === 1 ? '' : 's'} · <strong>{taggedShare}%</strong> from tagged campaign links
          </p>
        </div>
        <div className={styles.sourceControls}>
          <Segmented label="Group leads by" options={DIMENSIONS} value={dimension} onChange={setDimension} />
          <Segmented label="Lead sources range" options={RANGES} value={range} onChange={setRange} />
        </div>
      </header>

      {data.total === 0 ? (
        <p className={styles.sourcesEmpty}>No applications in this period yet.</p>
      ) : (
        // Keyed so bars re-animate when the view changes.
        <ol key={`${dimension}-${range}`} className={styles.sourceList}>
          {rows.map((row, i) => (
            <Row
              key={row.label}
              index={i}
              label={row.label}
              leads={row.leads}
              approved={row.approved}
              share={Math.round((row.leads / data.total) * 100)}
              color={NEUTRAL.has(row.label) ? 'var(--a-gray)' : COLORS[i % COLORS.length]}
            />
          ))}
        </ol>
      )}

      {(noCampaigns || (data.total > 0 && taggedShare < 50)) && (
        <p className={styles.sourcesHint}>
          <strong>Tip:</strong> add campaign tags to every link you share so leads are credited to the right campaign, e.g.{' '}
          <code>?utm_source=linkedin&amp;utm_medium=social&amp;utm_campaign=world-cx-day</code>.{' '}
          <Link href="/admin/leads">See each lead&apos;s source in the inbox →</Link>
        </p>
      )}
    </section>
  );
}
