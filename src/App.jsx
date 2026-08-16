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
import GradualBlur from './components/GradualBlur'
import SplashCursor from './components/SplashCursor'
import { useLanguage, translateDeep } from './i18n/LanguageProvider'

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

// Header nav groups: label → the slides it covers. The first slide of each
// group is where clicking it scrolls to (and whose entrance animation replays).
const NAV_GROUPS = [
  { label: 'Giới thiệu', slides: [0, 1] },
  { label: 'Sở thích', slides: [2, 3] },
  { label: 'Thành tích', slides: [4] },
  { label: 'Dự án', slides: [5] },
  { label: 'Ảnh hưởng', slides: [6, 7, 8] },
  { label: 'Liên hệ', slides: [9] },
]

const groupIndexOf = (slideIndex) => NAV_GROUPS.findIndex((g) => g.slides.includes(slideIndex))

// SplashCursor fluid effect runs on every slide except 02, 03, 05
// (0-indexed: 1, 2, 4) — dense bento / fullscreen video / scrapbook stay clean.
const SPLASH_SLIDES = [0, 3, 5, 6, 7, 8, 9]

// Referentially stable style for the movies-transition blur: App drives its
// opacity imperatively (see the scroll effect), so the props must never change
// identity or React.memo re-renders it on every App render and resets the
// imperative value back to 0.
const MOVIES_BLUR_STYLE = {
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 120ms linear',
}

export default function App() {
  const rootRef = useRef(null)
  const [activeGroup, setActiveGroup] = useState(0)
  const [activeSlide, setActiveSlide] = useState(0)
  const [introDone, setIntroDone] = useState(false)
  const [introStarted, setIntroStarted] = useState(false)
  const [heroReplaySignal, setHeroReplaySignal] = useState(0)
  const navigatingRef = useRef(false)
  const navTimeout = useRef(null)
  const revealTriggers = useRef(new Map())
  const moviesSlideRef = useRef(null)
  // The movies-transition blur overlay. Its opacity is driven straight from
  // the scroll handler (below) via this ref — NOT React state — so scrolling
  // never re-renders the whole app tree.
  const moviesBlurRef = useRef(null)

  // ── i18n ────────────────────────────────────────────────────────
  // Deep-translate the whole content tree (slides + meta + contact) for the
  // active language. Components keep reading the same shapes, so nothing
  // else in the app needs to know a language switch happened. Song titles
  // live in musicData.js (outside this tree) and intentionally stay as-is.
  const { lang, t } = useLanguage()
  const slides = useMemo(() => translateDeep(content.slides, t), [lang, t])
  const meta = useMemo(() => translateDeep(content.meta, t), [lang, t])
  const contact = useMemo(() => translateDeep(content.contact, t), [lang, t])

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((g) => ({
        label: t(g.label),
        startIndex: g.slides[0],
        range:
          g.slides.length === 1
            ? slides[g.slides[0]].num
            : `${slides[g.slides[0]].num}–${slides[g.slides[g.slides.length - 1]].num}`,
      })),
    [slides, t],
  )

  const components = useMemo(
    () => slides.map((s) => ({ slide: s, Comp: LAYOUTS[s.layout] ?? SplitSlide })),
    [slides],
  )

  // Blur the full viewport only while the movies slide is entering from below.
  // The progress is eased so the transition feels like a soft visual handoff.
  // Progress is written directly to the overlay's DOM style — the old version
  // called setState on EVERY scroll event, forcing React to re-render all 10
  // slides (plus Header + SplashCursor) up to 100×/s while scrolling.
  useEffect(() => {
    const section = moviesSlideRef.current
    const el = moviesBlurRef.current
    if (!section || !el || typeof window === 'undefined') return

    const updateTransition = () => {
      const rect = section.getBoundingClientRect()
      const range = Math.max(window.innerHeight, 1)
      const proximity = Math.min(1, Math.max(0, 1 - Math.abs(rect.top) / range))
      const eased = proximity < 0.5 ? 2 * proximity * proximity : 1 - Math.pow(-2 * proximity + 2, 2) / 2
      el.style.opacity = eased
    }

    updateTransition()
    window.addEventListener('scroll', updateTransition, { passive: true })
    window.addEventListener('resize', updateTransition)
    return () => {
      window.removeEventListener('scroll', updateTransition)
      window.removeEventListener('resize', updateTransition)
    }
  }, [introStarted])

  // ── GSAP orchestration ─────────────────────────────────────────
  // Reveals + scrollspy initialize only once the curtain has FULLY lifted
  // (introDone, not introStarted) — creating ~20 ScrollTriggers forces layout
  // reads at the exact moment the hero + header are animating in, which
  // stuttered the end of the intro on slower machines. The triggers key off
  // stable slide ids (never recreated on language change) — content reflows
  // are handled by a ScrollTrigger.refresh() below instead.
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
        const tween = gsap.fromTo(
          items,
          { y: 40, opacity: 0, transition: 'none' },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity,transition',
            paused: true,
          },
        )
        // Keep the trigger so header-nav clicks can kill it (preventing a
        // mid-scroll fire) and replay the reveal on arrival.
        revealTriggers.current.set(
          section,
          ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            once: true,
            onEnter: () => tween.play(),
          }),
        )
      })

      // 2) Scrollspy: track which slide is in view → active nav group
      slides.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: `#slide-${s.id}`,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            // Ignore updates while a header-nav scroll runs — the pill keeps
            // its click target instead of flickering through sections.
            if (navigatingRef.current) return
            if (self.isActive) {
              setActiveSlide(i)
              setActiveGroup(groupIndexOf(i))
            }
          },
        })
      })
    }, rootRef)

    // Re-measure after fonts/images settle (and again on window load). Done
    // well after the curtain exit so the refresh can't hitch the intro.
    const t = setTimeout(() => ScrollTrigger.refresh(), 1200)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      clearTimeout(t)
      window.removeEventListener('load', onLoad)
      ctx.revert()
    }
  }, [introDone])

  // Translated content can reflow section heights, so re-measure all
  // ScrollTrigger positions after a language switch.
  useEffect(() => {
    if (typeof window === 'undefined' || !introStarted) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang, introStarted])

  // Instant jump to top — bypasses the CSS `scroll-behavior: smooth` so the
  // intro never visibly re-scrolls up through mid-page slides.
  const scrollTopInstant = () => {
    if (typeof window === 'undefined') return
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  // Once the preloader unmounts (overflow restored), pin the page to the top
  // on the next frame — covers any late browser scroll-restoration so the
  // first visible slide is always slide 1, right after the curtain lifts.
  useEffect(() => {
    if (!introStarted) return
    scrollTopInstant()
    const id = requestAnimationFrame(scrollTopInstant)
    return () => cancelAnimationFrame(id)
  }, [introStarted])

  // Kill a section's natural reveal trigger (called before a nav jump so it
  // can't fire mid-scroll and fight the replay on arrival).
  const killReveal = (section) => {
    const st = revealTriggers.current.get(section)
    if (st) {
      st.kill()
      revealTriggers.current.delete(section)
    }
  }

  // Replay a section's entrance animation — header-nav clicks always animate
  // on arrival, never delayed (no scroll threshold, no extra timer).
  const playReveal = (section) => {
    if (!section) return
    const items = gsap.utils.toArray('[data-reveal]', section)
    if (!items.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0, clearProps: 'transform,opacity,transition' })
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
      },
    )
  }

  // Smooth-scroll to a nav group's first slide
  const navigateTo = (groupIndex) => {
    const slideIndex = NAV_GROUPS[groupIndex].slides[0]
    const target = document.getElementById(`slide-${slides[slideIndex].id}`)
    if (!target) return
    killReveal(target)
    clearTimeout(navTimeout.current)
    navigatingRef.current = true
    setActiveGroup(groupIndex)
    setActiveSlide(slideIndex)
    // Safety net: never leave scrollspy suppressed, whatever happens to the tween.
    navTimeout.current = setTimeout(() => {
      navigatingRef.current = false
    }, 1600)
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: 1.1,
      ease: 'power3.inOut',
      onComplete: () => {
        clearTimeout(navTimeout.current)
        navigatingRef.current = false
        // Slide 1 has its own intro sequence — ask HeroSlide to replay it.
        if (slideIndex === 0) setHeroReplaySignal((s) => s + 1)
        else playReveal(target)
      },
      onInterrupt: () => {
        clearTimeout(navTimeout.current)
        navigatingRef.current = false
      },
    })
  }

  const scrollTop = () => {
    gsap.to(window, { scrollTo: { y: 0, autoKill: true }, duration: 1, ease: 'power3.inOut' })
  }

  return (
    <div ref={rootRef} className="relative bg-space text-body">
      {!introDone && (
        <Preloader
          onStartReveal={() => setIntroStarted(true)}
          onComplete={() => {
            scrollTopInstant()
            setIntroDone(true)
          }}
        />
      )}

      <Header
        groups={groups}
        activeGroup={activeGroup}
        activeSlide={activeSlide}
        totalSlides={slides.length}
        onNavigate={navigateTo}
        onScrollTop={scrollTop}
        introDone={introStarted}
      />

      <main>
        {components.map(({ slide, Comp }) => (
          <div key={slide.id} ref={slide.id === 'movies' ? moviesSlideRef : undefined}>
            <Comp
              slide={slide}
              meta={meta}
              contact={contact}
              introDone={introStarted}
              replaySignal={slide.id === 'intro' ? heroReplaySignal : 0}
            />
          </div>
        ))}
      </main>

      <GradualBlur
        ref={moviesBlurRef}
        position="bottom"
        target="page"
        height="100vh"
        strength={3.2}
        divCount={8}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={55}
        style={MOVIES_BLUR_STYLE}
      />

      {/* Fluid splash cursor — only while viewing slides 05/06/09/10 */}
      {SPLASH_SLIDES.includes(activeSlide) && <SplashCursor />}

      {/* footer */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-10">
          <p className="font-display text-sm font-semibold text-white">
            {meta.displayName} <span className="text-accent">✦</span> {meta.motto}
          </p>
          <p className="text-xs text-body/50">
            © {new Date().getFullYear()} · {meta.role}
          </p>
        </div>
      </footer>
    </div>
  )
}
