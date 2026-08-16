import { useMemo } from 'react'

/** Deterministic PRNG so the ambient layout never shuffles between renders. */
const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Slow ambient dust-mote drift (Reactbits "Meteors" / particle-field pattern).
 *  Tiny blurred amber bokeh drifting diagonally on a 22–40s loop, 5–10% opacity.
 *  Pure atmosphere — pointer-events none, z-index 0, nothing interactive. */
export function Motes({
  tone = 'rgba(217, 154, 78, 0.9)',
  count = 14,
  seed = 11,
  className = '',
}) {
  const motes = useMemo(() => {
    const rnd = mulberry32(seed)
    return Array.from({ length: count }, () => ({
      left: 2 + rnd() * 96,
      top: 4 + rnd() * 92,
      size: 12 + rnd() * 10,
      dur: 24 + rnd() * 16,
      delay: -rnd() * 40,
      o: 0.05 + rnd() * 0.05,
      dx: -28 - rnd() * 56,
      dy: -80 - rnd() * 90,
    }))
  }, [count, seed])

  return (
    <div aria-hidden className={`motes ${className}`}>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            background: `radial-gradient(circle, ${tone}, transparent 65%)`,
            '--dur': `${m.dur}s`,
            '--delay': `${m.delay}s`,
            '--o': String(m.o),
            '--dx': `${m.dx}px`,
            '--dy': `${m.dy}px`,
          }}
        />
      ))}
    </div>
  )
}

/** Small 4-point sparkle glyph (Reactbits "Sparkles" pattern) — thin line art,
 *  slow drift + twinkle. Positions come from the `sparkle-*` CSS classes. */
export function Sparkle({ className = '', delay = 0, dx = 18, dy = -14, size = 20 }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      className={`sparkle ${className}`}
      style={{
        width: size,
        height: size,
        '--delay': `${delay}s`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
      }}
    >
      <path d="M12 1.5 L13.7 10.3 L22.5 12 L13.7 13.7 L12 22.5 L10.3 13.7 L1.5 12 L10.3 10.3 Z" />
    </svg>
  )
}
