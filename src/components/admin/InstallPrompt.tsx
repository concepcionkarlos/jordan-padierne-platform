'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('jp-install-dismissed')) return

    const ua = window.navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !/(crios|fxios)/i.test(ua)
    setIsIOS(ios)
    if (ios) { setShow(true); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem('jp-install-dismissed', '1')
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="mx-3 mb-3 rounded-xl bg-sky/15 border border-sky/30 p-3">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-sky/20 flex items-center justify-center shrink-0">
          <Download size={15} className="text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold">Install the app</p>
          {isIOS ? (
            <p className="text-navy-300 text-xs mt-0.5 leading-snug">
              Tap <Share size={10} className="inline" /> then &ldquo;Add to Home Screen&rdquo;
            </p>
          ) : (
            <p className="text-navy-300 text-xs mt-0.5 leading-snug">One tap to your home screen.</p>
          )}
          {!isIOS && (
            <button type="button" onClick={install} className="mt-2 text-xs font-semibold bg-sky-500 text-white px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors">
              Install
            </button>
          )}
        </div>
        <button type="button" onClick={dismiss} className="text-navy-400 hover:text-white shrink-0" aria-label="Dismiss"><X size={14} /></button>
      </div>
    </div>
  )
}
