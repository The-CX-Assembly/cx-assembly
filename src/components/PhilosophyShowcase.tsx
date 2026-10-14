'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowDownRight, ArrowRight } from '@/components/Icons';

type Pillar = { title: string; description: string };

const AUTOPLAY_MS = 7000;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Philosophy pillars as a media panel + selectable list. Auto-advances until the
 * visitor picks an item; pauses on hover; never autoplays with reduced motion.
 */
export default function PhilosophyShowcase({ pillars }: { pillars: Pillar[] }) {
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress bar after a pause
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const autoplay = !stopped && !reducedMotion;
  const count = pillars.length;

  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, paused, active, cycle, count]);

  const select = (i: number) => {
    setActive(i);
    setStopped(true);
  };

  const current = pillars[active];
  if (!current) return null;

  return (
    <div
      className="ph"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setCycle((c) => c + 1);
      }}
    >
      <div className="ph__media">
        {pillars.map((_, i) => (
          <div key={i} className={`ph__art${i === active ? ' is-active' : ''}`} aria-hidden="true">
            <PillarArt variant={i % ART.length} />
          </div>
        ))}

        <div className="ph__caption" key={active} aria-live="polite">
          <p className="ph__kicker">
            {String(active + 1).padStart(2, '0')} / {String(pillars.length).padStart(2, '0')}
          </p>
          <h3 className="ph__title">{current.title}</h3>
          <p className="ph__desc">{current.description}</p>
        </div>
      </div>

      <ol className="ph__list">
        {pillars.map((pillar, i) => {
          const isActive = i === active;
          return (
            <li key={pillar.title}>
              <button
                type="button"
                className={`ph__item${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() => select(i)}
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
              >
                <span className="ph__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ph__name">{pillar.title}</span>
                <span className="ph__arrow">{isActive ? <ArrowDownRight size={20} /> : <ArrowRight size={18} />}</span>
                {isActive && autoplay && !paused && (
                  <span key={cycle} className="ph__progress" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Illustrations ─────────────────────────────────────────────── */

const INK = '#0C2339';
const NAVY = '#213245';
const PAPER = '#FAFAF4';
const STEEL = '#8FA6C2';

// Shrinks a centred composition into the upper part of the panel, clear of the caption
const UPPER = 'translate(400 260) scale(0.64) translate(-400 -405)';

function Backdrop({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={NAVY} />
          <stop offset="1" stopColor={INK} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.7" cy="0.25" r="0.7">
          <stop offset="0" stopColor={STEEL} stopOpacity="0.28" />
          <stop offset="1" stopColor={STEEL} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-dots`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={PAPER} fillOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="800" height="800" fill={`url(#${id}-bg)`} />
      <rect width="800" height="800" fill={`url(#${id}-glow)`} />
      <rect width="800" height="800" fill={`url(#${id}-dots)`} />
    </>
  );
}

/** Real Questions. Honest Answers. — two voices in conversation */
function ArtConversation() {
  return (
    <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className="ph__svg">
      <Backdrop id="a1" />
      <g transform={UPPER}>
      <g className="float-a">
        <path
          d="M150 170h330a46 46 0 0 1 46 46v170a46 46 0 0 1-46 46H290l-82 70v-70h-58a46 46 0 0 1-46-46V216a46 46 0 0 1 46-46z"
          fill={PAPER}
          fillOpacity="0.06"
          stroke={PAPER}
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <text x="315" y="370" textAnchor="middle" fontSize="190" fontWeight="600" fill={PAPER} fillOpacity="0.9" style={{ fontFamily: 'var(--font-sans)' }}>
          ?
        </text>
      </g>
      <g className="float-b">
        <path
          d="M650 400H360a46 46 0 0 0-46 46v150a46 46 0 0 0 46 46h190l82 64v-64h18a46 46 0 0 0 46-46V446a46 46 0 0 0-46-46z"
          fill={STEEL}
          fillOpacity="0.2"
          stroke={STEEL}
          strokeOpacity="0.8"
          strokeWidth="2"
        />
        <g stroke={PAPER} strokeOpacity="0.75" strokeWidth="10" strokeLinecap="round">
          <path d="M370 470h210" />
          <path d="M370 516h250" />
          <path d="M370 562h150" />
        </g>
      </g>
      </g>
    </svg>
  );
}

/** A Community Beyond Events — a network that keeps moving */
const NODES = [
  [400, 140], [560, 190], [650, 330], [640, 500], [540, 630], [380, 670],
  [230, 610], [150, 470], [160, 300], [260, 180], [400, 330], [500, 420],
  [330, 470], [420, 540],
];
const LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
  [0, 10], [10, 11], [11, 3], [10, 12], [12, 6], [12, 13], [13, 4], [11, 13], [8, 10], [2, 11],
];

function ArtNetwork() {
  return (
    <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className="ph__svg">
      <Backdrop id="a2" />
      <g transform={UPPER}>
      <g className="spin-slow" style={{ transformOrigin: '400px 405px' }}>
        <circle cx="400" cy="405" r="300" fill="none" stroke={PAPER} strokeOpacity="0.1" strokeDasharray="2 10" />
        <circle cx="400" cy="405" r="210" fill="none" stroke={STEEL} strokeOpacity="0.25" />
        <circle cx="700" cy="405" r="7" fill={STEEL} />
      </g>
      <g stroke={PAPER} strokeOpacity="0.28" strokeWidth="1.5">
        {LINKS.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i >= 10 ? 14 : 9}
          fill={i >= 10 ? PAPER : NAVY}
          stroke={PAPER}
          strokeOpacity="0.8"
          strokeWidth="2"
          className={i % 3 === 0 ? 'pulse-node' : undefined}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
      </g>
    </svg>
  );
}

/** Shaped by CX Leaders — many voices converging to set a direction */
function ArtDirection() {
  const lines = Array.from({ length: 15 }, (_, i) => 60 + i * 48);
  return (
    <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" className="ph__svg">
      <Backdrop id="a3" />
      <g fill="none" strokeWidth="1.5" className="draw-lines">
        {lines.map((x, i) => (
          <path
            key={x}
            d={`M${x} 800 C ${x} 560, ${400 + (x - 400) * 0.25} 380, 400 250`}
            stroke={i % 4 === 0 ? STEEL : PAPER}
            strokeOpacity={i % 4 === 0 ? 0.85 : 0.3}
          />
        ))}
      </g>
      <circle cx="400" cy="250" r="70" fill={STEEL} fillOpacity="0.16" className="pulse-node" />
      <circle cx="400" cy="250" r="22" fill={PAPER} />
      <path d="M400 170v-70M372 128l28-28 28 28" fill="none" stroke={PAPER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ART = [ArtConversation, ArtNetwork, ArtDirection];

function PillarArt({ variant }: { variant: number }) {
  const Art = ART[variant];
  return <Art />;
}
