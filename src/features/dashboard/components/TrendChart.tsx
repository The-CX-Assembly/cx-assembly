'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SeriesPoint, TrendRange } from '@/features/dashboard/stats';
import { IconUser } from '@/components/admin/AdminIcons';
import Segmented from './Segmented';
import styles from './dashboard.module.css';

const HEIGHT = 300;
const PAD = { top: 28, right: 14, bottom: 34, left: 40 };

const RANGES: { value: TrendRange; label: string; caption: string }[] = [
  { value: 'week', label: 'Weekly', caption: 'last 7 days' },
  { value: 'month', label: 'Monthly', caption: 'last 30 days' },
  { value: 'year', label: 'Yearly', caption: 'last 12 months' },
];

function niceScale(max: number) {
  const rough = Math.max(max, 4) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? rough;
  return { step, max: step * 4 };
}

/** Monotone cubic interpolation (Fritsch–Carlson) — smooth, never dips below zero. */
function monotonePath(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;

  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    slopes.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x));
  }

  const tangents = new Array<number>(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      tangents[i] = tau * a * slopes[i];
      tangents[i + 1] = tau * b * slopes[i];
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (pts[i + 1].x - pts[i].x) / 3;
    d += `C${pts[i].x + dx},${pts[i].y + tangents[i] * dx} ${pts[i + 1].x - dx},${pts[i + 1].y - tangents[i + 1] * dx} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

export default function TrendChart({ series }: { series: Record<TrendRange, SeriesPoint[]> }) {
  const [range, setRange] = useState<TrendRange>('month');
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = series[range];
  const total = data.reduce((sum, p) => sum + p.value, 0);
  const peakValue = Math.max(0, ...data.map((p) => p.value));
  const { step, max } = niceScale(peakValue);

  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const baseY = PAD.top + innerH;

  const points = useMemo(
    () =>
      data.map((p, i) => ({
        x: PAD.left + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1)),
        y: PAD.top + innerH - (p.value / max) * innerH,
      })),
    [data, innerW, innerH, max],
  );

  const line = monotonePath(points);
  const area = points.length ? `${line}L${points[points.length - 1].x},${baseY}L${points[0].x},${baseY}Z` : '';

  // Thin x labels so they never collide; always keep the most recent one.
  const maxLabels = Math.max(2, Math.floor(innerW / 46));
  const every = Math.max(1, Math.ceil(data.length / maxLabels));
  const showLabel = (i: number) => (data.length - 1 - i) % every === 0;

  // When idle, pin the tooltip to the busiest point (latest one on ties).
  const peakIndex = peakValue > 0 ? data.map((p) => p.value).lastIndexOf(peakValue) : null;
  const active = hover ?? peakIndex;
  const activePoint = active !== null ? points[active] : null;
  // Not enough headroom above the point: show the tooltip underneath instead.
  const tooltipBelow = activePoint ? activePoint.y < 72 : false;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * innerW;
    const i = Math.round((x / innerW) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };

  const caption = RANGES.find((r) => r.value === range)?.caption;

  return (
    <section className={`${styles.card} ${styles.trendCard} ${styles.reveal}`} style={{ '--d': 2 } as React.CSSProperties}>
      <header className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>Application Trend</h2>
          <p className={styles.cardSub}>
            <strong>{total.toLocaleString('en-IN')}</strong> applications in the {caption}
          </p>
        </div>
        <Segmented
          label="Trend range"
          options={RANGES}
          value={range}
          onChange={(r) => {
            setRange(r);
            setHover(null);
          }}
        />
      </header>

      <div className={styles.chartBox} ref={boxRef}>
        <svg width={width} height={HEIGHT} className={styles.chartSvg} role="img" aria-label={`Applications per period, ${caption}`}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B6CFF" stopOpacity="0.38" />
              <stop offset="65%" stopColor="#B9A6FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#B9A6FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
          </defs>

          {/* Y axis */}
          {[0, 1, 2, 3, 4].map((t) => {
            const y = PAD.top + innerH - (t / 4) * innerH;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} className={t === 0 ? styles.axisBase : styles.gridLine} />
                <text x={PAD.left - 12} y={y} className={styles.axisText} textAnchor="end" dominantBaseline="middle">
                  {(t * step).toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* X axis */}
          {points.map((p, i) =>
            showLabel(i) ? (
              <g key={i}>
                <line x1={p.x} x2={p.x} y1={PAD.top} y2={baseY} className={styles.gridLineV} />
                <text
                  x={p.x}
                  y={HEIGHT - 10}
                  className={`${styles.axisText} ${active === i ? styles.axisTextActive : ''}`}
                  textAnchor="middle"
                >
                  {data[i].label}
                </text>
              </g>
            ) : null,
          )}

          {/* Series — keyed by range so the draw-in animation replays */}
          <g key={range}>
            <path d={area} fill="url(#trendFill)" className={styles.chartArea} />
            <path d={line} fill="none" stroke="url(#trendStroke)" strokeWidth={2.5} pathLength={1} className={styles.chartLine} />
          </g>

          {activePoint && (
            <g className={styles.crosshair} style={{ transform: `translateX(${activePoint.x}px)` }}>
              <line x1={0} x2={0} y1={activePoint.y} y2={baseY} className={styles.crosshairLine} />
            </g>
          )}
          {activePoint && (
            <circle
              cx={0}
              cy={0}
              r={6}
              className={styles.marker}
              style={{ transform: `translate(${activePoint.x}px, ${activePoint.y}px)` }}
            />
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            style={{ cursor: 'crosshair' }}
          />
        </svg>

        {activePoint && active !== null && (
          <div
            className={`${styles.tooltip} ${tooltipBelow ? styles.tooltipBelow : ''}`}
            style={{
              transform: `translate(${Math.min(Math.max(activePoint.x, 70), width - 70)}px, ${activePoint.y}px) ${tooltipBelow ? 'translate(-50%, 16px)' : 'translate(-50%, calc(-100% - 16px))'}`,
            }}
            aria-hidden="true"
          >
            <span className={styles.tooltipValue}>
              <IconUser size={14} />
              {data[active].value.toLocaleString('en-IN')}
            </span>
            <span className={styles.tooltipLabel}>{data[active].tooltip}</span>
          </div>
        )}

        {total === 0 && <p className={styles.chartEmpty}>No applications in the {caption} yet</p>}
      </div>
    </section>
  );
}
