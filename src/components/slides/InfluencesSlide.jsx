import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Facebook, Gamepad2, Globe, Users, Youtube } from 'lucide-react'
import { SlideSection, SlideHeader, Highlights, Body } from './helpers'

const HEX6 = /^#[0-9a-f]{6}$/i

function LinkIcon({ name }) {
  if (name === 'youtube') return <Youtube size={14} />
  if (name === 'facebook') return <Facebook size={14} />
  if (name === 'globe') return <Globe size={14} />
  return <ExternalLink size={14} />
}

/**
 * "Con người & Sự ảnh hưởng" — premium two-column layout:
 *  - Left:  title, intro, highlights, influencers panel
 *  - Right: bento photo grid pinned to the top, "Game đã chơi" directly below
 *
 * Monochrome game logos (black on transparent) are re-rendered as crisp brand
 * color marks via CSS mask, so every tile pops against the dark background.
 */
export default function InfluencesSlide({ slide }) {
  const photos = slide.images || []
  const games = slide.games || []
  const influencers = slide.influencers || []
  const [activeName, setActiveName] = useState(influencers[0]?.name ?? null)
  const active = influencers.find((i) => i.name === activeName) || influencers[0]
  const detailRef = useRef(null)

  // Keep the detail panel visible after switching influencers
  useEffect(() => {
    const el = detailRef.current
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeName])

  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center py-24">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-start gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-10">
        {/* ── Left: intro + influencers ── */}
        <div className="flex flex-col gap-8">
          <SlideHeader
            num={slide.num}
            primaryTitle={slide.primaryTitle}
            secondaryTitle={slide.secondaryTitle}
          />
          <Body paragraphs={slide.body} />
          <Highlights items={slide.highlights} />

          <div data-reveal className="panel p-6 shadow-card">
            <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <Users size={14} /> Những người truyền cảm hứng
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {influencers.map((inf) => {
                const isActive = inf.name === active?.name
                return (
                  <button
                    key={inf.name}
                    onClick={() => setActiveName(inf.name)}
                    aria-pressed={isActive}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-accent/60 bg-accent/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-accent/40'
                    }`}
                  >
                    {inf.image ? (
                      <img
                        src={inf.image}
                        alt={inf.name}
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg">
                        {inf.icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-white">{inf.name}</p>
                      <p className="text-[11px] text-body/55">{inf.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detail of the selected influencer */}
            {active && (
              <div
                key={active.name}
                ref={detailRef}
                aria-live="polite"
                className="mt-5 animate-fadeUp border-t border-white/10 pt-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15">
                    {active.image ? (
                      <img src={active.image} alt={active.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/[0.05] text-2xl">
                        {active.icon}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-white">{active.name}</p>
                    <p className="text-xs text-body/60">{active.role}</p>
                  </div>
                </div>
                {active.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-body/80">{active.bio}</p>
                )}
                {active.links?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {active.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-display text-xs font-semibold text-body transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
                      >
                        <LinkIcon name={l.icon} />
                        {l.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs italic text-body/45">Hiện chưa có liên kết mạng xã hội.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: photo grid (top) + games (below) ── */}
        <div className="flex flex-col gap-10">
          {/* Bento photo wall — 2×2 block filling the top-right quarter of the slide */}
          <div data-reveal className="grid grid-cols-2 gap-3 sm:gap-4">
            {photos.map((p, i) => (
              <figure
                key={p.src}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/5"
              >
                <img
                  src={p.src}
                  alt={p.alt || `Sở thích & đam mê của Anh Thông — ảnh ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                />
              </figure>
            ))}
          </div>

          {/* Game đã chơi — glass cards */}
          <div data-reveal className="flex flex-col gap-5">
            <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <Gamepad2 size={14} /> Các tựa Game đã từng chơi
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {games.map((g) => {
                const tint = HEX6.test(g.tint || '') ? g.tint : '#2563eb'
                return (
                  <div
                    key={g.name}
                    title={g.name}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex h-12 w-full items-center justify-center">
                      {g.mono ? (
                        /* Recolor monochrome logo with the brand tint via CSS mask */
                        <div
                          role="img"
                          aria-label={`${g.name} logo`}
                          className="h-10 w-full transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: tint,
                            WebkitMask: `url(${g.logo}) center / contain no-repeat`,
                            mask: `url(${g.logo}) center / contain no-repeat`,
                          }}
                        />
                      ) : g.logo ? (
                        <img
                          src={g.logo}
                          alt={`${g.name} logo`}
                          loading="lazy"
                          className="max-h-12 max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span
                          className="text-center font-display text-sm font-bold leading-tight"
                          style={{ color: tint }}
                        >
                          {g.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-center text-sm font-semibold text-gray-300">{g.name}</p>
                  </div>
                )
              })}
            </div>
            {slide.gamesNote && (
              <p className="text-[11px] italic text-body/45">{slide.gamesNote}</p>
            )}
          </div>
        </div>
      </div>
    </SlideSection>
  )
}
