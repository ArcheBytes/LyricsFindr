import { useState, useEffect } from 'react'
import type { Song } from '../types/song'

const RSS_URL = 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/100/songs.json'

interface RssResult {
  id: string
  name: string
  artistName: string
  artworkUrl100: string
  releaseDate: string
}

export function useFeaturedSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(RSS_URL)
      .then(r => r.json())
      .then((data: { feed: { results: RssResult[] } }) => {
        const results = data.feed.results ?? []

        // One song per artist (first = most popular), up to 15 unique artists
        const seen = new Set<string>()
        const unique: Song[] = []

        for (const t of results) {
          const key = t.artistName.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          unique.push({
            id: parseInt(t.id),
            trackName: t.name,
            artistName: t.artistName,
            albumName: '',
            duration: 0,
            plainLyrics: '',
            artworkUrl: t.artworkUrl100.replace('100x100bb', '600x600bb'),
          })
          if (unique.length === 15) break
        }

        setSongs(unique)
      })
      .catch(() => {/* keep placeholder gradients on error */})
      .finally(() => setLoading(false))
  }, [])

  return { songs, loading }
}
