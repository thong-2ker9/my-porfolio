import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageProvider'
import './index.css'

// Set as early as possible (module load, before React renders) so the browser
// never restores the previous scroll position on reload. Otherwise the
// preloader can finish over a mid-page slide (e.g. 3-5) and then visibly
// re-scroll up to the top.
if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
