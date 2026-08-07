import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { SlideSection } from './helpers'
import content from '../../data/contentData.json'
import StrokeText from '../StrokeText'
import WarpText from '../WarpText'
import GlowEffect from '../GlowEffect'

const GLOW_COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F']

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
// Word-wrap text at word boundaries for WarpText canvas rendering
// WarpText splits only on \n, so we pre-insert line breaks
function hardWrap(text, charsPerLine = 50) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > charsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.join('\n')
}

export default function HeroSlide({ slide, meta, introDone }) {
  const sectionRef = useRef(null)
  const backNameRef = useRef(null)
  const textRef = useRef(null)
  const cardRef = useRef(null)
  const tiltRef = useRef(null)
  const shineRef = useRef(null)

  // ── Apple-style Intro sequence (plays simultaneously as preloader curtain lifts) ─────
  useEffect(() => {
    if (!introDone) return

    // Respect prefers-reduced-motion: show the final state instantly.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (backNameRef.current) gsap.set(backNameRef.current, { opacity: 1, y: 0, scale: 1 })
      if (textRef.current?.children) gsap.set(textRef.current.children, { opacity: 1, y: 0, scale: 1 })
      if (cardRef.current) gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } })

      // 1. Watermark name background scale & fade in
      if (backNameRef.current) {
        tl.fromTo(
          backNameRef.current,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 1.2 },
          0,
        )
      }

      // 2. Apple-style staggered reveal for text elements (excluding h1 which StrokeText manages)
      if (textRef.current?.children) {
        // Filter out the h1 (index 1) — StrokeText handles its own animation
        const children = Array.from(textRef.current.children).filter(
          (el) => el.tagName !== 'H1',
        )
        tl.fromTo(
          children,
          { opacity: 0, y: 35, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.08,
            clearProps: 'transform,opacity',
          },
          0.02,
        )
      }

      // 3. Apple-style photo card float up & scale in (right column)
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          { opacity: 0, y: 45, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            clearProps: 'transform,opacity',
          },
          0.08,
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [introDone])

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

          {/* ANH THÔNG — StrokeText: only mounts (and triggers animation) after introDone */}
          {introDone ? (
            <h1 className="w-full font-display font-bold leading-none tracking-tightest text-white">
              <StrokeText
                text={meta.displayName}
                strokeColor="#60A5FA"
                fillColor="#ffffff"
                strokeWidth={1.4}
                drawDuration={1.0}
                fillDelay={0.12}
                stagger={0.04}
                ease="power3.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={140}
                fontWeight={800}
                letterSpacing={-4}
              />
            </h1>
          ) : (
            <h1 className="font-display text-balance text-6xl font-bold leading-none tracking-tightest text-white sm:text-7xl lg:text-8xl">
              {meta.displayName}
            </h1>
          )}

          {/* Khởi đầu từ sự tò mò — WarpText glass after intro, plain text during intro */}
          {introDone ? (
            <WarpText
              text={slide.secondaryTitle}
              color="#f3f4f6"
              fontFamily="Space Grotesk, system-ui, sans-serif"
              fontSize="2.5rem"
              fontWeight={600}
              letterSpacing="0em"
              lineHeight={1.4}
              textAlign="left"
              warpStrength={0.06}
              warpScale={1.5}
              speed={0.4}
              pointerInfluence={0.5}
              pointerStrength={0.35}
              refraction={0.014}
              ripple
              style={{ minHeight: 0, height: '3rem', maxWidth: '36rem' }}
            />
          ) : (
            <p className="max-w-xl font-display text-xl font-semibold text-neutral-100 sm:text-2xl">
              {slide.secondaryTitle}
            </p>
          )}

          {/* intro paragraph — WarpText glass after intro, plain text during intro */}
          {introDone ? (
            <WarpText
              text={hardWrap(meta.shortIntro, 58)}
              color="#ffffff"
              fontFamily="Space Grotesk, system-ui, sans-serif"
              fontSize="1.05rem"
              fontWeight={400}
              letterSpacing="0em"
              lineHeight={1.65}
              textAlign="left"
              warpStrength={0.02}
              warpScale={1.4}
              speed={0.3}
              pointerInfluence={0.45}
              pointerStrength={0.25}
              refraction={0.004}
              ripple
              style={{ minHeight: 0, height: '11rem', maxWidth: '36rem' }}
            />
          ) : (
            <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {meta.shortIntro}
            </p>
          )}

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

          {/* action buttons — large, high-contrast, with animated glow ring */}
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <div className="relative">
              <GlowEffect
                colors={GLOW_COLORS}
                mode="colorShift"
                blur="soft"
                duration={3}
                scale={0.9}
              />
              <a
                href="#slide-orientation"
                className="btn-neon relative !px-8 !py-3.5 !text-[15px]"
              >
                Khám phá hành trình <ChevronDown size={17} />
              </a>
            </div>
            <div className="relative">
              <GlowEffect
                colors={GLOW_COLORS}
                mode="colorShift"
                blur="soft"
                duration={3}
                scale={0.9}
              />
              <a
                href={content.contact.find((c) => c.channel === 'GitHub')?.href}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost group relative !px-7 !py-3.5 !text-[15px]"
              >
                GitHub →
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>

        {/* right — narrow photo card (~1/5 slide) with colorful layers behind */}
        <div ref={cardRef} className="flex w-full items-center justify-center lg:justify-end">
          {/* shifted left ~9% + tilted ~5° right so the frame feels like a tossed poster */}
          <div className="rotate-[5deg] lg:-translate-x-[9%]" style={{ perspective: '1200px' }}>
            <div
              ref={tiltRef}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              className="relative w-[min(100%,312px)] lg:w-[clamp(270px,20.8vw,354px)]"
            >
              {/* colorful layers behind — faded, blurred, spread to all sides */}
              <div aria-hidden="true" className="absolute -inset-4 sm:-inset-6">
                <div className="absolute inset-0 -translate-x-5 -translate-y-5 rotate-[-8deg] rounded-2xl border border-white/5 bg-gradient-to-br from-sky-400 to-blue-600 opacity-40 blur-[4px]" />
                <div className="absolute inset-0 translate-x-5 -translate-y-3 rotate-[9deg] rounded-2xl border border-white/5 bg-gradient-to-br from-pink-500 to-rose-600 opacity-40 blur-[4px]" />
                <div className="absolute inset-0 -translate-x-4 translate-y-5 rotate-[3deg] rounded-2xl border border-white/5 bg-gradient-to-br from-amber-400 to-orange-600 opacity-40 blur-[4px]" />
                <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-[-5deg] rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500 to-purple-700 opacity-40 blur-[4px]" />
                <div className="absolute inset-0 -translate-y-6 rotate-[-2deg] rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-40 blur-[4px]" />
                <div className="absolute inset-0 translate-y-6 rotate-[5deg] rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-400 to-sky-600 opacity-40 blur-[4px]" />
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
