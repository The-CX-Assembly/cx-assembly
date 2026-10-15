const INK = '#0C2339';
const NAVY = '#213245';
const PAPER = '#FAFAF4';
const STEEL = '#8FA6C2';

// Centre of the composition — the CX mark is laid over this point in CSS
const CX = 300;
const CY = 360;

// Leaders orbiting the mark, as [angle in degrees, highlighted]
const ORBIT: [number, boolean][] = [
  [-60, true], [0, false], [55, false], [120, true], [180, false], [235, false],
];

function onRing(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

/** Hero panel illustration: peers in orbit, linked by conversations that run through the centre. */
export default function HeroArt() {
  const nodes = ORBIT.map(([angle, hi]) => ({ pos: onRing(angle, 220), hi }));

  return (
    <svg viewBox="0 0 600 720" preserveAspectRatio="xMidYMid slice" className="hero__art" aria-hidden="true">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={NAVY} />
          <stop offset="1" stopColor={INK} />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={STEEL} stopOpacity="0.32" />
          <stop offset="1" stopColor={STEEL} stopOpacity="0" />
        </radialGradient>
        <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={PAPER} fillOpacity="0.08" />
        </pattern>
      </defs>

      <rect width="600" height="720" fill="url(#hero-bg)" />
      <rect width="600" height="720" fill="url(#hero-dots)" />
      <circle cx={CX} cy={CY} r="260" fill="url(#hero-glow)" />

      <circle cx={CX} cy={CY} r="150" fill="none" stroke={STEEL} strokeOpacity="0.3" />
      <circle cx={CX} cy={CY} r="290" fill="none" stroke={PAPER} strokeOpacity="0.07" />

      <g className="spin-slow" style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <circle cx={CX} cy={CY} r="220" fill="none" stroke={PAPER} strokeOpacity="0.16" strokeDasharray="2 9" />
        <g fill="none" stroke={PAPER} strokeOpacity="0.14" strokeWidth="1.5">
          {nodes.map(({ pos: [x, y] }, i) => {
            const [nx, ny] = nodes[(i + 2) % nodes.length].pos;
            return <path key={i} d={`M${x} ${y} Q ${CX} ${CY} ${nx} ${ny}`} />;
          })}
        </g>
        {nodes.map(({ pos: [x, y], hi }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={hi ? 13 : 8}
            fill={hi ? PAPER : NAVY}
            stroke={PAPER}
            strokeOpacity="0.8"
            strokeWidth="2"
            className={hi ? 'pulse-node' : undefined}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </g>

      {/* A question asked… */}
      <g className="float-a">
        <path
          d="M408 92h122a24 24 0 0 1 24 24v58a24 24 0 0 1-24 24h-62l-34 28v-28h-26a24 24 0 0 1-24-24v-58a24 24 0 0 1 24-24z"
          fill={PAPER}
          fillOpacity="0.07"
          stroke={PAPER}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <g fill={PAPER}>
          {[438, 469, 500].map((x, i) => (
            <circle key={x} cx={x} cy="145" r="7" className="pulse-node" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      </g>

      {/* …and answered */}
      <g className="float-b">
        <path
          d="M404 540h130a24 24 0 0 1 24 24v56a24 24 0 0 1-24 24h-22v28l-34-28h-74a24 24 0 0 1-24-24v-56a24 24 0 0 1 24-24z"
          fill={STEEL}
          fillOpacity="0.18"
          stroke={STEEL}
          strokeOpacity="0.75"
          strokeWidth="1.5"
        />
        <g stroke={PAPER} strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round">
          <path d="M412 576h110" />
          <path d="M412 602h84" />
        </g>
      </g>
    </svg>
  );
}
