import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { SlideSection, SlideHeader, Highlights, Body } from './helpers'

/** Fullscreen photo viewer — opened by clicking any image on the slide. */
function Lightbox({ item, onClose }) {
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
        aria-label="Đóng ảnh"
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
    <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
      <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
      {sub && <span className="text-[11px] uppercase tracking-[0.18em] text-body/50">{sub}</span>}
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
  const movies = slide.movies || []
  const classics = slide.classics || []
  const sports = slide.sports || {}
  const sportsPhotos = sports.photos || []

  const [selectedId, setSelectedId] = useState(movies[0]?.id ?? null)
  const [userPicked, setUserPicked] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [lightbox, setLightbox] = useState(null) // { src, title, caption }
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

  // Auto-rotate the hero every 6s, like a Netflix row — paused while hovering
  // or while reduced motion is preferred. After the user picks a movie it
  // resumes rotating once they've been idle for a while.
  useEffect(() => {
    // Pause rotation while the fullscreen viewer is open too.
    if (hovering || reducedMotion || lightbox || movies.length < 2) return
    const t = setInterval(() => {
      if (userPicked && Date.now() - lastInteractRef.current < 12000) return
      setSelectedId((prev) => {
        const i = movies.findIndex((m) => m.id === prev)
        return movies[(i + 1) % movies.length].id
      })
    }, 6000)
    return () => clearInterval(t)
  }, [userPicked, hovering, reducedMotion, lightbox, movies])

  // Keep the selected poster inside the visible rail (only scroll when needed).
  useEffect(() => {
    const rail = railRef.current
    if (!rail || !selected) return
    const card = rail.querySelector(`[data-movie="${selected.id}"]`)
    if (!card) return
    const r = rail.getBoundingClientRect()
    const c = card.getBoundingClientRect()
    if (c.left < r.left || c.right > r.right) {
      card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })
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
    <SlideSection id={slide.id} num={slide.num} className="py-24 sm:py-28">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 sm:px-10">
        {/* ── Header ── */}
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SlideHeader
            num={slide.num}
            primaryTitle={slide.primaryTitle}
            secondaryTitle={slide.secondaryTitle}
          />
          <div className="flex flex-col gap-6">
            <Body paragraphs={slide.body} />
            <Highlights items={slide.highlights} />
          </div>
        </div>

        {/* ── Hero detail panel — shows the selected movie ── */}
        {selected && (
          <section
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            aria-label={`Đang xem: ${selected.title}`}
            aria-live="polite"
          >
            <div key={selected.id} className="grid animate-fadeUp gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
              {/* big poster */}
              <div
                data-reveal
                onClick={() => openLightbox({ src: selected.poster, title: selected.title, caption: selected.tag })}
                className="panel group relative cursor-pointer overflow-hidden p-0"
                role="button"
                tabIndex={0}
                aria-label={`Xem to ${selected.title}`}
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
                  <span className="absolute left-4 top-4 rounded-full border border-accent/50 bg-black/60 px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-cyber backdrop-blur-md">
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
              <div data-reveal className="flex flex-col justify-center gap-5">
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
                          openLightbox({ src, title: `${selected.title} — ảnh ${i + 1}`, caption: selected.desc })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openLightbox({ src, title: `${selected.title} — ảnh ${i + 1}`, caption: selected.desc })
                          }
                        }}
                        aria-label={`Xem to ảnh ${i + 1} của ${selected.title}`}
                        className="group/card h-24 w-16 shrink-0 cursor-pointer overflow-hidden rounded-card border border-white/10 sm:h-28 sm:w-20"
                      >
                        <img
                          src={src}
                          alt={`${selected.title} — ảnh ${i + 1}`}
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
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                Những bộ phim ấn tượng nhất
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-body/50">
                Nhấn vào poster để xem chi tiết · có thể lướt ngang
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scrollRail(-1)}
                aria-label="Lướt sang trái"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-body transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollRail(1)}
                aria-label="Lướt sang phải"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-body transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={railRef}
              aria-label="những bộ phim ấn tượng nhất"
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
                    aria-label={`Xem chi tiết ${m.title}`}
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
                        className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm ${
                          active ? 'bg-accent text-white' : 'bg-black/60 text-accent'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h4 className="font-display text-sm font-semibold leading-tight text-white">
                          {m.title}
                        </h4>
                        <p className="mt-0.5 truncate text-[10px] text-white/60">{m.tag}</p>
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

        {/* ── Classics: Matrix · Godfather ── */}
        {classics.length > 0 && (
          <section className="flex flex-col gap-6">
            <GroupHeading title="Kinh điển điện ảnh" sub="Những bộ phim nước ngoài đáng nhớ" />
            <div className="grid gap-5 sm:grid-cols-2">
              {classics.map((c) => (
                <figure
                  data-reveal
                  key={c.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox({ src: c.image, title: c.title, caption: c.desc })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLightbox({ src: c.image, title: c.title, caption: c.desc })
                    }
                  }}
                  aria-label={`Xem to ${c.title}`}
                  className="panel group relative cursor-pointer overflow-hidden p-0"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                      <h4 className="font-display text-lg font-bold text-white sm:text-xl">
                        {c.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">{c.desc}</p>
                    </figcaption>
                    {/* zoom hint */}
                    <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                      <Maximize2 size={16} />
                    </span>
                  </div>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ── Sports — merged from the old Thể thao slide ── */}
        {sportsPhotos.length > 0 && (
          <section className="flex flex-col gap-6">
            <GroupHeading title={sports.title || 'Thể thao & Năng động'} sub={sports.sub} />
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
              {sportsPhotos.map((p, i) => (
                <figure
                  data-reveal
                  key={p.src}
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox({ src: p.src, title: p.title, caption: p.caption })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLightbox({ src: p.src, title: p.title, caption: p.caption })
                    }
                  }}
                  aria-label={`Xem to ${p.title}`}
                  className={`panel group relative cursor-pointer overflow-hidden p-0 ${
                    i % 2 === 1 ? 'lg:translate-y-6' : ''
                  }`}
                >
                  <div className="aspect-[4/5] w-full overflow-hidden bg-surface">
                    <img
                      src={p.src}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="font-display text-[10px] font-bold text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="mt-0.5 font-display text-sm font-semibold text-white sm:text-base">
                      {p.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/65">{p.caption}</p>
                  </div>
                  {/* zoom hint */}
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <Maximize2 size={14} />
                  </span>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* fullscreen viewer for any clicked photo — portaled to <body> so the
          slide's overflow-hidden can never clip it */}
      {lightbox && createPortal(<Lightbox item={lightbox} onClose={closeLightbox} />, document.body)}
    </SlideSection>
  )
}
