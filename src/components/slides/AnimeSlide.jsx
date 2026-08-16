import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SlideSection, SlideHeader } from './helpers'
import GradualBlur from '../GradualBlur'
import SlideDoodles from './SlideDoodles'
import { useLanguage } from '../../i18n/LanguageProvider'

/**
 * Fullscreen anime highlight player.
 * Videos are muted + autoplay while the slide is on screen (IntersectionObserver),
 * pause when scrolled away. Left/right buttons cycle through the anime entries.
 */
export default function AnimeSlide({ slide }) {
  const { t } = useLanguage()
  const items = slide.anime || []
  const [index, setIndex] = useState(0)
  const videoRef = useRef(null)
  const sectionRef = useRef(null)
  const item = items[index]

  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length])

  // Autoplay while the slide is visible; pause when scrolled away.
  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section || typeof IntersectionObserver === 'undefined') return

    let visible = false
    const tryPlay = () => {
      // only start once enough data is buffered, and never fight the user's
      // own pausing — otherwise a slow network leaves the slide stuck black
      if (visible && !document.hidden && video.paused && video.readyState >= 2) {
        video.play().catch(() => {})
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        // pause when the tab is hidden too — the observer can't tell
        if (document.hidden) {
          video.pause()
          return
        }
        if (visible) tryPlay()
        else video.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(section)
    // play() called before enough data is buffered rejects and is never
    // retried on its own — retry once the data actually arrives
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    return () => {
      io.disconnect()
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [index])

  return (
    <SlideSection
      id={slide.id}
      num={slide.num}
      className="flex items-center bg-black"
    >
      {/* Fullscreen video */}
      <div ref={sectionRef} className="absolute inset-0">
        <video
          key={item.video}
          ref={videoRef}
          src={item.video}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
        {/* legibility scrims — bottom edge kept lighter (/70) so the gradual
            blur below actually shows the video dissolving as you scroll. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* faint cinema stickers over the video's dark edges */}
      <SlideDoodles theme={slide.id} />

      {/* Header */}
      <div className="absolute inset-x-0 top-24 z-10 px-6 sm:px-10 lg:top-28">
        <SlideHeader
          num={slide.num}
          primaryTitle={slide.primaryTitle}
          secondaryTitle={slide.secondaryTitle}
        />
      </div>

      {/* Gradual-blur edge (React Bits) — a static scrim like the gradients
          below: the bottom of the frame blurs out, so when you scroll toward
          the movies slide the video looks like it's dissolving. Taller and
          stronger than before so the dissolve is clearly visible. */}
      <GradualBlur
        position="bottom"
        height="10rem"
        strength={4}
        divCount={6}
        curve="bezier"
        zIndex={10}
      />

      {/* Logo + title + intro below the video */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 sm:px-10 sm:pb-16">
        <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-end gap-3">
              {item.logo && (
                <img
                  src={item.logo}
                  alt={`${item.title} logo`}
                  className="h-14 w-auto object-contain drop-shadow-lg sm:h-20"
                />
              )}
              <h3 className="font-display text-2xl font-bold text-white sm:text-4xl">
                {item.title}
              </h3>
            </div>
            <span className="mt-3 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-display text-[11px] font-medium uppercase tracking-[0.16em] text-cyber">
              {item.tag}
            </span>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              {item.desc}
            </p>
          </div>

          {/* progress dots */}
          <div className="flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.video}
                onClick={() => setIndex(i)}
                aria-label={`${t('Xem')} ${it.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-7 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next — both sides */}
      <button
        onClick={prev}
        aria-label={t('Xem anime trước')}
        className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent sm:left-8"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        aria-label={t('Xem anime tiếp theo')}
        className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent sm:right-8"
      >
        <ChevronRight size={22} />
      </button>
    </SlideSection>
  )
}
