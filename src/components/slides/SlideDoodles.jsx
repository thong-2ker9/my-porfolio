/**
 * SlideDoodles — faint thin-line stickers scattered in the negative space of
 * slides 2–10 (intro + quote slides stay clean). Pure SVG line art, 10–18%
 * opacity, slow gentle float, pointer-events none, z-index 1 so content
 * (z-10) always paints above. Reduced-motion users get static stickers.
 *
 * Themes are keyed by slide id so every slide gets its own set of motifs:
 *  orientation → learning (book · compass · atom · target · pencil · star)
 *  projects    → building (code · gear · rocket · bulb · plane · star)
 *  vision      → looking ahead (eye · target · plane · moon · compass · star)
 *  anime       → cinema (clapper · film · ticket · music · star) — faint white
 *  movies      → cinema too, but softer blue so it reads as part of the film slide
 *  science-math→ scrapbook (atom · pencil · trophy · bulb · star) warm gold
 *  influences  → people (heart · chat · trophy · gamepad · star)
 *  contact     → reach out (mail · phone · pin · chat · plane · heart)
 */
const GLYPHS = {
  book: (
    <>
      <path d="M12 5.5c-1.8-1.4-4.5-1.8-7-1.2v14c2.5-.6 5.2-.2 7 1.2 1.8-1.4 4.5-1.8 7-1.2v-14c-2.5-.6-5.2-.2-7 1.2z" />
      <path d="M12 5.5v14" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.2" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  star: <path d="M12 2.5l2.1 6.9 7.2.5-5.6 4.6 1.9 7-5.6-4.2-5.6 4.2 1.9-7L2.7 9.9l7.2-.5L12 2.5z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3.5 1 5.5 4 5.5 8 0 3-1.5 6-3.5 8.5H14l-2-2.5-2 2.5H9c-2-2.5-3.5-5.5-3.5-8.5C5.5 7 8.5 4 12 3z" />
      <circle cx="12" cy="10.5" r="1.8" />
      <path d="M9 19.5l1.5-2.5M15 19.5l-1.5-2.5" />
    </>
  ),
  code: <path d="M8.5 6.5L4 12l4.5 5.5M15.5 6.5L20 12l-4.5 5.5M13.2 4.5L10.8 19.5" />,
  clapper: (
    <>
      <path d="M3.5 9l4-4.5 5.5 2L21 3.5 20 11H3.5V9z" />
      <path d="M3.5 11v8a1.5 1.5 0 001.5 1.5h14A1.5 1.5 0 0020.5 19v-8" />
    </>
  ),
  film: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="M3.5 9h17M3.5 15h17M7.5 5v4M12 5v4M16.5 5v4M7.5 15v4M12 15v4M16.5 15v4" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.5 7.5h17v2a1.8 1.8 0 000 5v2h-17v-2a1.8 1.8 0 000-5v-2z" />
      <path d="M13 7.5v9" />
    </>
  ),
  heart: (
    <path d="M12 20.5S4 15.5 4 9.7C4 6.9 6.2 5 8.6 5c1.5 0 2.6.7 3.4 1.9C12.8 5.7 13.9 5 15.4 5c2.4 0 4.6 1.9 4.6 4.7 0 5.8-8 10.8-8 10.8z" />
  ),
  chat: (
    <>
      <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H10l-4 3.5v-3.5H6.5A2.5 2.5 0 014 13.5v-7z" />
      <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v6a4 4 0 01-8 0V4z" />
      <path d="M8 5H5.5a2.5 2.5 0 002.5 3.5M16 5h2.5a2.5 2.5 0 01-2.5 3.5" />
      <path d="M10 14.5h4M10 17.5h4M12 14.5V21M9 21h6" />
    </>
  ),
  gamepad: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="5" />
      <path d="M7.5 10.5v4M5.5 12.5h4" />
      <path d="M15.5 11.5h.01M17.5 13.5h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      <path d="M4.5 7.5L12 13l7.5-5.5" />
    </>
  ),
  phone: (
    <>
      <path d="M7 3.5h10a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 19V5A1.5 1.5 0 017 3.5z" />
      <path d="M10.5 17.5h3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a5.5 5.5 0 00-3.2 10c.9.6 1.2 1.2 1.2 2h4c0-.8.3-1.4 1.2-2A5.5 5.5 0 0012 3z" />
    </>
  ),
  plane: (
    <>
      <path d="M2.5 12L21 3.5 14.5 21l-3-7-9-2z" />
      <path d="M11.5 14l4.5-4.5" />
    </>
  ),
  moon: <path d="M20 13.5A8.5 8.5 0 0110.5 4 8.5 8.5 0 1020 13.5z" />,
  music: (
    <>
      <path d="M9 18V5.5l10-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
}

/** Per-slide sticker sets: [glyph, left%, top%, size, rotation, opacity, dur, delay] */
const THEMES = {
  orientation: [
    ['book', 4, 15, 46, -8, 0.14, 17, -3],
    ['compass', 3, 60, 36, 10, 0.13, 15, -8],
    ['pencil', 8, 86, 34, -14, 0.14, 19, -12],
    ['atom', 92, 13, 42, 0, 0.13, 18, -5],
    ['target', 94, 52, 34, 8, 0.12, 16, -10],
    ['star', 90, 85, 30, 12, 0.15, 20, -2],
  ],
  projects: [
    ['code', 4, 14, 44, -6, 0.14, 17, -4],
    ['gear', 3, 58, 40, 8, 0.13, 19, -9],
    ['rocket', 7, 87, 40, -10, 0.14, 16, -13],
    ['bulb', 92, 12, 42, 6, 0.13, 18, -6],
    ['plane', 94, 50, 38, -8, 0.12, 20, -11],
    ['star', 90, 84, 30, 10, 0.15, 15, -2],
  ],
  vision: [
    ['eye', 4, 14, 44, -6, 0.14, 17, -4],
    ['compass', 3, 58, 38, 10, 0.13, 18, -9],
    ['plane', 8, 87, 38, -10, 0.12, 16, -12],
    ['target', 92, 12, 40, 0, 0.13, 17, -5],
    ['moon', 94, 52, 40, 8, 0.12, 20, -10],
    ['star', 90, 85, 30, 12, 0.15, 19, -3],
  ],
  anime: [
    ['clapper', 4, 12, 44, -8, 0.1, 18, -4],
    ['film', 93, 18, 40, 6, 0.09, 20, -9],
    ['ticket', 5, 84, 40, -6, 0.1, 17, -12],
    ['music', 93, 82, 40, 8, 0.09, 19, -6],
    ['star', 48, 8, 28, 10, 0.12, 16, -2],
  ],
  movies: [
    ['clapper', 4, 12, 42, -8, 0.12, 18, -4],
    ['ticket', 94, 16, 38, 6, 0.11, 17, -9],
    ['film', 5, 88, 38, -6, 0.1, 19, -12],
    ['star', 93, 87, 28, 10, 0.13, 16, -3],
    ['music', 50, 6, 30, -4, 0.09, 20, -7],
  ],
  'science-math': [
    ['atom', 4, 12, 44, -6, 0.13, 18, -5],
    ['pencil', 93, 10, 38, 8, 0.12, 17, -9],
    ['trophy', 5, 88, 40, -8, 0.13, 19, -12],
    ['bulb', 93, 86, 40, 6, 0.12, 16, -6],
    ['star', 48, 5, 28, 10, 0.14, 20, -2],
  ],
  influences: [
    ['heart', 4, 14, 40, -8, 0.13, 17, -4],
    ['chat', 3, 62, 42, 8, 0.12, 19, -9],
    ['trophy', 8, 87, 38, -6, 0.12, 16, -12],
    ['gamepad', 93, 12, 42, 6, 0.12, 18, -6],
    ['star', 94, 55, 30, 10, 0.14, 20, -11],
    ['heart', 90, 86, 30, -10, 0.11, 15, -2],
  ],
  contact: [
    ['mail', 4, 13, 44, -8, 0.13, 18, -4],
    ['phone', 3, 58, 40, 8, 0.12, 17, -9],
    ['pin', 8, 86, 38, -6, 0.12, 19, -12],
    ['chat', 93, 12, 42, 6, 0.13, 16, -6],
    ['plane', 94, 52, 38, -8, 0.12, 20, -10],
    ['heart', 90, 85, 30, 10, 0.14, 15, -3],
  ],
}

const TONES = {
  orientation: 'rgba(120, 155, 220, 0.9)',
  projects: 'rgba(120, 155, 220, 0.9)',
  vision: 'rgba(120, 155, 220, 0.9)',
  anime: 'rgba(205, 216, 235, 0.9)',
  movies: 'rgba(140, 165, 205, 0.9)',
  'science-math': 'rgba(216, 182, 110, 0.9)',
  influences: 'rgba(140, 165, 205, 0.9)',
  contact: 'rgba(120, 155, 220, 0.9)',
}

function Doodle({ glyph, left, top, size, rot, o, dur, delay, tone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={tone}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="doodle"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: `${top}%`,
        opacity: o,
        '--d-dur': `${dur}s`,
        '--d-delay': `${delay}s`,
        '--d-rot': `${rot}deg`,
      }}
    >
      {GLYPHS[glyph]}
    </svg>
  )
}

export default function SlideDoodles({ theme }) {
  const set = THEMES[theme]
  if (!set) return null
  const tone = TONES[theme] || 'rgba(140, 165, 205, 0.9)'
  return (
    <div aria-hidden className="slide-doodles">
      {set.map((d, i) => (
        <Doodle key={i} glyph={d[0]} left={d[1]} top={d[2]} size={d[3]} rot={d[4]} o={d[5]} dur={d[6]} delay={d[7]} tone={tone} />
      ))}
    </div>
  )
}
