import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLanguage } from '../i18n/LanguageProvider'

/**
 * Multilingual Preloader Intro
 * ─────────────────────────
 * Full-screen light overlay with a dot-grid pattern. A greeting cycles through
 * languages (• Hello • Hola • …) then, on the final word, the whole curtain
 * slides up (translateY -100%, power4.inOut) to reveal the site underneath.
 *
 * Uses GSAP (already the app's animation engine) — the exit ease
 * [0.76, 0, 0.24, 1] maps to power4.inOut.
 */
const GREETINGS = ['Hello', 'Hola', 'Merhaba', 'Привет', 'Halo', 'Xin chào']
const WORD_MS = 240 // per-greeting dwell (spec: 200–300ms)
const HOLD_LAST_MS = 700 // extra hold on the final language
const EXIT_MS = 800

/** Instant jump to top — bypasses the CSS `scroll-behavior: smooth`, which
 *  would otherwise animate the jump (visibly scrolling through mid-page
 *  slides before reaching slide 1). */
const scrollTopInstant = () => {
  if (typeof window === 'undefined') return
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

export default function Preloader({ onStartReveal, onComplete }) {
  const { t } = useLanguage()
  const overlayRef = useRef(null)
  const innerRef = useRef(null)
  const onStartRevealRef = useRef(onStartReveal)
  onStartRevealRef.current = onStartReveal
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const [idx, setIdx] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // ── 1) Lock scroll + always start from the top ──────────────────
  useEffect(() => {
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    const prevScrollBehavior = root.style.scrollBehavior

    history.scrollRestoration = 'manual'
    root.style.scrollBehavior = 'auto'
    scrollTopInstant()
    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = prevOverflow
      root.style.scrollBehavior = prevScrollBehavior
    }
  }, [])

  // ── 2) Greeting cycle ────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: static greeting, quick fade instead of the cycle.
      const t = setTimeout(() => setLeaving(true), 500)
      return () => clearTimeout(t)
    }

    let cancelled = false
    const timers = []
    let i = 0

    const step = () => {
      if (cancelled) return
      setIdx(i)
      if (i >= GREETINGS.length - 1) {
        // Final language reached → brief hold, then exit.
        timers.push(setTimeout(() => !cancelled && setLeaving(true), HOLD_LAST_MS))
        return
      }
      i += 1
      timers.push(setTimeout(step, WORD_MS))
    }

    timers.push(setTimeout(step, 120)) // tiny settle delay before the first word
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [reducedMotion])

  // ── 3) Exit: slide the curtain up (fade out when reduced motion) ─
  useEffect(() => {
    if (!leaving) return
    // Re-assert the top position as the curtain lifts — covers any late
    // browser scroll-restoration that fired after the mount-time scrollTo.
    scrollTopInstant()
    const overlay = overlayRef.current
    const inner = innerRef.current

    const tl = gsap.timeline({
      onComplete: () => onCompleteRef.current(),
    })

    if (reducedMotion) {
      tl.to(overlay, {
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power2.out',
        onStart: () => onStartRevealRef.current?.(),
      })
    } else {
      // Content dims a touch while the curtain rises.
      tl.to(inner, { opacity: 0, y: -24, duration: 0.35, ease: 'power2.in' })
        .to(
          overlay,
          {
            yPercent: -100,
            duration: EXIT_MS / 1000,
            ease: 'power4.inOut',
            onStart: () => onStartRevealRef.current?.(), // Slide 1 & Header animation start simultaneously as curtain slides up!
          },
          0.12,
        )
    }
    return () => tl.kill()
  }, [leaving, reducedMotion])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="dot-grid fixed inset-0 z-[60] flex items-center justify-center bg-gray-50"
    >
      <div ref={innerRef} className="flex flex-col items-center gap-10 px-6">
        {/* brand mark */}
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-900/50">
          Anh Thông · {t('Portfolio')}
        </p>

        {/* line · greeting · line */}
        <div className="flex items-center gap-5 sm:gap-7">
          <span className="relative h-px w-12 bg-gray-900/30 sm:w-16">
            <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gray-900" />
          </span>

          <span
            key={idx}
            className="word-in font-display text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            {GREETINGS[idx]}
          </span>

          <span className="relative h-px w-12 bg-gray-900/30 sm:w-16">
            <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gray-900" />
          </span>
        </div>

        {/* language progress dots */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {GREETINGS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-6 bg-gray-900'
                  : 'w-1.5 bg-gray-900/25'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
