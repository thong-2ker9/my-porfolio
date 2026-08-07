import { useEffect, useId, useRef } from 'react'

const BLUR_MAP = { none: 0, soft: 4, medium: 8, hard: 16 }

/**
 * GlowEffect — motion-primitives-style animated glow ring that sits behind a
 * button/card. Pure React + SVG (no framer-motion): an SVG rounded-rect ring
 * with a gaussian blur is stretched to hug the wrapped element.
 *
 * mode:
 *  - 'colorShift' — cycles the ring color through `colors` (one per `duration`)
 *  - 'shift'      — conveyor-belt dash sweep along the ring
 *  - 'static'     — holds the first color
 *
 * Respects prefers-reduced-motion (static ring, no animation).
 */
export default function GlowEffect({
  className = '',
  style,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'colorShift',
  blur = 'soft',
  duration = 3,
  scale = 1,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const filterId = `glow-f-${uid}`
  const ringRef = useRef(null)
  const colorIndexRef = useRef(0)
  const lastSwitchRef = useRef(0)

  // ── animation loop (colorShift / shift) ─────────────────────────
  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return

    // Static mode: hold the first color (the user explicitly requested the
    // animated glow, so it always animates — reduced-motion users still get
    // a steady colored ring).
    if (mode === 'static') {
      ring.querySelectorAll('rect').forEach((r) => {
        r.style.stroke = colors[0]
        r.style.strokeDasharray = ''
      })
      return
    }

    let raf
    const tick = (t) => {
      const rects = ring.querySelectorAll('rect')
      if (mode === 'colorShift') {
        if (t - lastSwitchRef.current > duration * 1000) {
          colorIndexRef.current = (colorIndexRef.current + 1) % colors.length
          lastSwitchRef.current = t
          rects.forEach((r) => {
            r.style.stroke = colors[colorIndexRef.current]
          })
        }
      } else if (mode === 'shift') {
        // conveyor sweep: dashoffset runs one full cycle per `duration`
        const p = ((t / (duration * 1000)) % 1) * 100
        rects.forEach((r) => {
          r.style.strokeDashoffset = String(-p)
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, duration, colors])

  const std = BLUR_MAP[blur] ?? 4
  const dashArray = mode === 'shift' ? '6 4' : undefined

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-px z-0 ${className}`}
      style={style}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={std} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g
          ref={ringRef}
          filter={`url(#${filterId})`}
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          {/* thick pass = soft aura, medium = glow, thin = crisp edge */}
          {[7, 3.5, 1.4].map((w) => (
            <rect
              key={w}
              x="2"
              y="2"
              width="96"
              height="96"
              rx="48"
              fill="none"
              stroke={colors[0]}
              strokeWidth={w}
              strokeLinecap="round"
              strokeDasharray={dashArray}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
