/**
 * Generates src/i18n/translations.js — a per-language dictionary mapping every
 * Vietnamese source string to its translation. Uses the free Google Translate
 * unofficial endpoint (client=gtx) with batching + retries.
 *
 *   node scripts/generate-translations.mjs
 *
 * Output is a plain JSON object so it works as an ES module:
 *   export default { en: { 'Xin chào': 'Hello', ... }, ... }
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Google Translate language codes, in the exact order shown in the user's list.
const LANGS = [
  ['en', 'ENGLISH'],
  ['id', 'INDONESIA'],
  ['ms', 'MALAY'],
  ['ja', 'JAPANESE'],
  ['ko', 'KOREAN'],
  ['zh-CN', 'CHINESE'],
  ['ar', 'ARABIC'],
  ['es', 'SPANISH'],
  ['fr', 'FRENCH'],
  ['de', 'GERMAN'],
  ['pt', 'PORTUGUESE'],
  ['hi', 'HINDI'],
  ['th', 'THAI'],
  ['vi', 'VIETNAMESE'],
  ['it', 'ITALIAN'],
  ['nl', 'DUTCH'],
  ['ru', 'RUSSIAN'],
  ['tr', 'TURKISH'],
]

/* ── Hardcoded UI strings (labels, aria-labels, headings) that live in the
      JSX components, not in contentData.json. Must match the literals wrapped
      with t() in the code EXACTLY. ─────────────────────────────────── */
const UI_STRINGS = [
  // App nav groups
  'Giới thiệu', 'Sở thích', 'Thành tích', 'Dự án', 'Ảnh hưởng', 'Liên hệ',
  // Header
  'Về đầu trang', 'Đóng menu', 'Mở menu', 'Điều hướng di động', 'Site Index',
  'Đổi ngôn ngữ', 'Ngôn ngữ',
  // Preloader
  'Portfolio',
  // HeroSlide
  'Tò mò', 'Công nghệ', 'Lập trình', 'AI', 'Kỹ thuật', 'Toán học (cái này hên xui)',
  'Semi-pro Vibecoder', 'Khám phá về tuii', 'Cuộn xuống',
  // BentoSlide
  'Xem mã nguồn', 'Xem repo', 'Triết lý',
  'Steve Jobs: "Thiết kế không chỉ là giao diện. Thiết kế là cách nó hoạt động."',
  // AnimeSlide
  'Xem anime trước', 'Xem anime tiếp theo', 'Xem',
  // MoviesSlide
  'Đóng ảnh', 'Những bộ phim ấn tượng nhất',
  'Nhấn vào poster để xem chi tiết · có thể lướt ngang',
  'Lướt sang trái', 'Lướt sang phải', 'Xem chi tiết', 'Xem to', 'Xem to ảnh',
  'ảnh', 'Đang xem:', 'Thể thao & Năng động',
  // InfluencesSlide / SplitSlide
  'Những người truyền cảm hứng', 'Các tựa Game đã từng chơi',
  'Hiện chưa có liên kết mạng xã hội.', 'Sở thích & đam mê của Anh Thông — ảnh',
  // HeroContactSlide
  'Gmail & LinkedIn được tô đậm — kênh kết nối chính của Anh Thông.',
  // ArchiveSection
  'BỘ SƯU TẬP CÁ NHÂN',
  // CinemaRail
  'FILM · những tác phẩm', 'Kinh điển điện ảnh',
  'Nhấn vào poster để đọc trọn cảm nhận · có thể lướt ngang',
  'Những bộ phim kinh điển', 'Đọc cảm nhận về', 'áp phích', 'ĐANG XEM TIẾP',
  // MusicPlayer
  'TRACK · ĐANG NGHE', 'Âm nhạc yêu thích', 'Bật tiếng', 'Tắt tiếng',
  'Đang phát', 'Tạm dừng', 'Tiến trình bài hát', 'Bài trước',
  'Lặp lại bài hát', 'Phát', 'Bài sau', 'Âm lượng',
  'Xem các nghệ sĩ trước', 'Xem các nghệ sĩ tiếp theo',
  // CookingCarousel
  'DISH · Sở thích phát minh những món độck đáok 🗣️🗣️',
  'Nấu ăn     (let himm cookk🗣️🔥🔥🔥)',
  'Món trước', 'Món tiếp theo', 'Các món ăn',
  'Món 01', 'Món 02', 'Món 03', 'Món 04', 'Món 05', 'Món 06',
  'Món 07', 'Món 08', 'Món 09', 'Món 10', 'Món 11',
  // MorphingDialog
  'cảm nhận', 'Yêu thích nhất', 'Năm trong bộ sưu tập của mình: ',
]

/* ── Content strings from contentData.json ─────────────────────────── */
const isSkippable = (s) => {
  const v = s.trim()
  if (v.length < 1) return true
  if (/[/@]/.test(v)) return true // paths, URLs, emails, handles
  if (/^(https?:|mailto:|www\.)/i.test(v)) return true
  if (/^[\d.,%\s-]+$/.test(v)) return true // pure numbers
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return true // hex colors
  if (/^[0-9a-zA-Z_.\-+/\s]+$/.test(v)) return true // ASCII-only tokens
  return false
}

const collectContent = () => {
  const raw = fs.readFileSync(path.join(root, 'src/data/contentData.json'), 'utf8')
  const data = JSON.parse(raw)
  const out = new Set()

  const walk = (node, pathKeys = []) => {
    if (typeof node === 'string') {
      if (isSkippable(node)) return
      // Proper nouns that must never be translated:
      if (
        (pathKeys.includes('influencers') && pathKeys[pathKeys.length - 1] === 'name') ||
        (pathKeys[0] === 'meta' && ['name', 'displayName', 'nickname'].includes(pathKeys[pathKeys.length - 1]))
      ) {
        return
      }
      out.add(node.trim())
      return
    }
    if (Array.isArray(node)) {
      node.forEach((v) => walk(v, pathKeys))
      return
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, [...pathKeys, k])
    }
  }

  walk(data)
  return out
}

/* ── Google Translate (unofficial, free) ───────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function translateBatch(strings, tl) {
  const q = strings.join('\n')
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&dj=1&q=' +
    encodeURIComponent(q)

  let lastErr
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      const lines = extractLines(json?.sentences || [])
      if (lines.length !== strings.length) {
        throw new Error(`line mismatch: got ${lines.length}, want ${strings.length}`)
      }
      return lines
    } catch (e) {
      lastErr = e
      await sleep(600 * (attempt + 1))
    }
  }
  throw new Error(`batch failed for ${tl}: ${lastErr?.message}`)
}

/**
 * Reconstruct per-line translations from the raw sentence stream.
 * Google is inconsistent across languages:
 *  - English: one sentence per line, each ending with "\n" (long lines may
 *    be split into several sentences WITHOUT a "\n" between them);
 *  - Indonesian: the whole batch comes back as ONE sentence with the lines
 *    separated by internal "\n".
 * The extractor treats "\n" as the single source of truth for line
 * boundaries and carries any dangling fragment into the next segment, so
 * both layouts (and the mixed split case) reconstruct correctly.
 */
function extractLines(sentences) {
  const out = []
  let cur = ''
  for (const s of sentences) {
    cur += s.trans || ''
    const parts = cur.split('\n')
    cur = parts.pop() || ''
    for (const p of parts) out.push(p.trim())
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

async function translateAll(strings, tl) {
  const out = []
  const queue = [...strings]
  while (queue.length) {
    // Greedy batch: up to 30 strings / ~3400 chars per request.
    let batch = []
    let chars = 0
    while (queue.length) {
      const next = queue[0]
      if (batch.length >= 30 || chars + next.length > 3400) break
      batch.push(queue.shift())
      chars += next.length
    }
    try {
      out.push(...(await translateBatch(batch, tl)))
    } catch (e) {
      // Immediate recursion on the failed batch's halves — never re-merge.
      console.warn(`  bisect ${batch.length}-string batch (${tl})…`)
      const half = Math.ceil(batch.length / 2)
      const [a, b] = await Promise.all([
        translateAll(batch.slice(0, half), tl),
        translateAll(batch.slice(half), tl),
      ])
      out.push(...a, ...b)
    }
    await sleep(300)
  }
  return out
}

/* ── Main ──────────────────────────────────────────────────────────── */
async function main() {
  const strings = [...new Set([...collectContent(), ...UI_STRINGS])].sort()
  console.log(`Total strings to translate: ${strings.length}`)
  const chars = strings.reduce((a, s) => a + s.length, 0)
  console.log(`Total chars: ${chars}`)

  const dict = {}
  for (const [code, label] of LANGS) {
    if (code === 'vi') continue // Vietnamese is the source
    process.stdout.write(`Translating ${label} (${code})… `)
    const translations = await translateAll(strings, code)
    const entry = {}
    strings.forEach((s, i) => {
      const tr = (translations[i] || '').trim()
      entry[s] = tr || s
    })
    dict[code] = entry
    console.log(`done (${Object.keys(entry).length} keys)`)
  }

  const file =
    '// Auto-generated by scripts/generate-translations.mjs — do not edit by hand.\n' +
    '// Maps every Vietnamese source string to its translation per language.\n' +
    'export default ' +
    JSON.stringify(dict, null, 1) +
    '\n'
  const outPath = path.join(root, 'src/i18n/translations.js')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, file, 'utf8')
  console.log(`\nWrote ${outPath} (${fs.statSync(outPath).size} bytes)`)

  // Also emit one lazy module per language (the app loads only the active
  // one — see scripts/split-translations.mjs and i18n/LanguageProvider.jsx).
  const perLangDir = path.join(root, 'src/i18n/translations')
  fs.mkdirSync(perLangDir, { recursive: true })
  for (const [code, entries] of Object.entries(dict)) {
    const per = `// Auto-generated by scripts/generate-translations.mjs — do not edit by hand.\n// Vietnamese → ${code} dictionary.\nexport default ${JSON.stringify(entries, null, 1)}\n`
    fs.writeFileSync(path.join(perLangDir, `${code}.js`), per, 'utf8')
  }
  console.log(`Split ${Object.keys(dict).length} languages → ${perLangDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
