import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageProvider'

/** Full review dialog — the "morphing" moment of the cinema rail.
 *  Thumbnail (poster) and modal share the same layoutId concept via a
 *  scale/fade pop; Esc closes, focus returns to the opener. */
export default function MorphingDialog({ film, index, onClose }) {
  const { t } = useLanguage()
  const closeRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    openerRef.current = document.activeElement
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus?.()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      openerRef.current?.focus?.()
    }
  }, [onClose])

  const year = film.tag?.match(/\d{4}/)?.[0] || ''

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${film.title} — ${t('cảm nhận')}`}
    >
      <div
        className="modal-card relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#131316] shadow-[0_40px_120px_-24px_rgba(0,0,0,0.9)] sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label={t('Đóng')}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-ink backdrop-blur-sm transition-all duration-300 hover:rotate-90 hover:border-[#D99A4E] hover:text-[#D99A4E]"
        >
          <X size={18} />
        </button>

        {/* poster side */}
        <div className="relative shrink-0 sm:w-[42%]">
          <div className="relative aspect-[3/4] h-full w-full overflow-hidden sm:aspect-auto">
            <img
              src={film.image}
              alt={`${film.title} — ${t('áp phích')}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 sm:bg-gradient-to-r sm:from-transparent sm:to-[#131316]" />
            {film.fav && (
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[#D99A4E]/50 bg-black/70 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#D99A4E] backdrop-blur-sm">
                ★ {t('Yêu thích nhất')}
              </span>
            )}
          </div>
        </div>

        {/* review side */}
        <div className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto p-6 sm:p-8">
          <span className="catalog-eyebrow">FILM № {String(index + 1).padStart(2, '0')}</span>
          <h3 className="font-serif text-2xl font-medium leading-tight text-ink sm:text-4xl">
            {film.title}
          </h3>
          {film.tag && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              {film.tag}
            </p>
          )}
          <p className="text-sm leading-relaxed text-ink/80 sm:text-[15px]">{film.desc}</p>
          {year && (
            <p className="mt-1 text-xs text-ink-muted">
              {t('Năm trong bộ sưu tập của mình: ')}<span className="text-[#D99A4E]">{year}</span>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
