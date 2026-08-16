import { SlideSection, Body } from './helpers'

export default function HeroQuoteSlide({ slide }) {
  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center">
      {/* ambient dark background */}
      <img
        src={slide.backgroundImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-space via-space/60 to-space" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,58,0.07),transparent_62%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center sm:px-10">
        <span data-reveal className="slide-label">
          {slide.num} — {slide.secondaryTitle}
        </span>
        <h2 data-reveal className="giant-text text-balance text-4xl sm:text-5xl lg:text-6xl">
          {slide.primaryTitle}
        </h2>

        <div data-reveal className="flex flex-col items-center gap-6">
          <span className="font-display text-6xl text-accent/70">“</span>
          <p className="max-w-3xl font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
            {slide.quote}
          </p>
        </div>

        <div className="max-w-3xl text-left">
          <Body paragraphs={slide.body} className="!text-base !text-body/75" />
        </div>
      </div>
    </SlideSection>
  )
}
