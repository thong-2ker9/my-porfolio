import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { SlideSection, SlideHeader, Highlights, Body } from './helpers'
import { GlowEffect } from '../GlowEffect'
import { SportsMosaic } from '../SportsMosaic'
import ArchiveSection from '../archive/ArchiveSection'
import SlideDoodles from './SlideDoodles'
import { useLanguage } from '../../i18n/LanguageProvider'

/** Fullscreen photo viewer — opened by clicking any image on the slide. */
function Lightbox({ item, onClose }) {
  const { t } = useLanguage()
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button
        onClick={onClose}
        aria-label={t('Đóng ảnh')}
        autoFocus
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-all duration-300 hover:rotate-90 hover:border-accent hover:text-accent"
      >
        <X size={20} />
      </button>
      <figure
        className="flex max-h-full max-w-4xl flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.title}
          className="max-h-[76vh] w-auto max-w-full rounded-card border border-white/10 object-contain shadow-card"
        />
        <figcaption className="text-center">
          <p className="font-display text-lg font-bold text-white">{item.title}</p>
          {item.caption && <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/70">{item.caption}</p>}
        </figcaption>
      </figure>
    </div>
  )
}

function GroupHeading({ title, sub }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-2.5">
      <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
      {sub && <span className="text-xs uppercase tracking-[0.18em] text-body/50">{sub}</span>}
    </div>
  )
}

/**
 * Netflix-style slide: a hero detail panel for the selected movie + a
 * horizontally scrollable rail of posters. Clicking a poster (or auto-rotation)
 * swaps the detail panel — each movie carries its own title, tag, description,
 * facts and gallery. Sports photos live in their own section below.
 */
export default function MoviesSlide({ slide }) {
  const { t } = useLanguage()
  const movies = slide.movies || []
  const classics = slide.classics || []
  const sports = slide.sports || {}
  const sportsPhotos = sports.photos || []

  const [selectedId, setSelectedId] = useState(movies[0]?.id ?? null)
  const [userPicked, setUserPicked] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [lightbox, setLightbox] = useState(null) // { src, title, caption }
  const [railVisible, setRailVisible] = useState(true)
  const railRef = useRef(null)
  const lastInteractRef = useRef(0)
  const lastFocusedRef = useRef(null)

  const openLightbox = (item) => {
    lastFocusedRef.current = document.activeElement
    setLightbox(item)
  }
  const closeLightbox = useCallback(() => {
    setLightbox(null)
    // return focus to the element that opened the viewer
    requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
  }, [])

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const selectedIndex = movies.findIndex((m) => m.id === selectedId)
  const selected = movies[selectedIndex] || movies[0] || null

  const select = (id) => {
    setSelectedId(id)
    setUserPicked(true)
    lastInteractRef.current = Date.now()
  }

  // Track whether the poster rail is actually on screen. The hero only needs to
  // keep rotating while the user can see it — and pausing it off-screen also
  // stops the slide from re-rendering (and scrolling) while other slides are
  // being read.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([entry]) => setRailVisible(entry.isIntersecting), { threshold: 0.2 })
    obs.observe(rail)
    return () => obs.disconnect()
  }, [])

  // Auto-rotate the hero every 6s, like a Netflix row — paused while hovering,
  // while reduced motion is preferred, while the viewer is open, or while the
  // rail is off-screen. After the user picks a movie it resumes rotating once
  // they've been idle for a while.
  useEffect(() => {
    // Pause rotation while the fullscreen viewer is open too.
    if (hovering || reducedMotion || lightbox || !railVisible || movies.length < 2) return
    const t = setInterval(() => {
      if (userPicked && Date.now() - lastInteractRef.current < 12000) return
      setSelectedId((prev) => {
        const i = movies.findIndex((m) => m.id === prev)
        return movies[(i + 1) % movies.length].id
      })
    }, 6000)
    return () => clearInterval(t)
  }, [userPicked, hovering, reducedMotion, lightbox, railVisible, movies])

  // Keep the selected poster inside the visible rail — but scroll the RAIL
  // only, never the page. scrollIntoView() also scrolls every scrollable
  // ancestor (including the window), so when the auto-rotation advanced to a
  // poster outside the rail window it would yank the whole page back to the
  // movies slide while the user was reading a slide below.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || !selected) return
    const card = rail.querySelector(`[data-movie="${selected.id}"]`)
    if (!card) return
    const r = rail.getBoundingClientRect()
    const c = card.getBoundingClientRect()
    if (c.left < r.left || c.right > r.right) {
      const delta = c.left - r.left - (r.width - c.width) / 2
      rail.scrollBy({ left: delta, behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }, [selected, reducedMotion])

  const scrollRail = (dir) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector('[data-movie]')
    const step = card ? card.getBoundingClientRect().width + 16 : 320
    rail.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <SlideSection id={slide.id} num={slide.num} className="py-14 sm:py-16">
      {/* faint cinema stickers in the slide's empty corners */}
      <SlideDoodles theme={slide.id} />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-2 sm:px-10 sm:py-4">
        {/* ── Compact editorial intro: text and posters share one visual rhythm ── */}
        <div className="grid items-start gap-5 border-b border-white/10 pb-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10">
          <SlideHeader
            num={slide.num}
            primaryTitle={slide.primaryTitle}
            secondaryTitle={slide.secondaryTitle}
          />
          <div className="relative flex flex-col gap-3 border-l-2 border-accent/40 pl-4 sm:pl-5 lg:pt-1">
            <div className="absolute -left-[3px] top-0 h-8 w-1 rounded-full bg-accent" aria-hidden="true" />
            <Body paragraphs={slide.body} className="!gap-1.5" />
            <Highlights items={slide.highlights} />
          </div>
        </div>

        {/* ── Hero detail panel — shows the selected movie ── */}
        {selected && (
          <section
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            aria-label={`${t('Đang xem:')} ${selected.title}`}
            aria-live="polite"
          >
            <div key={selected.id} className="grid animate-fadeUp gap-5 lg:grid-cols-[0.54fr_1.46fr] lg:gap-8">
              {/* big poster — narrower column on desktop keeps the poster tall enough to read but pulls the poster rail up */}
              <div
                data-reveal
                onClick={() => openLightbox({ src: selected.poster, title: selected.title, caption: selected.tag })}
                className="panel group relative cursor-pointer overflow-hidden p-0"
                role="button"
                tabIndex={0}
                aria-label={`${t('Xem to')} ${selected.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openLightbox({ src: selected.poster, title: selected.title, caption: selected.tag })
                  }
                }}
              >
                <div className="relative aspect-[2/3] w-full sm:aspect-[3/4] lg:aspect-[2/3]">
                  <img
                    src={selected.poster}
                    alt={`${selected.title} — poster`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-accent/50 bg-black/60 px-3 py-1 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-cyber backdrop-blur-md">
                    {selected.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 font-display text-5xl font-bold text-white/15 sm:text-6xl">
                    {String(selectedIndex + 1).padStart(2, '0')}
                  </span>
                  {/* zoom hint */}
                  <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <Maximize2 size={16} />
                  </span>
                </div>
              </div>

              {/* info */}
              <div data-reveal className="flex flex-col justify-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
                    {selected.title}
                  </h3>
                  <span className="rounded-full bg-accent px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                    #{selectedIndex + 1}
                  </span>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed text-body/85 sm:text-base">
                  {selected.desc}
                </p>

                {selected.facts?.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {selected.facts.map((f, i) => (
                      <li
                        key={i}
                        className="rounded-full border border-white/10 bg-surface px-3 py-1.5 text-xs leading-relaxed text-body/80"
                      >
                        <span className="mr-1.5 text-accent">✦</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {selected.gallery?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {selected.gallery.map((src, i) => (
                      <div
                        key={src}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          openLightbox({ src, title: `${selected.title} — ${t('ảnh')} ${i + 1}`, caption: selected.desc })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openLightbox({ src, title: `${selected.title} — ${t('ảnh')} ${i + 1}`, caption: selected.desc })
                          }
                        }}
                        aria-label={`${t('Xem to ảnh')} ${i + 1}`}
                        className="group/card h-24 w-16 shrink-0 cursor-pointer overflow-hidden rounded-card border border-white/10 sm:h-28 sm:w-20"
                      >
                        <img
                          src={src}
                          alt={`${selected.title} — ${t('ảnh')} ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Poster rail — the scrollable Netflix row ── */}
        <section
          data-reveal
          className="-mt-1"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                {t('Những bộ phim ấn tượng nhất')}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-body/50">
                {t('Nhấn vào poster để xem chi tiết · có thể lướt ngang')}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scrollRail(-1)}
                aria-label={t('Lướt sang trái')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-body transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollRail(1)}
                aria-label={t('Lướt sang phải')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-body transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={railRef}
              aria-label={t('Những bộ phim ấn tượng nhất')}
              className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-1"
            >
              {movies.map((m, i) => {
                const active = m.id === selected?.id
                return (
                  <button
                    key={m.id}
                    data-movie={m.id}
                    onClick={() => select(m.id)}
                    aria-pressed={active}
                    aria-label={`${t('Xem chi tiết')} ${m.title}`}
                    className={`group w-40 shrink-0 snap-start text-left transition-transform duration-300 sm:w-44 lg:w-48 ${
                      active ? 'scale-[1.04]' : 'hover:-translate-y-1'
                    }`}
                  >
                    <div
                      className={`relative aspect-[2/3] overflow-hidden rounded-bento border transition-all duration-300 ${
                        active
                          ? 'border-accent shadow-[0_0_0_1px_#2563eb,0_24px_60px_-18px_rgba(37,99,235,0.55)]'
                          : 'border-white/10 hover:border-accent/60'
                      }`}
                    >
                      <img
                        src={m.poster}
                        alt={`${m.title} — poster`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                      <span
                        className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm ${
                          active ? 'bg-accent text-white' : 'bg-black/60 text-accent'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h4 className="font-display text-sm font-semibold leading-tight text-white">
                          {m.title}
                        </h4>
                        <p className="mt-0.5 truncate text-[11px] text-white/60">{m.tag}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-space to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-space to-transparent" />
          </div>
        </section>

        {/* ── Personal archive: Kinh điển điện ảnh + Âm nhạc + Góc bếp ──
            Replaces the tall vertical classics cards: every original review
            still exists — it opens in the morphing dialog on poster click. */}
        {classics.length > 0 && <ArchiveSection films={classics} />}

        {/* ── Sports — Compact Bento Mosaic ── */}
        {sportsPhotos.length > 0 && (
          <section className="flex flex-col gap-5">
            <GroupHeading title={sports.title || t('Thể thao & Năng động')} sub={sports.sub} />
            <SportsMosaic sports={sports} openLightbox={openLightbox} />
          </section>
        )}
      </div>

      {/* fullscreen viewer for any clicked photo — portaled to <body> so the
          slide's overflow-hidden can never clip it */}
      {lightbox && createPortal(<Lightbox item={lightbox} onClose={closeLightbox} />, document.body)}
    </SlideSection>
  )
}
