/* Scans public/music/<artist>/ and emits src/data/musicData.js
 * with real track lists + sibling cover art. Run: node scripts/gen-music-data.cjs
 * Then you can hand-edit src/data/musicData.js (titles, artists, covers). */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'public', 'music')
const OUT = path.join(__dirname, '..', 'src', 'data', 'musicData.js')

// Display name for each folder. "một số bài nhạc khác…" becomes a "Khác" tab.
const ARTIST_NAME = (folder) => {
  const SPECIAL = {
    Mck: 'MCK',
    Wn: 'Wn',
    'bruno mars': 'Bruno Mars',
    'lil liem': 'Lil Liem',
    'nhạc trung': 'Nhạc Trung',
    'Sơn tùng': 'Sơn Tùng',
  }
  if (/khác/.test(folder)) return 'Khác'
  if (SPECIAL[folder]) return SPECIAL[folder]
  return folder
    .split(/[\s-]+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const EXT = /\.(mp3|png|webp|jpe?g)$/i
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')

// Strip YouTube-style noise from downloaded filenames.
const cleanTitle = (file) => {
  let t = file.replace(/\.mp3$/i, '')
  t = t
    .replace(/\[[^\]]*\]/g, ' ') // [videoId] junk
    .replace(/\([^)]*(lyrics|lyric|lofi|official|music video|mv)[^)]*\)/gi, ' ')
    .replace(/\s*(Official Music Video|MV|Lyrics|Lyric Video|Lofi)\s*/gi, ' ')
    .replace(/[_\u00B7]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return t
}

const groups = []
for (const folder of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, folder)
  if (!fs.statSync(dir).isDirectory()) continue
  const files = fs.readdirSync(dir).sort()
  const tracks = []
  for (const f of files) {
    if (!/\.mp3$/i.test(f)) continue
    // find a sibling cover: same normalized base name, image ext
    const base = norm(f.replace(/\.mp3$/i, ''))
    const cover = files.find((g) => /\.(png|webp|jpe?g)$/i.test(g) && norm(g.replace(EXT, '')) === base)
    tracks.push({
      title: cleanTitle(f),
      src: `/music/${encodeURI(folder)}/${encodeURI(f)}`,
      cover: cover ? `/music/${encodeURI(folder)}/${encodeURI(cover)}` : null,
    })
  }
  if (tracks.length) groups.push({ id: folder.replace(/\s+/g, '-'), name: ARTIST_NAME(folder), tracks })
}

const out = `// Auto-generated from public/music/ — edit freely (titles, artists, covers).
// Regenerate with: node scripts/gen-music-data.cjs
export const musicGroups = ${JSON.stringify(groups, null, 2)}
`
fs.writeFileSync(OUT, out, 'utf8')
console.log(`wrote ${OUT} — ${groups.length} groups, ${groups.reduce((n, g) => n + g.tracks.length, 0)} tracks`)
