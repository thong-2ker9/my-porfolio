import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

// Lazy per-language dictionaries (src/i18n/translations/<code>.js), produced by
// scripts/split-translations.mjs. Vite code-splits these into separate chunks
// so only the ACTIVE language (~45–70 KB) is fetched + parsed — the monolithic
// all-languages file (~870 KB) used to block the main thread at startup, right
// when the preloader intro was running.
const dictModules = import.meta.glob('./translations/*.js')

/** Languages offered in the header dropdown (Google Translate codes). */
export const LANGS = [
  { code: 'en', name: 'ENGLISH' },
  { code: 'vi', name: 'VIETNAMESE' },
  { code: 'id', name: 'INDONESIA' },
  { code: 'ms', name: 'MALAY' },
  { code: 'ja', name: 'JAPANESE' },
  { code: 'ko', name: 'KOREAN' },
  { code: 'zh-CN', name: 'CHINESE' },
  { code: 'ar', name: 'ARABIC' },
  { code: 'es', name: 'SPANISH' },
  { code: 'fr', name: 'FRENCH' },
  { code: 'de', name: 'GERMAN' },
  { code: 'pt', name: 'PORTUGUESE' },
  { code: 'hi', name: 'HINDI' },
  { code: 'th', name: 'THAI' },
  { code: 'it', name: 'ITALIAN' },
  { code: 'nl', name: 'DUTCH' },
  { code: 'ru', name: 'RUSSIAN' },
  { code: 'tr', name: 'TURKISH' },
]

export const langName = (code) => LANGS.find((l) => l.code === code)?.name || code

const LanguageContext = createContext(null)

/**
 * Global language state. `t(str)` translates a Vietnamese string into the
 * active language (falling back to the original when no entry exists).
 *
 * The active dictionary is loaded lazily on first use of a language and
 * cached afterwards. Vietnamese needs no dictionary at all (source strings
 * ARE Vietnamese), so `dict` stays null and `t` is a pure identity pass —
 * zero cost on the default path.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('vi')
  const [dict, setDict] = useState(null)
  const cacheRef = useRef({})

  const setLang = useCallback((code) => {
    setLangState(code)
    if (code === 'vi') {
      setDict(null)
      return
    }
    if (cacheRef.current[code]) {
      setDict(cacheRef.current[code])
      return
    }
    // Load just this language's chunk; `t` keeps falling back to the
    // Vietnamese source until it arrives, so the switch is seamless.
    dictModules[`./translations/${code}.js`]?.().then((mod) => {
      cacheRef.current[code] = mod.default
      setDict(mod.default)
    })
  }, [])

  const t = useCallback(
    (str, vars) => {
      const key = (str ?? '').trim()
      let out = dict?.[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(`{${k}}`, v)
        }
      }
      return out
    },
    [dict],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}

/** Recursively map every string in a data tree through `t` (deep copy). */
export function translateDeep(obj, t) {
  if (typeof obj === 'string') return t(obj)
  if (Array.isArray(obj)) return obj.map((v) => translateDeep(v, t))
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const k of Object.keys(obj)) out[k] = translateDeep(obj[k], t)
    return out
  }
  return obj
}
