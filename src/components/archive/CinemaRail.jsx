import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MorphingDialog from './MorphingDialog'
import { useLanguage } from '../../i18n/LanguageProvider'

/** Kinh điển điện ảnh — horizontal poster rail.
 *  Posters show title + year only; the FULL personal review opens in a
 *  morphing dialog on click, so the section stays ~one row tall. */
export default function CinemaRail({ films }) {
  const { t } = useLanguage()
  const railRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  // last film opened → "Đang xem tiếp" always points at the film after it
  const [lastIndex, setLastIndex] = useState(0)

  const filmsWithYear = useMemo(
    () =>
      films.map((f, i) => ({
        ...f,
        year: f.tag?.match(/\d{4}/)?.[0] || '',
        num: i + 1,
      })),
    [films],
  )

  // classics data has no `id` — key on title
  const active = filmsWithYear.find((f) => f.title === activeId)
  const openIndex = filmsWithYear.findIndex((f) => f.title === activeId)
  const upNextIndex = filmsWithYear.length ? (lastIndex + 1) % filmsWithYear.length : 0
  const upNext = filmsWithYear[upNextIndex]

  const scroll = (dir) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector('[data-poster]')
    const step = card ? card.getBoundingClientRect().width + 16 : 240
    rail.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section className="archive-panel relative flex flex-col overflow-hidden p-5 sm:p-6">
      {/* ambient: slow light trail around the border + faint film-reel outline */}
      <span className="panel-trail" aria-hidden />
      <div className="doodle-reel" aria-hidden>
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.1">
          <circle cx="50" cy="50" r="38" />
          <circle cx="50" cy="50" r="27" />
          <circle cx="50" cy="50" r="6" />
          <path d="M50 23 V 14 M50 77 V 86 M23 50 H 14 M77 50 H 86" />
          <path d="M31 31 L 25 25 M69 31 L 75 25 M31 69 L 25 75 M69 69 L 75 75" />
          <rect x="86" y="48.3" width="4" height="3.4" rx="0.9" />
          <rect x="74.9" y="75.2" width="4" height="3.4" rx="0.9" />
          <rect x="48" y="86.3" width="4" height="3.4" rx="0.9" />
          <rect x="21.1" y="75.2" width="4" height="3.4" rx="0.9" />
          <rect x="10" y="48.3" width="4" height="3.4" rx="0.9" />
          <rect x="21.1" y="21.4" width="4" height="3.4" rx="0.9" />
          <rect x="48" y="10.3" width="4" height="3.4" rx="0.9" />
          <rect x="74.9" y="21.4" width="4" height="3.4" rx="0.9" />
        </svg>
      </div>

      {/* header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="catalog-eyebrow">{t('FILM · những tác phẩm')}</span>
          <h3 className="mt-1.5 font-serif text-xl font-medium text-ink sm:text-2xl">
            {t('Kinh điển điện ảnh')}
          </h3>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label={t('Lướt sang trái')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label={t('Lướt sang phải')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-ink-muted">
        {t('Nhấn vào poster để đọc trọn cảm nhận · có thể lướt ngang')}
      </p>

      {/* poster rail */}
      <div
        ref={railRef}
        aria-label={t('Những bộ phim kinh điển')}
        className="rail-mask no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-1"
      >
        {filmsWithYear.map((f, i) => (
          <button
            key={f.title}
            data-poster
            onClick={() => {
              setActiveId(f.title)
              setLastIndex(i)
            }}
            aria-label={`${t('Đọc cảm nhận về')} ${f.title}`}
            className="poster-card group relative w-40 shrink-0 snap-start text-left sm:w-44"
          >
            {/* soft amber glow behind the hovered poster */}
            <span className="poster-glow" aria-hidden />
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e11]">
              <img
                src={f.image}
                alt={`${f.title} — ${t('áp phích')}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {/* scrim for the caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/25 to-transparent" />
              {/* fav badge — 2 films only, tiny amber ring */}
              {f.fav && (
                <span className="fav-badge absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[10px] text-[#D99A4E] backdrop-blur-sm">
                  ★
                </span>
              )}
              {/* caption: catalog number + title */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <span className="catalog-eyebrow !text-[9px]">
                  FILM № {String(f.num).padStart(2, '0')}
                  {f.year && <span className="ml-1.5 text-ink-muted">· {f.year}</span>}
                </span>
                <h4 className="mt-1 font-serif text-[15px] font-medium leading-snug text-ink">
                  {f.title}
                </h4>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Đang xem tiếp — fills whatever vertical space the taller music panel
          leaves below the rail, so the column never has dead space. The card
          shows the film right after the one you last opened (wraps around). */}
      {upNext && (
        <div className="mt-4 flex min-h-0 flex-1 items-stretch">
          <button
            onClick={() => {
              setActiveId(upNext.title)
              setLastIndex(upNextIndex)
            }}
            aria-label={`${t('Đọc cảm nhận về')} ${upNext.title}`}
            className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0e0e11] px-4 py-3 text-left transition-all duration-300 hover:border-[#D99A4E]/40 hover:bg-white/[0.04]"
          >
            <span className="h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
              <img src={upNext.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="catalog-eyebrow !text-[9px]">
                {t('ĐANG XEM TIẾP')} · FILM № {String(upNext.num).padStart(2, '0')}
              </span>
              <span className="mt-1 block truncate font-serif text-[15px] font-medium leading-snug text-ink">
                {upNext.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] leading-relaxed text-ink-muted">
                {upNext.desc}
              </span>
            </span>
            <ChevronRight
              size={16}
              className="shrink-0 text-ink-muted/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#D99A4E]"
            />
          </button>
        </div>
      )}

      {active && (
        <MorphingDialog film={active} index={openIndex} onClose={() => setActiveId(null)} />
      )}
    </section>
  )
}
