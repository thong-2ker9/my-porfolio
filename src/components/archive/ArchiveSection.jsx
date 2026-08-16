import CinemaRail from './CinemaRail'
import MusicPlayer from './MusicPlayer'
import CookingCarousel from './CookingCarousel'
import { Motes, Sparkle } from './Ambient'
import { useLanguage } from '../../i18n/LanguageProvider'
import './archive.css'

/** BỘ SƯU TẬP CÁ NHÂN — one compact section (~1–1.6 viewport) holding:
 *  Row 1: Kinh điển điện ảnh (poster rail) · Âm nhạc yêu thích (player)
 *  Row 2: Góc bếp (skewed carousel)
 *  All original film reviews stay — they live in the morphing dialog. */
export default function ArchiveSection({ films }) {
  const { t } = useLanguage()
  return (
    <section data-reveal className="archive-root archive-grain relative mt-2">
      {/* section eyebrow */}
      <div className="mb-5 flex items-center gap-4">
        <span className="catalog-eyebrow">{t('BỘ SƯU TẬP CÁ NHÂN')}</span>
        <span className="h-px flex-1 bg-white/8" aria-hidden />
      </div>

      {/* Row 1 — cinema (dominant) + music (a touch wider so the player breathes).
          Columns stay equal height (default stretch): the film panel ends with an
          "Đang xem tiếp" card that flex-fills whatever vertical space the taller
          music panel leaves, so there is never dead space below the poster rail.
          Ambient decor lives in the dark negative space: drifting dust motes
          and two sparkle glyphs in the gap between the cards (all pointer-events
          none, z-index 0, so panels paint above). */}
      <div className="relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <Motes tone="rgba(217, 154, 78, 0.9)" count={14} seed={11} />
        <Sparkle className="sparkle-a" delay={0} dx={20} dy={-14} size={20} />
        <Sparkle className="sparkle-b" delay={-7} dx={-16} dy={-20} size={15} />
        <CinemaRail films={films} />
        <MusicPlayer />
      </div>

      {/* Row 2 — cooking, full width */}
      <div className="mt-6 lg:mt-8">
        <CookingCarousel />
      </div>
    </section>
  )
}
