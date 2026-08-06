import { useState } from 'react'
import { Menu, X, ArrowUp } from 'lucide-react'

/**
 * Floating glass header (Style Guide): rgba(5,5,7,0.4) + blur(24px) saturate(180%),
 * sits 24px from the top. Active slide lights up #007AFF with a 2px underline.
 */
export default function Header({ slides, activeIndex, onNavigate, onScrollTop }) {
  const [open, setOpen] = useState(false)

  const go = (i) => {
    setOpen(false)
    onNavigate(i)
  }

  return (
    <>
      <header className="fixed inset-x-4 top-6 z-50 sm:inset-x-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-bento border border-white/10 bg-space/40 px-4 py-3 shadow-card backdrop-blur-2xl saturate-200 sm:px-6">
          {/* Brand */}
          <button
            onClick={onScrollTop}
            className="group flex items-center gap-3 text-left"
            aria-label="Về đầu trang"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-card bg-accent font-display text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110">
              AT
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-wide text-white sm:block">
              ANH THÔNG
            </span>
          </button>

          {/* Desktop scrollspy nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng slide">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                className={`relative rounded-full px-3 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
                  i === activeIndex
                    ? 'text-accent'
                    : 'text-body/60 hover:text-white'
                }`}
              >
                {s.num}
                <span
                  className={`absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent transition-all duration-300 ${
                    i === activeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <span className="hidden font-display text-[11px] uppercase tracking-[0.2em] text-body/50 sm:block">
              {String(slides[activeIndex]?.num ?? '01')} / {slides.length}
            </span>
            <button
              className="hidden h-9 w-9 items-center justify-center rounded-card border border-white/10 text-body transition-all duration-300 hover:border-accent/60 hover:text-accent md:flex"
              onClick={onScrollTop}
              aria-label="Về đầu trang"
            >
              <ArrowUp size={16} />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-card border border-white/10 text-white lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
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
          <p className="mb-6 font-display text-[11px] uppercase tracking-[0.2em] text-body/50">
            Site Index
          </p>
          <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                className={`flex items-baseline gap-4 rounded-card px-2 py-2.5 text-left font-display text-2xl font-semibold transition-all duration-300 ${
                  i === activeIndex ? 'text-accent' : 'text-white/80 hover:text-white'
                }`}
              >
                <span className="text-xs text-body/40">{s.num}</span>
                {s.navLabel}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
