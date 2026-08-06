import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { SlideSection } from './helpers'
import content from '../../data/contentData.json'

const FLOATING_CHIPS = ['Tò mò', 'Công nghệ', 'Lập trình', 'AI', 'Kỹ thuật', 'Toán học (cái này hên xui)']
const BG_SRC = '/images/background.png'
// Person-centered crop of hero-portrait.png (pre-cropped so the subject
// sits in the middle of the portrait card at every viewport size).
// Crop window: photo x 33–66%, y 0–100% — the FULL photo height, so the
// person renders at ~50% of the card (zoomed out, full beach scene).
const HERO_IMG = '/images/hero-crop.png'

/**
 * Slide 01 — typographic hero on the ribbon-wallpaper backdrop.
 * Layout: editorial text on the LEFT (~2/5), interactive photo card on the RIGHT (~3/5).
 *
 * The photo card is a rectangular framed portrait (hero-portrait.png) with a
 * real 3D tilt that follows the cursor (perspective + rotateX/rotateY) plus a
 * cursor-following shine — like the original build, without the three.js card.
 *
 * Intro sequence: watermark name fades in → text block rises up → card slides up.
 */
export default function HeroSlide({ slide, meta }) {
  const sectionRef = useRef(null)
  const backNameRef = useRef(null)
  const textRef = useRef(null)
  const cardRef = useRef(null)
  const tiltRef = useRef(null)
  const shineRef = useRef(null)

  // ── Intro sequence (plays once on load) ──────────────────────
  useEffect(() => {
    // Respect prefers-reduced-motion: show the final state instantly.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ;[backNameRef, textRef, cardRef].forEach((r) => gsap.set(r.current, { opacity: 1, y: 0, scale: 1 }))
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(backNameRef.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, 0.2)
        .fromTo(
          textRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.5',
        )
        .fromTo(cardRef.current, { y: 40 }, { y: 0, duration: 1 }, '-=0.7')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // ── 3D tilt: rotate the card toward the cursor ────────────────
  const handleMove = (e) => {
    // Direct manipulation — skip entirely under prefers-reduced-motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1)

    gsap.to(el, {
      rotateX: (0.5 - py) * 10, // look up/down
      rotateY: (px - 0.5) * 14, // look left/right
      duration: 0.4,
      ease: 'power2.out',
    })

    // move the shine to follow the cursor
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(560px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.16), transparent 55%)`
    }
  }

  const handleLeave = () => {
    gsap.to(tiltRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    if (shineRef.current) shineRef.current.style.background = ''
  }

  const scrollToNext = () => {
    const next = document.getElementById('slide-orientation')
    if (next) gsap.to(window, { scrollTo: { y: next }, duration: 1, ease: 'power3.inOut' })
  }

  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center">
      {/* wallpaper background */}
      <img
        src={BG_SRC}
        alt=""
        aria-hidden="true"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* legibility scrim over the bright ribbon highlights */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/65" />

      {/* giant watermark name, layered behind everything */}
      <span
        ref={backNameRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(6.5rem,23vw,25rem)] font-extrabold leading-none text-white/[0.06]"
        style={{ letterSpacing: '-0.04em' }}
      >
        {meta.displayName}
      </span>

      {/* ── Layout: text 2/5 (left) · photo card 3/5 (right) ──── */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20vw)] lg:items-center lg:gap-8 lg:py-24">
        {/* left — editorial text */}
        <div
          ref={textRef}
          className="flex flex-col items-start gap-6 text-left"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-accent/60 hover:text-accent">
            ✦ Semi-pro Vibecoder · {meta.birthYear}
          </span>

          <h1 className="font-display text-balance text-6xl font-bold leading-none tracking-tightest text-white sm:text-7xl lg:text-8xl">
            {meta.displayName}
          </h1>

          <p className="max-w-xl font-display text-xl font-semibold text-neutral-100 sm:text-2xl">
            {slide.secondaryTitle}
          </p>

          {/* intro paragraph — high contrast for readability */}
          <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            {meta.shortIntro}
          </p>

          {/* chips */}
          <div className="mt-2 flex max-w-xl flex-wrap gap-2.5">
            {FLOATING_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-1.5 font-display text-xs font-medium text-neutral-100 backdrop-blur-sm transition-all duration-300 hover:border-accent/60 hover:text-accent"
              >
                {c}
              </span>
            ))}
          </div>

          {/* action buttons — large, high-contrast */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a href="#slide-orientation" className="btn-neon !px-8 !py-3.5 !text-[15px]">
              Khám phá hành trình <ChevronDown size={17} />
            </a>
            <a
              href={content.contact.find((c) => c.channel === 'GitHub')?.href}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost group !px-7 !py-3.5 !text-[15px]"
            >
              GitHub →
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>

        {/* right — narrow photo card (~1/5 slide) with colorful layers behind */}
        <div
          ref={cardRef}
          className="flex w-full items-center justify-center lg:justify-end"
          style={{ perspective: '1200px' }}
        >
          <div
            ref={tiltRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative w-[min(100%,300px)] lg:w-[clamp(260px,20vw,340px)]"
          >
            {/* colorful layers behind — faded, blurred, spread to all sides */}
            <div aria-hidden="true" className="absolute -inset-4 sm:-inset-6">
              <div className="absolute inset-0 -translate-x-5 -translate-y-5 rotate-[-8deg] rounded-2xl border border-white/5 bg-gradient-to-br from-sky-400 to-blue-600 opacity-55 blur-[2px]" />
              <div className="absolute inset-0 translate-x-5 -translate-y-3 rotate-[9deg] rounded-2xl border border-white/5 bg-gradient-to-br from-pink-500 to-rose-600 opacity-55 blur-[2px]" />
              <div className="absolute inset-0 -translate-x-4 translate-y-5 rotate-[3deg] rounded-2xl border border-white/5 bg-gradient-to-br from-amber-400 to-orange-600 opacity-55 blur-[2px]" />
              <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-[-5deg] rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500 to-purple-700 opacity-55 blur-[2px]" />
              <div className="absolute inset-0 -translate-y-6 rotate-[-2deg] rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-55 blur-[2px]" />
              <div className="absolute inset-0 translate-y-6 rotate-[5deg] rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-400 to-sky-600 opacity-55 blur-[2px]" />
            </div>

            {/* the portrait — poster-style card */}
            <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-bento border border-white/10 bg-surface shadow-card">
              <img
                src={HERO_IMG}
                alt="Văn Anh Thông — ảnh chính"
                loading="eager"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />

              {/* legibility gradient over the bright beach photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5" />

              {/* cursor-following shine */}
              <div
                ref={shineRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* caption */}
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold leading-tight text-white">
                    {meta.displayName}
                  </p>
                  <p className="truncate text-[11px] text-white/75" title={meta.role}>{meta.role}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 font-display text-[9px] font-medium uppercase tracking-[0.15em] text-white/85 backdrop-blur-md">
                  ✦ Ben · {meta.birthYear}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50 transition-all duration-300 hover:translate-y-0.5 hover:text-accent"
        aria-label="Cuộn xuống"
      >
        <ChevronDown size={22} />
      </button>
    </SlideSection>
  )
}
