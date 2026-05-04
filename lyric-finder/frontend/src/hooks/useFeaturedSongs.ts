import { useState, useEffect } from 'react'
import type { Song } from '../types/song'

const API = 'http://localhost:3000/api/songs'

export function useFeaturedSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/search?q=love`).then(r => r.json()),
      fetch(`${API}/search?q=night`).then(r => r.json()),
    ]).then(results => {
      const all: Song[] = []
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          all.push(...(r.value as Song[]))
        }
      }
      const seen = new Set<number>()
      const unique = all.filter(s => {
        if (seen.has(s.id)) return false
        seen.add(s.id)
        return true
      })
      setSongs(unique.slice(0, 25))
    }).finally(() => setLoading(false))
  }, [])

  return { songs, loading }
}
