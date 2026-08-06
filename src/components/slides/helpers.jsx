import { ArrowRight } from 'lucide-react'

/** Wraps every slide so GSAP can target it for scrollspy + reveals. */
export function SlideSection({ id, num, children, className = '' }) {
  return (
    <section
      id={`slide-${id}`}
      data-slide={id}
      data-num={num}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
    >
      {children}
    </section>
  )
}

/** Giant editorial title block: label, primary title, secondary title. */
export function SlideHeader({ num, primaryTitle, secondaryTitle, align = 'left' }) {
  const alignCls =
    align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div data-reveal className={`flex flex-col gap-3 ${alignCls}`}>
      <span className="slide-label">
        <span className="text-accent">{num}</span>
        <span className="mx-1.5 text-white/25">—</span> {secondaryTitle}
      </span>
      <h2 className="giant-text text-balance text-4xl sm:text-5xl lg:text-6xl">
        {primaryTitle}
      </h2>
    </div>
  )
}

/** Key highlights as bullet chips. */
export function Highlights({ items }) {
  if (!items?.length) return null
  return (
    <ul data-reveal className="flex flex-col gap-3">
      {items.map((h, i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-body/90">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[10px] text-accent">
            ✦
          </span>
          <span>{h}</span>
        </li>
      ))}
    </ul>
  )
}

/** Body paragraphs. */
export function Body({ paragraphs, className = '' }) {
  return (
    <div data-reveal className={`flex flex-col gap-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-body/80 sm:text-base">
          {p}
        </p>
      ))}
    </div>
  )
}

/** Arrow link used in bento feature cards. `light` renders a dark-on-white variant. */
export function ArrowLink({ href, label, light = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex items-center gap-2 font-display text-sm font-semibold transition-colors ${
        light ? 'text-neutral-800 hover:text-accent' : 'text-body hover:text-accent'
      }`}
    >
      {label}
      <ArrowRight
        size={16}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </a>
  )
}
