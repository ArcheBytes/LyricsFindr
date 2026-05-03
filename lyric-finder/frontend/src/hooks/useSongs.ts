import { useState } from 'react'
import type { Song, LyricsResult } from '../types/song'

const API = 'http://localhost:3000/api/songs'

export type SearchMode = 'song' | 'lyrics'

export const useSongs = () => {
  const [mode, setMode] = useState<SearchMode>('song')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[] | LyricsResult[]>([])
  const [selected, setSelected] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSelected(null)

    try {
      const url = mode === 'song'
        ? `${API}/search?q=${encodeURIComponent(query)}`
        : `${API}/search-by-lyrics?q=${encodeURIComponent(query)}`

      const res = await fetch(url)
      const data = await res.json()
      setResults(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGetLyrics = async (song: Song) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API}/lyrics/${song.id}`)
      const data = await res.json()
      setSelected(data)
    } catch {
      setError('Could not fetch lyrics.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => setSelected(null)

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode)
    setResults([])
    setSelected(null)
  }

  return {
    mode,
    query,
    results,
    selected,
    loading,
    error,
    setQuery,
    handleSearch,
    handleGetLyrics,
    handleBack,
    handleModeChange
  }
}