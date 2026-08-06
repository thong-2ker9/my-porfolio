import { Gamepad2, Users } from 'lucide-react'
import { SlideSection, SlideHeader, Highlights, Body } from './helpers'

export default function SplitSlide({ slide }) {
  const img = slide.images?.[0]
  const flip = slide.flip

  const media = (
    <div data-reveal className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-card">
        <img
          src={img?.src}
          alt={img?.alt}
          loading="lazy"
          className="h-[26rem] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[30rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space/70 to-transparent" />
        {slide.badge && (
          <div className="absolute left-5 top-5 rounded-card border border-white/15 bg-black/60 px-4 py-2.5 backdrop-blur-md">
            <p className="font-display text-2xl font-bold text-white">{slide.badge}</p>
            <p className="text-[11px] text-body/70">{slide.badgeSub}</p>
          </div>
        )}
        {img?.caption && (
          <p className="absolute bottom-5 left-5 right-5 font-display text-sm font-semibold text-white">
            {img.caption}
          </p>
        )}
      </div>
    </div>
  )

  const text = (
    <div className="flex flex-col gap-7">
      <SlideHeader
        num={slide.num}
        primaryTitle={slide.primaryTitle}
        secondaryTitle={slide.secondaryTitle}
      />
      <Body paragraphs={slide.body} />
      <Highlights items={slide.highlights} />

      {slide.influencers && (
        <div data-reveal className="panel p-6">
          <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Users size={14} /> Những người truyền cảm hứng
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {slide.influencers.map((inf) => (
              <div
                key={inf.name}
                className="flex items-center gap-3 rounded-card border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="text-xl">{inf.icon}</span>
                <div>
                  <p className="font-display text-sm font-semibold text-white">{inf.name}</p>
                  <p className="text-[11px] text-body/55">{inf.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.games && (
        <div data-reveal className="panel p-6">
          <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Gamepad2 size={14} /> Các tựa Game đã từng chơi
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {slide.games.map((g) => (
              <span
                key={g}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-body/80 transition-all duration-300 hover:border-accent/50 hover:text-accent"
              >
                {g}
              </span>
            ))}
          </div>
          {slide.gamesNote && (
            <p className="mt-3 text-xs italic text-body/50">{slide.gamesNote}</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center py-24">
      <div
        className={`relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-6 sm:px-10 lg:gap-12 ${
          flip
            ? 'lg:grid-cols-[0.85fr_1.15fr]'
            : 'lg:grid-cols-[1.15fr_0.85fr]'
        }`}
      >
        {flip ? (
          <>
            <div className="order-2 lg:order-1">{media}</div>
            <div className="order-1 lg:order-2">{text}</div>
          </>
        ) : (
          <>
            <div>{text}</div>
            <div>{media}</div>
          </>
        )}
      </div>
    </SlideSection>
  )
}
