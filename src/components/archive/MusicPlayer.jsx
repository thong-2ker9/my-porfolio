import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { musicGroups } from '../../data/musicData'
import { useLanguage } from '../../i18n/LanguageProvider'

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Âm nhạc yêu thích — a real <audio> driven player.
 *  Premium layout: hero vinyl (rotates, keeps its angle when paused),
 *  strong title/artist hierarchy, refined seek bar, prev · repeat ·
 *  play · next · volume controls, slim category filters and a compact
 *  mini music library. Artist tabs slide a pill. */
export default function MusicPlayer() {
  const { t } = useLanguage()
  const audioRef = useRef(null)
  const pillRef = useRef(null)
  const tabRefs = useRef([])
  const tabScrollRef = useRef(null)
  const glowRef = useRef(null)
  const magRef = useRef(null)
  const repeatRef = useRef(false)
  const stateRef = useRef({ groupIdx: 0, trackIdx: 0 })

  const [tabOverflow, setTabOverflow] = useState(false)

  const [groupIdx, setGroupIdx] = useState(0)
  const [trackIdx, setTrackIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const group = musicGroups[groupIdx] || musicGroups[0]
  const track = group.tracks[trackIdx] || group.tracks[0]

  repeatRef.current = repeat
  stateRef.current = { groupIdx, trackIdx }

  // Sliding pill follows the active tab
  useEffect(() => {
    const el = tabRefs.current[groupIdx]
    const pill = pillRef.current
    if (!el || !pill) return
    pill.style.left = `${el.offsetLeft}px`
    pill.style.width = `${el.offsetWidth}px`
  }, [groupIdx])

  // Horizontal scroll for the artist tabs: native wheel-to-scroll plus
  // a flag so chevron buttons only appear when the row actually overflows.
  useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    const check = () => setTabOverflow(el.scrollWidth > el.clientWidth + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth + 2) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  const scrollTabs = (dir) => {
    const el = tabScrollRef.current
    if (el) el.scrollBy({ left: dir * 130, behavior: 'smooth' })
  }

  // Audio lifecycle: metadata, progress, end-of-track behavior
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onMeta = () => setDuration(a.duration)
    const onTime = () => setTime(a.currentTime)
    const onEnd = () => {
      const { groupIdx: gi, trackIdx: ti } = stateRef.current
      const g = musicGroups[gi] || musicGroups[0]
      const last = ti >= g.tracks.length - 1
      if (repeatRef.current) {
        a.currentTime = 0
        setTime(0)
        a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      } else if (!last) {
        setTrackIdx(ti + 1)
        setPlaying(true)
      } else {
        setPlaying(false)
        setTime(0)
        a.currentTime = 0
      }
    }
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnd)
    }
  }, [track.src])

  // Volume level → audio element
  useEffect(() => {
    const a = audioRef.current
    if (a) a.volume = volume
  }, [volume])

  // Changing track → load; keep playing state if it was already playing.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.load()
    if (playing) a.play().catch(() => setPlaying(false))
    setTime(0)
    setDuration(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.src])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }

  const seek = (e) => {
    const a = audioRef.current
    if (!a || !Number.isFinite(a.duration)) return
    const pct = Number(e.target.value)
    a.currentTime = (pct / 100) * a.duration
    setTime(a.currentTime)
  }

  const onVolume = (e) => {
    const v = Number(e.target.value) / 100
    setVolume(v)
    if (v > 0) setMuted(false)
  }

  const pickTrack = (i) => {
    setTrackIdx(i)
    setPlaying(true) // autoplay from a user gesture
  }

  const prev = () => {
    const n = group.tracks.length
    pickTrack(trackIdx > 0 ? trackIdx - 1 : n - 1)
  }

  const next = () => {
    const n = group.tracks.length
    pickTrack(trackIdx < n - 1 ? trackIdx + 1 : 0)
  }

  const onPanelMove = (e) => {
    const el = glowRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const onMagMove = (e) => {
    const el = magRef.current
    if (!el || reduceMotion()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    el.style.transform = `translate(${(x * 5).toFixed(2)}px, ${(y * 5).toFixed(2)}px)`
  }

  const onMagLeave = () => {
    const el = magRef.current
    if (el) el.style.transform = ''
  }

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0
  const initial = (track.title || '♪').trim().charAt(0).toUpperCase()
  const volIcon =
    muted || volume === 0 ? (
      <VolumeX size={15} />
    ) : volume < 0.5 ? (
      <Volume1 size={15} />
    ) : (
      <Volume2 size={15} />
    )

  return (
    <section
      onMouseMove={onPanelMove}
      className="archive-panel relative flex flex-col overflow-hidden p-5 sm:p-6"
    >
      {/* ambient: slow light trail around the border + vinyl-groove motif
          echoing the spinning disc (both pointer-events none) */}
      <span className="panel-trail" aria-hidden />
      <div className="music-grooves" aria-hidden />

      {/* soft spotlight following the cursor */}
      <div ref={glowRef} aria-hidden className="music-spotlight" />

      <audio ref={audioRef} src={track.src} preload="metadata" muted={muted} />

      {/* header */}
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <span className="catalog-eyebrow">{t('TRACK · ĐANG NGHE')}</span>
          <h3 className="mt-1.5 font-serif text-xl font-medium text-ink sm:text-2xl">
            {t('Âm nhạc yêu thích')}
          </h3>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? t('Bật tiếng') : t('Tắt tiếng')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-ink-muted transition-all duration-300 hover:border-[#D99A4E]/50 hover:text-[#D99A4E]"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* now playing — hero vinyl + track info */}
      <div className="relative mt-4 flex items-center gap-5 sm:gap-6">
        <div
          className="vinyl vinyl-hero spinning"
          style={{ animationPlayState: playing ? 'running' : 'paused' }}
        >
          {track.cover ? (
            <div className="vinyl-art">
              <img src={track.cover} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="vinyl-letter" aria-hidden>
              {initial}
            </div>
          )}
          <span className="vinyl-glow" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            key={track.src}
            className="music-title truncate font-serif text-[22px] font-medium leading-snug text-ink sm:text-[26px]"
          >
            {track.title}
          </p>
          <p className="mt-1 truncate text-sm text-ink-muted">{group.name}</p>

          <div className="mt-3 flex items-center gap-2.5">
            <div className={`eq ${playing ? 'playing' : ''}`} aria-hidden>
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              {playing ? t('Đang phát') : t('Tạm dừng')}
            </span>
          </div>
        </div>
      </div>

      {/* progress */}
      <div className="relative mt-3.5 flex items-center gap-3">
        <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-ink-muted">
          {fmt(time)}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={pct}
          onChange={seek}
          aria-label={t('Tiến trình bài hát')}
          className="play-range"
          style={{ '--fill': `${pct}%` }}
        />
        <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-ink-muted">
          {fmt(duration)}
        </span>
      </div>

      {/* playback controls */}
      <div className="relative mt-3.5 flex items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={prev}
          aria-label={t('Bài trước')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all duration-200 hover:scale-105 hover:border-white/25 hover:text-ink active:scale-95 sm:h-11 sm:w-11"
        >
          <SkipBack size={17} />
        </button>

        <button
          onClick={() => setRepeat((r) => !r)}
          aria-label={t('Lặp lại bài hát')}
          aria-pressed={repeat}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 sm:h-11 sm:w-11 ${
            repeat
              ? 'border-[#D99A4E]/50 bg-[#D99A4E]/10 text-[#D99A4E]'
              : 'border-white/10 text-ink-muted hover:border-white/25 hover:text-ink'
          }`}
        >
          <Repeat size={16} />
          {repeat && (
            <span
              aria-hidden
              className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#D99A4E]"
            />
          )}
        </button>

        {/* primary play / pause */}
        <span
          ref={magRef}
          onMouseMove={onMagMove}
          onMouseLeave={onMagLeave}
          className="mag"
        >
          <button
            onClick={togglePlay}
            aria-label={playing ? t('Tạm dừng') : t('Phát')}
            className="play-btn flex h-12 w-12 items-center justify-center rounded-full border border-[#D99A4E]/60 bg-[#D99A4E] text-black shadow-[0_10px_28px_-8px_rgba(217,154,78,0.45)] sm:h-14 sm:w-14"
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
        </span>

        <button
          onClick={next}
          aria-label={t('Bài sau')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all duration-200 hover:scale-105 hover:border-white/25 hover:text-ink active:scale-95 sm:h-11 sm:w-11"
        >
          <SkipForward size={17} />
        </button>

        {/* volume */}
        <div className="music-volume relative flex items-center">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? t('Bật tiếng') : t('Tắt tiếng')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all duration-200 hover:border-white/25 hover:text-ink sm:h-11 sm:w-11"
          >
            {volIcon}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(volume * 100)}
            onChange={onVolume}
            aria-label={t('Âm lượng')}
            className="music-vol-slider"
            style={{ '--fill': `${Math.round(volume * 100)}%` }}
          />
        </div>
      </div>

      {/* artist tabs — slim sliding pill, scrollable when they overflow */}
      <div className="relative mt-4 flex items-center gap-0.5">
        <button
          onClick={() => scrollTabs(-1)}
          aria-label={t('Xem các nghệ sĩ trước')}
          tabIndex={tabOverflow ? 0 : -1}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all duration-200 hover:border-white/25 hover:text-ink ${
            tabOverflow ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <ChevronLeft size={14} />
        </button>
        <div
          ref={tabScrollRef}
          className="no-scrollbar -mx-1 flex flex-1 gap-1 overflow-x-auto px-1 pb-1"
        >
          <div className="relative flex shrink-0 gap-1">
            <span
              ref={pillRef}
              aria-hidden
              className="absolute bottom-1 top-1 rounded-full border border-[#D99A4E]/40 bg-[#D99A4E]/10 transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            />
            {musicGroups.map((g, i) => (
              <button
                key={g.id}
                ref={(el) => (tabRefs.current[i] = el)}
                onClick={() => {
                  setGroupIdx(i)
                  setTrackIdx(0)
                }}
                aria-pressed={i === groupIdx}
                className={`relative z-10 shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  i === groupIdx ? 'text-[#D99A4E]' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => scrollTabs(1)}
          aria-label={t('Xem các nghệ sĩ tiếp theo')}
          tabIndex={tabOverflow ? 0 : -1}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all duration-200 hover:border-white/25 hover:text-ink ${
            tabOverflow ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* mini music library — every track of the active artist, compact rows.
          Height is capped so long lists scroll inside the panel instead of
          stretching the whole slide; the thin scrollbar only shows when
          needed (rows stay compact, no track is hidden). */}
      <ul className="music-list relative mt-3 max-h-[200px] space-y-1 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[216px]">
        {group.tracks.map((t, i) => {
          const active = i === trackIdx
          return (
            <li
              key={t.src}
              className="music-row"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <button
                onClick={() => pickTrack(i)}
                aria-pressed={active}
                className={`group flex w-full items-center gap-2.5 rounded-lg border px-2 py-1 text-left transition-all duration-300 ${
                  active
                    ? 'border-[#D99A4E]/40 bg-[#D99A4E]/10'
                    : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/12 bg-[#0e0e11]">
                  {t.cover ? (
                    <img src={t.cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[#17171b] font-mono text-[10px] text-[#D99A4E]">
                      {(t.title || '♪').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55">
                      <span
                        className={`eq eq-sm ${playing ? 'playing' : ''}`}
                        aria-hidden
                      >
                        <span />
                        <span />
                        <span />
                      </span>
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-xs font-medium transition-colors duration-300 ${
                      active ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="block truncate text-[10px] text-ink-muted/80">
                    {group.name}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
