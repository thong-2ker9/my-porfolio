import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project at https://thong-2ker9.github.io/my-porfolio/
// so every asset must live under that base path.
const BASE = '/my-porfolio/'

// The app hardcodes absolute asset paths like '/images/...', '/media/...',
// '/assets/...' and '/music/...' in source. Vite's `base` option only rewrites
// the URLs it generates itself (index.html, CSS url(), dynamic imports), so we
// post-process the emitted chunks to prefix those hardcoded paths as well.
function ghPagesAssetPaths() {
  return {
    name: 'gh-pages-asset-paths',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const prefixes = ['/images/', '/media/', '/assets/', '/music/']
      const base = BASE.replace(/\/$/, '')
      // Only prefix paths that start right after a quote or '(' so URLs Vite
      // already rewrote (e.g. <script src="/my-porfolio/assets/...">) are not
      // prefixed twice.
      const patterns = prefixes.map((p) => new RegExp(`(["'(])${p}`, 'g'))
      for (const file of Object.values(bundle)) {
        let code = null
        if (file.type === 'chunk' && typeof file.code === 'string') {
          code = file.code
        } else if (file.type === 'asset' && typeof file.source === 'string') {
          code = file.source
        }
        if (code == null) continue
        for (let i = 0; i < prefixes.length; i++) {
          code = code.replace(patterns[i], `$1${base}${prefixes[i]}`)
        }
        if (file.type === 'chunk') file.code = code
        else file.source = code
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), ghPagesAssetPaths()],
  base: BASE,
  server: {
    port: 5173,
    strictPort: true,
  },
})
