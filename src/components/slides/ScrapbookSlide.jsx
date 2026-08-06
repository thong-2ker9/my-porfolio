import { Cog, BarChart3, Ruler, Pencil, Search, Calculator, Trophy } from 'lucide-react'
import { SlideSection } from './helpers'

/* Tailwind literal classes so arbitrary rotate values are generated */
const ROT = {
  '-4': 'rotate-[-4deg]',
  '-3': 'rotate-[-3deg]',
  3: 'rotate-[3deg]',
}

/* ── Polaroid: white frame only — no captions, no notes ── */
function Polaroid({ src, rotate = 0, className = '', imgClass = '' }) {
  return (
    <div
      className={`transition-transform duration-300 ease-out hover:rotate-0 hover:scale-105 ${ROT[rotate] ?? ''} ${className}`}
    >
      <figure className="bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-hidden bg-neutral-200">
          <img
            src={src}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover ${imgClass}`}
          />
        </div>
      </figure>
    </div>
  )
}

/* ── Line-art safety goggles doodle ── */
function GogglesDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className={className} aria-hidden="true">
      <path d="M8 34 C6 16 22 8 38 14 L40 15" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
      <path d="M112 34 C114 16 98 8 82 14 L80 15" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
      <circle cx="38" cy="34" r="21" stroke="#60A5FA" strokeWidth="4" />
      <circle cx="82" cy="34" r="21" stroke="#60A5FA" strokeWidth="4" />
      <path d="M59 34 L61 34" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 27 C33 23 43 23 46 27" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
      <path d="M74 27 C77 23 87 23 90 27" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ── Tennis racket doodle ── */
function RacketDoodle({ className = '' }) {
  return (
    <svg viewBox="0 0 72 110" fill="none" className={className} aria-hidden="true">
      <ellipse cx="36" cy="30" rx="25" ry="31" stroke="#FACC15" strokeWidth="4" />
      <path d="M36 61 L36 96" stroke="#FACC15" strokeWidth="7" strokeLinecap="round" />
      <path d="M17 14 C12 22 12 38 17 46" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
      <path d="M55 14 C60 22 60 38 55 46" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 30 L60 30" stroke="#FACC15" strokeWidth="2.5" />
      <path d="M15 20 L57 20 M15 40 L57 40" stroke="#FACC15" strokeWidth="2.5" opacity="0.7" />
    </svg>
  )
}

/* ── Blue circular icon bullet (gear) ── */
function GearBullet({ text }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed text-body/90">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
        <Cog size={14} />
      </span>
      <span>{text}</span>
    </li>
  )
}

export default function ScrapbookSlide({ slide }) {
  const s = slide.science
  const m = slide.math
  const aw = slide.awards

  return (
    <SlideSection id={slide.id} num={slide.num} className="bg-space">
      {/* textured board: subtle gray-blue wash + dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(37,99,235,0.08),transparent_60%),radial-gradient(1000px_500px_at_85%_100%,rgba(96,165,250,0.06),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-28 sm:px-10">
        <div className="grid gap-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-x-14 lg:gap-y-24">
          {/* ══ KHOA HỌC KỸ THUẬT (top-left) ══ */}
          <div data-reveal className="relative order-1">
            <GogglesDoodle className="absolute -left-3 -top-9 w-20 rotate-[-12deg] opacity-80 sm:w-24" />

            <p className="inline-flex items-center gap-2.5 rounded-full border border-sky-500/30 bg-[#13243d] px-3.5 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-cyber">
              <span className="rounded-full bg-accent/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {slide.num}
              </span>
              <span className="text-white/40">—</span>
              {s.subtitle}
            </p>

            <h2 className="giant-text mt-4 text-balance text-4xl sm:text-5xl">{s.title}</h2>

            {/* glowing blue brain (user's sticker-3) — demo middle-right */}
            <img
              src="/images/sticker-3.png"
              alt=""
              aria-hidden="true"
              className="absolute -right-2 top-16 w-16 rotate-[8deg] drop-shadow-[0_0_18px_rgba(37,150,255,0.55)] sm:-right-6 sm:w-24"
            />

            <div className="mt-6 flex max-w-xl flex-col gap-4">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-body/80 sm:text-[15px]">
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-7 flex max-w-xl flex-col gap-3.5">
              {s.highlights.map((h) => (
                <GearBullet key={h} text={h} />
              ))}
            </ul>
          </div>

          {/* ══ 3 OVERLAPPING POLAROIDS (top-right) — demo arrangement ══ */}
          <div data-reveal className="relative order-2 mx-auto w-full max-w-md lg:mt-4">
            {/* user's cartoon sticker — floats above the cluster */}
            <img
              src="/images/sticker-1.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-12 right-0 w-16 rotate-[10deg] drop-shadow-lg sm:w-20"
            />
            <div className="relative h-[380px] w-full sm:h-[420px]">
              {/* certificate (left, behind) */}
              <Polaroid
                src={s.photos[0].src}
                rotate={s.photos[0].rotate}
                className="absolute left-0 top-12 z-10 w-[44%]"
                imgClass="aspect-[4/3]"
              />
              {/* medal (right, tall) */}
              <Polaroid
                src={s.photos[2].src}
                rotate={s.photos[2].rotate}
                className="absolute bottom-0 right-0 z-20 w-[38%]"
                imgClass="aspect-[3/4] object-cover object-top"
              />
              {/* group photo (middle, on top) with red "love" scribble */}
              <div className="absolute left-[28%] top-0 z-30 w-[48%]">
                <div className={`transition-transform duration-300 ease-out hover:rotate-0 hover:scale-105 ${ROT[s.photos[1].rotate] ?? ''}`}>
                  <figure className="bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.5)]">
                    <div className="relative overflow-hidden bg-neutral-200">
                      <img
                        src={s.photos[1].src}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 -rotate-12 font-hand text-2xl font-bold text-red-600/90">
                        love ❤️
                      </span>
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Á QUÂN + CLB TOÁN (bottom-left) — demo arrangement ══ */}
          <div data-reveal className="relative order-3">
            {/* purple Á-quân badge + handwritten note */}
            <div className="flex items-start gap-4">
              <div className="flex h-28 w-28 shrink-0 -rotate-6 flex-col items-center justify-center gap-1 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-center shadow-[0_10px_30px_rgba(139,92,246,0.35)] ring-4 ring-white/10">
                <Trophy size={22} className="text-white" />
                <p className="font-display text-lg font-bold leading-none text-white">
                  {aw.badge}
                </p>
              </div>
              <p className="max-w-[220px] rotate-2 pt-3 font-hand text-xl leading-snug text-amber-200/90">
                {aw.badgeNote}
              </p>
            </div>

            {/* dark winners card — text only */}
            <div className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-[#15151b] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <p className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                🏆 {aw.winnersTitle}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-amber-300">
                    Quán quân
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {aw.champion.map((p) => (
                      <li key={p.name} className="text-sm text-body/90">
                        🥇 <span className="font-medium text-white">{p.name}</span>{' '}
                        <span className="text-body/50">· {p.klass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
                    Á quân
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {aw.runnerUp.map((p) => (
                      <li key={p.name} className="text-sm text-body/90">
                        🥈 <span className="font-medium text-white">{p.name}</span>{' '}
                        <span className="text-body/50">· {p.klass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-body/60">
                ✉️ {aw.congrats}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-body/60">📁 {aw.clubNote}</p>
            </div>

            {/* white club card — school header, red title, club photo (math-1), date */}
            <div className="mt-8 w-[300px] max-w-full rotate-[-2deg] bg-white p-3 pb-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out hover:rotate-0 hover:scale-[1.03]">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-800">
                {aw.club.school}
              </p>
              <p className="text-center text-[9px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                {aw.club.dept}
              </p>
              <p className="mt-1.5 text-center font-display text-sm font-extrabold uppercase tracking-wide text-red-600">
                {aw.club.title}
              </p>
              <div className="mt-2 overflow-hidden">
                <img src={aw.club.photo} alt="" loading="lazy" className="h-44 w-full object-cover" />
              </div>
              <p className="mt-2 text-right font-hand text-base text-neutral-600">
                {aw.club.date}
              </p>
            </div>

            {/* tennis racket doodle */}
            <RacketDoodle className="absolute -bottom-14 right-2 w-16 rotate-[24deg] opacity-60" />
          </div>

          {/* ══ VỀ TOÁN HỌC (bottom-right) ══ */}
          <div data-reveal className="relative order-4 lg:mt-10">
            {/* ruler + pencil doodles (yellow) — demo top-right */}
            <div className="absolute -top-10 right-0 hidden items-center gap-2 sm:flex">
              <Ruler
                size={44}
                className="-rotate-45 text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.35)]"
                strokeWidth={2.4}
              />
              <Pencil size={40} className="rotate-[18deg] text-amber-300" strokeWidth={2.4} />
            </div>
            {/* user's sketch sticker near the doodles */}
            <img
              src="/images/sticker-2.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-8 right-24 hidden w-28 -rotate-6 sm:block"
            />

            <p className="flex items-center justify-end gap-3 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-cyber">
              <span className="h-px w-8 bg-accent/60" />
              {m.subtitle}
              <span className="h-px w-8 bg-accent/60" />
            </p>

            <h2 className="giant-text mt-4 text-right text-balance text-4xl sm:text-5xl">
              {m.title}
            </h2>

            {/* blue bar-graph under the heading (demo) */}
            <div className="mt-3 flex justify-end">
              <BarChart3 size={38} strokeWidth={2.2} className="text-cyber/80" />
            </div>

            <div className="mt-6 ml-auto flex max-w-xl flex-col gap-4 text-right">
              {m.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-body/80 sm:text-[15px]">
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-7 ml-auto flex max-w-xl flex-col items-end gap-3.5">
              {m.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 text-right text-sm leading-relaxed text-body/90"
                >
                  <span>{h}</span>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
                    <Cog size={14} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── corner decorations ── */}
        <Search
          size={110}
          strokeWidth={1.2}
          className="absolute bottom-5 left-3 -rotate-[18deg] text-white/10"
        />
        <Calculator
          size={80}
          strokeWidth={1.6}
          className="absolute bottom-2 right-4 rotate-[12deg] text-pink-400/70 drop-shadow-[0_6px_18px_rgba(244,114,182,0.25)]"
        />
      </div>
    </SlideSection>
  )
}
