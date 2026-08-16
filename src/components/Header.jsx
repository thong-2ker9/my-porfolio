import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Github, Instagram, Languages, Linkedin, Menu, X } from 'lucide-react'
import gsap from 'gsap'
import GooeyNav from './GooeyNav'
import { LANGS, langName, useLanguage } from '../i18n/LanguageProvider'

/** Social links (GitHub / LinkedIn / Instagram) shown as brand-colored buttons. */
const SOCIALS = [
  {
    key: 'GitHub',
    href: 'https://github.com/thong-2ker9',
    color: '#c9d1d9',
    Icon: Github,
  },
  {
    key: 'LinkedIn',
    href: 'https://www.linkedin.com/in/anh-thong-van/',
    color: '#0A66C2',
    Icon: Linkedin,
  },
  {
    key: 'Instagram',
    href: 'https://www.instagram.com/anhthong_2009/',
    color: '#E1306C',
    Icon: Instagram,
  },
]

/**
 * Floating glass header (Style Guide): rgba(5,5,7,0.4) + blur(24px) saturate(180%),
 * sits 24px from the top. The desktop nav is the React Bits GooeyNav — the six
 * label groups with a liquid pill + particle burst; the active group lights up.
 * Right cluster: language dropdown + GitHub/LinkedIn/Instagram icon buttons.
 */
export default function Header({
  groups,
  activeGroup,
  onNavigate,
  onScrollTop,
  introDone,
}) {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const headerRef = useRef(null)
  const { lang, setLang, t } = useLanguage()

  const go = (i) => {
    setOpen(false)
    onNavigate(i)
  }

  // Close the language dropdown on Escape.
  useEffect(() => {
    if (!langOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLangOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [langOpen])

  useEffect(() => {
    if (!introDone) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (headerRef.current) gsap.set(headerRef.current, { y: 0 })
      return
    }
    gsap.fromTo(
      headerRef.current,
      { y: -60 },
      {
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        clearProps: 'transform',
      },
    )
  }, [introDone])

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-3 top-4 z-50 sm:inset-x-6 sm:top-6"
        style={{ transform: introDone ? undefined : 'translateY(-80px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-bento border border-white/10 bg-[#0a0a0c]/80 px-4 py-2.5 shadow-card backdrop-blur-2xl saturate-200 sm:px-6 sm:py-3">
          {/* Brand — avatar + name + email (no pill frame) */}
          <button
            onClick={onScrollTop}
            className="group flex items-center gap-2.5 text-left transition-opacity duration-300 hover:opacity-90"
            aria-label={t('Về đầu trang')}
          >
            {/* Avatar with online status dot */}
            <span className="relative shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105">
                AT
              </span>
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#0a0a0c] bg-green-500"
                aria-hidden="true"
              />
            </span>
            {/* Name + email (hidden on very small screens) */}
            <span className="hidden min-w-0 leading-tight sm:block">
              <span className="block truncate font-display text-sm font-semibold tracking-wide text-white">
                ANH THÔNG
              </span>
              <span className="block truncate text-[11px] text-white/45">
                vananhthong2k9@gmail.com
              </span>
            </span>
          </button>

          {/* Desktop GooeyNav (React Bits) */}
          <div className="hidden lg:block">
            <GooeyNav
              items={groups.map((g) => ({ label: g.label, href: '#' }))}
              activeIndex={activeGroup}
              onSelect={go}
              particleCount={8}
              particleDistances={[45, 6]}
              particleR={55}
            />
          </div>

          {/* Right cluster — language dropdown + social buttons + hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ── Language dropdown (ENGLISH + 18 languages) ── */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={t('Đổi ngôn ngữ')}
                className="flex h-10 items-center gap-1.5 rounded-card border border-white/10 bg-white/[0.04] px-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-cyber transition-all duration-300 hover:border-accent/60 hover:bg-accent/10 sm:px-3"
              >
                <Languages size={14} className="text-accent" />
                <span className="hidden md:inline">{langName(lang)}</span>
                <span className="md:hidden">{lang.toUpperCase()}</span>
                <ChevronDown
                  size={12}
                  className={`text-body/50 transition-transform duration-300 ${
                    langOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {langOpen && (
                <>
                  {/* click-away backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                    aria-hidden="true"
                  />
                  <ul
                    role="listbox"
                    aria-label={t('Ngôn ngữ')}
                    className="absolute right-0 top-full z-50 mt-2 max-h-[58vh] w-44 overflow-y-auto rounded-card border border-white/10 bg-[#141417]/95 p-1.5 shadow-card backdrop-blur-xl"
                  >
                    {LANGS.map((l) => {
                      const active = lang === l.code
                      return (
                        <li key={l.code}>
                          <button
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setLang(l.code)
                              setLangOpen(false)
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
                              active
                                ? 'bg-accent text-white'
                                : 'text-body/70 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            {l.name}
                            {active && <Check size={12} className="shrink-0" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>

            {/* ── Social buttons — brand colors, same hover as the header ── */}
            {SOCIALS.map(({ key, href, color, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={key}
                title={key}
                className="flex h-9 w-9 items-center justify-center rounded-card border border-white/10 bg-white/[0.04] transition-all duration-300 hover:scale-105 hover:border-accent/60 hover:bg-accent/10 sm:h-10 sm:w-10"
                style={{ color }}
              >
                <Icon size={16} />
              </a>
            ))}

            <button
              className="flex h-11 w-11 items-center justify-center rounded-card border border-white/10 text-white transition-colors duration-300 hover:border-accent/50 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t('Đóng menu') : t('Mở menu')}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 flex h-full w-[80%] max-w-sm flex-col bg-[#0d0d14] px-8 py-24 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-6 font-display text-xs uppercase tracking-[0.2em] text-body/50">
            {t('Site Index')}
          </p>
          <nav className="flex flex-col gap-1" aria-label={t('Điều hướng di động')}>
            {groups.map((g, i) => (
              <button
                key={g.label}
                onClick={() => go(i)}
                className={`flex items-baseline gap-4 rounded-card px-2 py-2.5 text-left font-display text-2xl font-semibold transition-all duration-300 ${
                  i === activeGroup ? 'text-accent' : 'text-white/80 hover:text-white'
                }`}
              >
                <span className="text-xs text-body/40">{g.range}</span>
                {g.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
