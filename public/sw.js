// Jordan Padierne CRM — minimal service worker for installability + offline shell.
const CACHE = 'jp-crm-v1'
const ASSETS = ['/', '/admin', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

// Network-first for navigation/API (always fresh CRM data), cache fallback offline.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Never cache API or Supabase calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/admin')))
  )
})
