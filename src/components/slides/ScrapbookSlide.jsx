import { BarChart3, Ruler, Pencil, Search, Calculator, Trophy } from 'lucide-react'
import { SlideSection } from './helpers'

/* Tailwind literal classes so arbitrary rotate values are generated */
const ROT = {
  '-4': 'rotate-[-4deg]',
  2: 'rotate-[2deg]',
  3: 'rotate-[3deg]',
}

/* ── Polaroid: white frame, thick bottom strip (classic polaroid) ── */
function Polaroid({ src, rotate = 0, className = '', imgClass = '' }) {
  return (
    <div
      className={`transition-transform duration-300 ease-out hover:rotate-0 hover:scale-105 ${ROT[rotate] ?? ''} ${className}`}
    >
      <figure className="rounded-[4px] bg-white p-2.5 pb-9 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
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

/* ── Bullet icon: blue-bordered circle with a small dot inside ── */
function BulletDot({ text }) {
  return (
    <li className="flex items-start gap-3 text-left text-sm leading-relaxed text-body/90">
      <span className="relative mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-accent/80">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span>{text}</span>
    </li>
  )
}

/* ── Tennis racket doodle (demo corner decoration) ── */
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
        {/* ══════════ KHỐI A — Khoa học Kỹ thuật (2 cột: text | ảnh) ══════════ */}
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start lg:gap-x-16">
          {/* Cột trái — text */}
          <div data-reveal className="relative">
            {/* tag 05 + sticker-2 (kính bảo hộ) */}
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <img
                src="/images/sticker-2.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none w-10 -rotate-6"
              />
              <p className="inline-flex items-center gap-2.5 rounded-full border border-sky-500/30 bg-[#13243d] px-3.5 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-cyber sm:text-xs">
                <span className="rounded-full bg-accent/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {slide.num}
                </span>
                <span className="text-white/40">—</span>
                {s.subtitle}
              </p>
            </div>

            {/* tiêu đề + sticker-3 (não) sát bên phải chữ */}
            <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="giant-text text-balance text-4xl sm:text-5xl">{s.title}</h2>
              <img
                src="/images/sticker-3.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none w-14 rotate-[8deg] drop-shadow-[0_0_18px_rgba(37,150,255,0.55)] sm:w-[68px]"
              />
            </div>

            <div className="relative z-10 mt-6 flex max-w-xl flex-col gap-4">
              {s.body.map((p, i) => (
                <p key={i} className="text-left text-sm leading-relaxed text-body/80 sm:text-[15px]">
                  {p}
                </p>
              ))}
            </div>

            <ul className="relative z-10 mt-7 flex max-w-xl flex-col gap-3.5">
              {s.highlights.map((h) => (
                <BulletDot key={h} text={h} />
              ))}
            </ul>
          </div>

          {/* Cột phải — cụm 3 polaroid quạt xòe (position theo % trong container riêng) */}
          <div data-reveal className="relative mx-auto w-full max-w-[560px] lg:mt-2">
            {/* sticker-1 (chấm bi màu) — góc trên phải Khối A, ngoài cụm ảnh */}
            <img
              src="/images/sticker-1.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 right-2 z-0 w-16 rotate-[10deg] sm:w-20"
            />
            <div className="relative h-[460px] w-full">
              {s.photos.map((ph, i) => (
                <div
                  key={ph.src}
                  className="absolute"
                  style={{
                    left: ph.pos?.left,
                    top: ph.pos?.top,
                    right: ph.pos?.right,
                    bottom: ph.pos?.bottom,
                    width: ph.pos?.width,
                    zIndex: ph.pos?.z,
                  }}
                >
                  <Polaroid
                    src={ph.src}
                    rotate={ph.rotate}
                    imgClass={i === 0 ? 'aspect-[3/4] object-cover' : 'aspect-[4/3]'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ KHỐI B — Á quân + Về Toán học (2 cột: 45% | 55%) ══════════ */}
        <div className="mt-24 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-x-16">
          {/* Cột trái — badge Á quân + card kết quả + polaroid CLB Toán */}
          <div data-reveal className="relative">
            {/* badge tròn Á quân (tím, ~96px) + chữ viết tay */}
            <div className="flex items-start gap-4">
              <div className="flex h-24 w-24 shrink-0 -rotate-6 flex-col items-center justify-center gap-1 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-center shadow-[0_10px_30px_rgba(139,92,246,0.35)] ring-4 ring-white/10">
                <Trophy size={20} className="text-white" />
                <p className="font-display text-base font-bold leading-none text-white">
                  {aw.badge}
                </p>
              </div>
              <p className="max-w-[220px] rotate-2 pt-3 font-hand text-xl leading-snug text-amber-200/90">
                {aw.badgeNote}
              </p>
            </div>

            {/* 2 polaroid: card CLB Toán (math-1) + poster kết quả Rung Chuông Vàng (math-2) */}
            <div className="relative z-10 mt-8 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rotate-[-2deg] bg-white p-2.5 pb-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out hover:rotate-0 hover:scale-[1.03]">
                <div className="overflow-hidden">
                  <img src={aw.club.photo} alt="" loading="lazy" className="h-48 w-full object-cover" />
                </div>
                <p className="mt-2 text-right font-hand text-base text-neutral-600">
                  {aw.club.date}
                </p>
              </div>
              <Polaroid src={aw.poster} rotate={2} imgClass="aspect-[4/3]" />
            </div>

            {/* vợt tennis — góc trái dưới khối, nền sau, click-through */}
            <RacketDoodle className="pointer-events-none absolute -bottom-12 left-1 z-0 w-16 rotate-[24deg] opacity-60" />
          </div>

          {/* Cột phải — Về Toán học (tag + icon cuối dòng, KHÔNG đè chữ) */}
          <div data-reveal className="relative lg:mt-2">
            {/* tag CẤU TRÚC VÀ LOGIC... + [kính][thước][bút chì] canh phải, cách chữ ≥12px */}
            <p className="relative z-10 flex items-center justify-between gap-3 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-cyber sm:text-xs sm:tracking-[0.22em]">
              <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className="h-px w-6 shrink-0 bg-accent/60 sm:w-8" />
                <span>{m.subtitle}</span>
                <span className="h-px w-6 shrink-0 bg-accent/60 sm:w-8" />
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <img
                  src="/images/sticker-2.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none w-6 -rotate-6 sm:w-8"
                />
                <Ruler size={22} className="pointer-events-none w-[18px] -rotate-45 text-amber-400/80 sm:w-[22px]" strokeWidth={2.2} />
                <Pencil size={20} className="pointer-events-none w-4 rotate-[18deg] text-amber-300/80 sm:w-5" strokeWidth={2.2} />
              </span>
            </p>

            {/* tiêu đề Về Toán học + icon biểu đồ nhỏ bên cạnh */}
            <div className="relative z-10 mt-4 flex items-center gap-4">
              <h2 className="giant-text text-balance text-4xl sm:text-5xl">{m.title}</h2>
              <BarChart3 size={34} strokeWidth={2.2} className="ml-auto shrink-0 text-cyber/80" />
            </div>

            <div className="relative z-10 mt-6 flex max-w-xl flex-col gap-4">
              {m.body.map((p, i) => (
                <p key={i} className="text-left text-sm leading-relaxed text-body/80 sm:text-[15px]">
                  {p}
                </p>
              ))}
            </div>

            <ul className="relative z-10 mt-7 flex max-w-xl flex-col gap-3.5">
              {m.highlights.map((h) => (
                <BulletDot key={h} text={h} />
              ))}
            </ul>
          </div>
        </div>

        {/* ── góc trang trí (click-through, sau nội dung) ── */}
        <Search
          size={110}
          strokeWidth={1.2}
          className="pointer-events-none absolute bottom-5 left-3 -rotate-[18deg] text-white/10"
        />
        <Calculator
          size={80}
          strokeWidth={1.6}
          className="pointer-events-none absolute bottom-2 right-4 rotate-[12deg] text-pink-400/70 drop-shadow-[0_6px_18px_rgba(244,114,182,0.25)]"
        />
      </div>
    </SlideSection>
  )
}
