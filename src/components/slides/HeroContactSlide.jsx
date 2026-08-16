import { ExternalLink, Sparkles } from 'lucide-react'
import { SlideSection, Body } from './helpers'
import SlideDoodles from './SlideDoodles'
import { useLanguage } from '../../i18n/LanguageProvider'

// Real app-logos (Simple Icons, brand colors) for every contact channel.
const AVATARS = {
  Gmail: '/images/social/gmail.svg',
  LinkedIn: '/images/social/linkedin.svg',
  Facebook: '/images/social/facebook.svg',
  Instagram: '/images/social/instagram.svg',
  GitHub: '/images/social/github.svg',
  Locket: '/images/social/locket.svg',
  Discord: '/images/social/discord.svg',
}

function Avatar({ c }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-card bg-white/10">
      <img
        src={AVATARS[c.channel]}
        alt={`${c.channel} logo`}
        loading="lazy"
        className="h-6 w-6 object-contain"
      />
    </span>
  )
}

function ContactCard({ c }) {
  // Gmail is display-only — just the address, no link to click.
  if (c.channel === 'Gmail') {
    return (
      <div
        data-reveal
        className={`panel flex items-center justify-between gap-4 p-5 ${
          c.highlight ? '!border-accent/30' : 'opacity-80'
        }`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Avatar c={c} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-display text-sm font-semibold text-white">
              {c.channel}
              {c.highlight && (
                <span className="tag !px-2 !py-0.5 !text-[10px]">{c.note}</span>
              )}
            </p>
            <p className="truncate text-xs text-body/60">{c.value}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <a
      href={c.href}
      target="_blank"
      rel="noreferrer"
      data-reveal
      className={`panel group flex items-center justify-between gap-4 p-5 ${
        c.highlight ? '!border-accent/30' : 'opacity-80'
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <Avatar c={c} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-white">
            {c.channel}
            {c.highlight && (
              <span className="tag !px-2 !py-0.5 !text-[9px]">{c.note}</span>
            )}
          </p>
          <p className="truncate text-xs text-body/60">{c.value}</p>
        </div>
      </div>
      <ExternalLink
        size={16}
        className="shrink-0 text-body/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </a>
  )
}

export default function HeroContactSlide({ slide, contact }) {
  const { t } = useLanguage()
  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center py-20">

      {/* faint contact stickers in the empty corners */}
      <SlideDoodles theme={slide.id} />

      {/* giant CONNECT backdrop */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] font-bold leading-none text-white/[0.03]"
        style={{ letterSpacing: '-0.04em' }}
      >
        CONNECT
      </span>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <div className="flex flex-col items-start gap-6">
          <span data-reveal className="tag">
            ✦ {slide.num} — {slide.secondaryTitle}
          </span>
          <h2 data-reveal className="giant-text text-balance text-6xl sm:text-7xl">
            {slide.primaryTitle}
          </h2>
          <Body paragraphs={slide.body} />
          <div data-reveal className="flex items-center gap-3 rounded-card border border-white/10 bg-surface/50 px-4 py-3">
            <Sparkles size={16} className="text-accent" />
            <p className="text-xs text-body/70">
              {t('Gmail & LinkedIn được tô đậm — kênh kết nối chính của Anh Thông.')}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {contact.map((c) => (
            <ContactCard key={c.channel} c={c} />
          ))}
        </div>
      </div>
    </SlideSection>
  )
}
