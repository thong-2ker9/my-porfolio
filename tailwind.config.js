/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Style Guide: 60 / 30 / 10 Color System (UI/UX Pro Max) ─
      colors: {
        space: '#0A0A0C', // Near-black background (60%)
        surface: '#141417', // Panels (30%)
        accent: '#2563EB', // Signal blue — CTA / active (10%)
        cyber: '#60A5FA', // Soft blue — tags / hovers
        body: '#E4E4E9', // body text, never pure white
      },
      // ── Style Guide: Typography ─────────────────────────────────
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // ── Style Guide: UI specs (restrained radii) ────────────────
      borderRadius: {
        bento: '16px', // outer containers / panels
        card: '12px', // inner controls
      },
      boxShadow: {
        // Layer 2: subtle depth for imagery only (no colored glow)
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 16px 48px rgba(0,0,0,0.45)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter2: '-0.02em',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
