import { useState } from 'react'

type SearchMode = 'song' | 'lyrics'

interface Song {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  plainLyrics: string
}

interface LyricsResult {
  title: string
  artist: string
  rank: number
}

const API = 'http://localhost:3000/api/songs'

export default function App() {
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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">🎵 LyricsFindr</h1>
      <p className="text-gray-400 mb-8 text-sm">Search songs or find them by lyrics</p>

      {/* Mode toggle */}
      <div className="flex bg-gray-800 rounded-full p-1 mb-6">
        <button
          onClick={() => { setMode('song'); setResults([]); setSelected(null) }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            mode === 'song' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Search by song
        </button>
        <button
          onClick={() => { setMode('lyrics'); setResults([]); setSelected(null) }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            mode === 'lyrics' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Search by lyrics
        </button>
      </div>

      {/* Search input */}
      <div className="flex w-full max-w-xl gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={mode === 'song' ? 'Song or artist name...' : 'Paste a lyrics fragment...'}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-5 py-3 rounded-xl text-sm font-medium transition"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Song results */}
      {!selected && mode === 'song' && (results as Song[]).length > 0 && (
        <div className="w-full max-w-xl space-y-2">
          {(results as Song[]).map((song) => (
            <button
              key={song.id}
              onClick={() => handleGetLyrics(song)}
              className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition"
            >
              <p className="font-medium text-white">{song.trackName}</p>
              <p className="text-sm text-gray-400">
                {song.artistName}
                {song.albumName ? ` · ${song.albumName}` : ''}
                {song.duration ? ` · ${formatDuration(song.duration)}` : ''}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Lyrics search results */}
      {!selected && mode === 'lyrics' && (results as LyricsResult[]).length > 0 && (
        <div className="w-full max-w-xl space-y-2">
          {(results as LyricsResult[]).map((song, i) => (
            <div
              key={i}
              className="w-full text-left bg-gray-800 border border-gray-700 rounded-xl px-4 py-3"
            >
              <p className="font-medium text-white">{song.title}</p>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lyrics view */}
      {selected && (
        <div className="w-full max-w-xl">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-400 hover:text-white mb-4 transition"
          >
            ← Back to results
          </button>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">{selected.trackName}</h2>
            <p className="text-purple-400 text-sm mb-6">{selected.artistName}</p>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {selected.plainLyrics || 'No lyrics available.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}