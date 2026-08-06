import { Sparkles, Target, Brain } from 'lucide-react'
import { SlideSection, SlideHeader, Highlights, Body, ArrowLink } from './helpers'

function GitHubIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function TechCell({ t }) {
  return (
    <div data-reveal className="panel flex flex-col gap-2.5 p-5">
      <div className="flex items-center gap-2.5">
        {t.logo ? (
          <img
            src={t.logo}
            alt={t.name}
            loading="lazy"
            className="h-6 w-6 shrink-0 object-contain"
          />
        ) : (
          <Sparkles size={18} className="shrink-0 text-accent" />
        )}
        <span className="font-display text-lg font-semibold text-white">{t.name}</span>
      </div>
      <span className="text-xs text-body/55">{t.level}</span>
    </div>
  )
}

function ProjectCell({ p }) {
  return (
    <div data-reveal className="panel group flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{p.icon}</span>
        <span className="tag !text-[10px]">{p.tag}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
      <p className="text-sm leading-relaxed text-body/70">{p.desc}</p>
    </div>
  )
}

function GoalCell({ g, i }) {
  return (
    <div data-reveal className="panel flex items-center gap-4 p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-accent/30 bg-accent/5 font-display text-sm font-bold text-accent">
        {String(i + 1).padStart(2, '0')}
      </span>
      <span className="font-display text-base font-medium text-white/90">{g}</span>
    </div>
  )
}

export default function BentoSlide({ slide }) {
  const isTech = Array.isArray(slide.tech)
  const isProjects = Array.isArray(slide.projects)
  const isGoals = Array.isArray(slide.goals)
  const featureImg = slide.images?.[0]

  return (
    <SlideSection id={slide.id} num={slide.num} className="flex items-center py-24">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
        {/* Left: header + body + highlights */}
        <div className="flex flex-col gap-7">
          <SlideHeader
            num={slide.num}
            primaryTitle={slide.primaryTitle}
            secondaryTitle={slide.secondaryTitle}
          />
          <Body paragraphs={slide.body} />
          <Highlights items={slide.highlights} />

          {/* formula / github extra */}
          {slide.formula && (
            <div data-reveal className="panel flex items-center gap-4 p-5">
              <Brain size={22} className="shrink-0 text-accent" />
              <p className="font-display text-lg font-semibold text-white">{slide.formula}</p>
            </div>
          )}
          {slide.github && (
            <div data-reveal className="panel flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <GitHubIcon size={22} className="shrink-0 text-accent" />
                <div>
                  <p className="font-display text-sm font-semibold text-white">{slide.github.label}</p>
                  <p className="text-xs text-body/55">@{slide.github.handle}</p>
                </div>
              </div>
              <ArrowLink href={slide.github.url} label="Xem repo" />
            </div>
          )}
        </div>

        {/* Right: bento grid */}
        <div className="flex flex-col gap-4">
          {isTech && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {slide.tech.map((t, i) => (
                  <TechCell key={t.name} t={t} i={i} />
                ))}
              </div>
              <div className="panel relative overflow-hidden p-6">
                <Sparkles size={18} className="absolute right-5 top-5 text-accent/50" />
                <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                  Triết lý
                </p>
                <p className="mt-2 font-display text-2xl font-semibold leading-snug text-white">
                  “Steve Jobs: "Thiết kế không chỉ là giao diện. Thiết kế là cách nó hoạt động.”
                </p>
              </div>
            </>
          )}

          {isProjects && (
            <div className="grid gap-4 sm:grid-cols-2">
              {slide.projects.map((p) => (
                <ProjectCell key={p.title} p={p} />
              ))}
              {featureImg && (
                <div data-reveal className="panel relative col-span-full overflow-hidden p-0">
                  <img
                    src={featureImg.src}
                    alt={featureImg.alt}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space/90 to-transparent" />
                  <p className="absolute bottom-4 left-5 right-5 font-display text-sm font-semibold text-white">
                    {featureImg.caption}
                  </p>
                </div>
              )}
            </div>
          )}

          {isGoals && (
            <>
              <div className="panel relative flex flex-col items-center gap-3 overflow-hidden p-8 text-center">
                <Target size={26} className="text-accent" />
                <p className="max-w-lg font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                  {slide.motto ?? ''}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {slide.goals.map((g, i) => (
                  <GoalCell key={g} g={g} i={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </SlideSection>
  )
}
