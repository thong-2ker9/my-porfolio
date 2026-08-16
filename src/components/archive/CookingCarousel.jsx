import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { dishes } from '../../data/cookingData'
import { Motes } from './Ambient'
import { useLanguage } from '../../i18n/LanguageProvider'

/** Góc bếp — wide skewed coverflow (the React Bits Pro SkewedCarousel look).
 *  Landscape 16:9 cards fan out across the full width in a 3D arc; the
 *  active card faces forward, neighbours rotate away in Y, scale down and
 *  blur. No captions under the photos — only a dash pagination + arrows. */
export default function CookingCarousel() {
  const { t } = useLanguage()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const dragRef = useRef(null)
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const n = dishes.length
  const go = useCallback((dir) => setActive((a) => (a + dir + n) % n), [n])

  // autoplay — stops while hovered / dragging, off under reduced motion
  useEffect(() => {
    if (paused || reduced || n < 2) return
    const t = setInterval(() => setActive((a) => (a + 1) % n), 4500)
    return () => clearInterval(t)
  }, [paused, reduced, n])

  // simple drag: track pointer X, on release step by the number of cards crossed
  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, id: e.pointerId }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerUp = (e) => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const steps = Math.round(dx / 160)
    if (steps !== 0) go(-steps)
  }

  const distance = (i) => {
    const d = i - active
    const half = Math.floor(n / 2)
    return d > half ? d - n : d < -half ? d + n : d
  }

  return (
    <section className="archive-panel relative overflow-hidden p-5 sm:p-6">
      {/* ambient decor — warm line-art doodles + dust motes in negative space.
          All pointer-events none; the glow sits behind the active dish. */}
      <span className="panel-trail panel-trail-cook" aria-hidden />
      <Motes tone="rgba(232, 130, 76, 0.85)" count={11} seed={23} className="motes-inset" />

      {/* thin chopsticks outline, bottom-left */}
      <div className="doodle-chop" aria-hidden>
        <svg viewBox="0 0 90 88" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M16 84 L 62 30" />
          <path d="M29 86 L 75 32" />
          <path d="M10 78 L 19 86 M23 80 L 32 88" />
        </svg>
      </div>

      {/* minimal flame line-glyph (the 🔥 of the heading, drawn instead of emoji) */}
      <div className="doodle-flame" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </div>

      {/* plate + fork line motif, bottom-right */}
      <div className="doodle-plate" aria-hidden>
        <svg viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <ellipse cx="24" cy="46" rx="22" ry="10" />
          <ellipse cx="24" cy="41" rx="14" ry="5" />
          <path d="M58 8 V 16 M64 8 V 16 M70 8 V 16 M57 8 H 71 M64 16 V 56" />
        </svg>
      </div>

      {/* header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="catalog-eyebrow">{t('DISH · Sở thích phát minh những món độck đáok 🗣️🗣️')}</span>
          <h3 className="mt-1.5 font-serif text-xl font-medium text-ink sm:text-2xl">{t('Nấu ăn     (let himm cookk🗣️🔥🔥🔥)')}</h3>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => go(-1)}
            aria-label={t('Món trước')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label={t('Món tiếp theo')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* wide coverflow stage */}
      <div
        className="carousel-stage relative mx-auto h-[280px] w-full sm:h-[360px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* warm glow behind the active (center) dish + rising steam lines */}
        <div className="carousel-glow" aria-hidden />
        <div className="steam" aria-hidden>
          <svg viewBox="0 0 140 84" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M44 80 C 34 66, 56 60, 44 46 C 36 36, 52 28, 46 14" />
            <path d="M70 80 C 60 66, 82 60, 70 46 C 62 36, 78 28, 72 14" />
            <path d="M96 80 C 86 66, 108 60, 96 46 C 88 36, 104 28, 98 14" />
          </svg>
        </div>
        <div className="steam steam-b" aria-hidden>
          <svg viewBox="0 0 140 84" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M44 80 C 34 66, 56 60, 44 46 C 36 36, 52 28, 46 14" />
            <path d="M70 80 C 60 66, 82 60, 70 46 C 62 36, 78 28, 72 14" />
            <path d="M96 80 C 86 66, 108 60, 96 46 C 88 36, 104 28, 98 14" />
          </svg>
        </div>
        {dishes.map((d, i) => {
          const dist = distance(i)
          const abs = Math.abs(dist)
          const hidden = abs > 3
          return (
            <figure
              key={d.src}
              data-dish
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (dragRef.current = null)}
              aria-hidden={hidden}
              className="carousel-item absolute left-1/2 top-1/2 w-[300px] sm:w-[440px]"
              style={{
                transform: `translate(-50%,-50%) translateX(${
                  dist * 88
                }%) rotateY(${-dist * 38}deg) scale(${1 - abs * 0.13}) translateZ(${-abs * 70}px)`,
                opacity: hidden ? 0 : 1 - abs * 0.32,
                filter: hidden ? 'blur(5px)' : abs > 0 ? `blur(${abs * 1.2}px)` : 'none',
                zIndex: 30 - abs,
                pointerEvents: hidden ? 'none' : 'auto',
              }}
            >
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.8)]">
                <img
                  src={d.src}
                  alt={t(d.title)}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          )
        })}
      </div>

      {/* dot pagination — active dot gets a thin orbiting ring */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => go(-1)}
          aria-label={t('Món trước')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E] sm:hidden"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex items-center gap-1" role="tablist" aria-label={t('Các món ăn')}>
          {dishes.map((d, i) => (
            <button
              key={d.src}
              role="tab"
              aria-selected={i === active}
              aria-label={t(d.title)}
              onClick={() => setActive(i)}
              className={`cook-dot ${i === active ? 'active-ring' : ''}`}
            >
              <span className={`cook-dot-core ${i === active ? 'active' : ''}`} />
            </button>
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label={t('Món tiếp theo')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E] sm:hidden"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  )
}
