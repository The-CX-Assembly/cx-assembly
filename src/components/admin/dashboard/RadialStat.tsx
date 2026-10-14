'use client';

import Link from 'next/link';
import { IconArrowUpRight } from '../AdminIcons';
import { formatNumber, useCountUp } from './useCountUp';
import styles from './dashboard.module.css';

interface RadialStatProps {
  title: string;
  caption: string;
  value: number;
  percent: number;
  color: string;
  colorTo: string;
  href: string;
  index: number;
}

const R = 34;
const CIRC = 2 * Math.PI * R;

export default function RadialStat({ title, caption, value, percent, color, colorTo, href, index }: RadialStatProps) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const shown = useCountUp(value, 1400, 250 + index * 90);
  const shownPct = useCountUp(pct, 1400, 250 + index * 90);
  const gradientId = `ring-${index}`;

  return (
    <article
      className={`${styles.radial} ${styles.reveal}`}
      style={{ '--c': color, '--d': 4 + index * 0.6, '--circ': CIRC, '--offset': CIRC * (1 - pct / 100) } as React.CSSProperties}
    >
      <header className={styles.radialHead}>
        <h3>{title}</h3>
        <p>
          <span className={styles.radialPct}>{Math.round(shownPct)}%</span> {caption}
        </p>
      </header>

      <div className={styles.ringWrap}>
        <svg viewBox="0 0 88 88" className={styles.ring} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colorTo} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <circle cx="44" cy="44" r={R} className={styles.ringTrack} />
          <circle
            cx="44"
            cy="44"
            r={R}
            className={styles.ringValue}
            stroke={`url(#${gradientId})`}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
          />
        </svg>
        <span className={styles.ringCore}>
          <IconArrowUpRight size={18} />
        </span>
      </div>

      <p className={styles.radialValue}>{formatNumber(shown)}</p>
      <Link href={href} className={styles.viewAll}>
        View all
      </Link>
    </article>
  );
}
