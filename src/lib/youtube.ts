// Extract the 11-char video ID from any common YouTube URL form.
export function extractYouTubeId(input: string): string | null {
  if (!input) return null
  const s = input.trim()
  // Already an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = s.match(re)
    if (m) return m[1]
  }
  return null
}

export function youTubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youTubeEmbed(id: string): string {
  return `https://www.youtube.com/embed/${id}`
}
