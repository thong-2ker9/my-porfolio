import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import content from './data/contentData.json'
import Header from './components/Header'
import HeroSlide from './components/slides/HeroSlide'
import BentoSlide from './components/slides/BentoSlide'
import SplitSlide from './components/slides/SplitSlide'
import ScrapbookSlide from './components/slides/ScrapbookSlide'
import HeroQuoteSlide from './components/slides/HeroQuoteSlide'
import HeroContactSlide from './components/slides/HeroContactSlide'
import AnimeSlide from './components/slides/AnimeSlide'
import MoviesSlide from './components/slides/MoviesSlide'
import InfluencesSlide from './components/slides/InfluencesSlide'
import Preloader from './components/Preloader'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const LAYOUTS = {
  hero: HeroSlide,
  bento: BentoSlide,
  split: SplitSlide,
  scrapbook: ScrapbookSlide,
  'hero-quote': HeroQuoteSlide,
  'hero-contact': HeroContactSlide,
  anime: AnimeSlide,
  movies: MoviesSlide,
  influences: InfluencesSlide,
}

export default function App() {
  const rootRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [introDone, setIntroDone] = useState(false)
  const slides = content.slides

  const components = useMemo(
    () => slides.map((s) => ({ slide: s, Comp: LAYOUTS[s.layout] ?? SplitSlide })),
    [slides],
  )

  // ── GSAP orchestration ─────────────────────────────────────────
  // Reveals + scrollspy only initialize after the preloader intro finishes,
  // so the first slide animates in as the curtain lifts.
  useEffect(() => {
    if (!introDone) return
    const ctx = gsap.context(() => {
      // 1) Entrance reveals: one ScrollTrigger per section, staggering its
      //    [data-reveal] children. `transition: none` during the tween prevents
      //    the .panel CSS border/transform transitions from fighting GSAP (the
      //    rubber-band lag); clearProps restores hover styles afterwards.
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.utils.toArray('section[data-slide]').forEach((section) => {
        const items = gsap.utils.toArray('[data-reveal]', section)
        if (!items.length) return
        // Respect prefers-reduced-motion: no scroll animations, show content.
        if (reducedMotion) {
          gsap.set(items, { opacity: 1, y: 0 })
          return
        }
        gsap.fromTo(
          items,
          { y: 40, opacity: 0, transition: 'none' },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity,transition',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              once: true,
            },
          },
        )
      })

      // 2) Scrollspy: track which slide is in view → active nav index
      slides.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: `#slide-${s.id}`,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActiveIndex(i)
          },
        })
      })
    }, rootRef)

    // allow scrollspy + reveals to settle after fonts/images
    const t = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => {
      clearTimeout(t)
      ctx.revert()
    }
  }, [slides, introDone])

  // smooth-scroll to any slide by index
  const navigateTo = (index) => {
    const target = document.getElementById(`slide-${slides[index].id}`)
    if (!target) return
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: 1.1,
      ease: 'power3.inOut',
    })
  }

  const scrollTop = () => {
    gsap.to(window, { scrollTo: { y: 0, autoKill: true }, duration: 1, ease: 'power3.inOut' })
  }

  return (
    <div ref={rootRef} className="relative bg-space text-body">
      {!introDone && (
        <Preloader
          onComplete={() => {
            window.scrollTo(0, 0)
            setIntroDone(true)
          }}
        />
      )}

      <Header
        slides={slides}
        activeIndex={activeIndex}
        onNavigate={navigateTo}
        onScrollTop={scrollTop}
      />

      <main>
        {components.map(({ slide, Comp }) => (
          <Comp
            key={slide.id}
            slide={slide}
            meta={content.meta}
            contact={content.contact}
          />
        ))}
      </main>

      {/* footer */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-10">
          <p className="font-display text-sm font-semibold text-white">
            {content.meta.displayName} <span className="text-accent">✦</span> {content.meta.motto}
          </p>
          <p className="text-xs text-body/50">
            © {new Date().getFullYear()} · {content.meta.role}
          </p>
        </div>
      </footer>
    </div>
  )
}
