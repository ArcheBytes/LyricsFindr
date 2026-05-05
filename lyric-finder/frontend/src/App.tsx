import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { useSongs } from './hooks/useSongs'
import { useFeaturedSongs } from './hooks/useFeaturedSongs'
import SongList from './components/songs/SongList'
import LyricsView from './components/songs/LyricsView'
import SongCarousel from './components/ui/SongCarousel'
import type { CarouselItem } from './components/ui/SongCarousel'

const GRADIENTS = [
  'from-purple-600 via-pink-500 to-orange-400',
  'from-blue-700 via-purple-600 to-pink-500',
  'from-orange-500 via-red-500 to-purple-700',
  'from-emerald-500 via-teal-500 to-blue-600',
  'from-yellow-400 via-orange-500 to-rose-500',
  'from-rose-500 via-pink-600 to-violet-700',
  'from-cyan-400 via-blue-500 to-indigo-600',
]

const PLACEHOLDERS = [
  { artistName: 'Taylor Swift',  trackName: 'Shake It Off' },
  { artistName: 'The Weeknd',    trackName: 'Blinding Lights' },
  { artistName: 'Billie Eilish', trackName: 'Bad Guy' },
  { artistName: 'Drake',         trackName: "God's Plan" },
  { artistName: 'Dua Lipa',      trackName: 'Levitating' },
  { artistName: 'Ed Sheeran',    trackName: 'Shape of You' },
  { artistName: 'Adele',         trackName: 'Rolling in the Deep' },
]


export default function App() {
  const heroRef    = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const {
    mode, query, results, selected, loading, error,
    setQuery, handleSearch, handleGetLyrics, handleBack, handleModeChange,
  } = useSongs()

  const { songs: featuredSongs, loading: featuredLoading } = useFeaturedSongs()

  const carouselItems = useMemo<CarouselItem[]>(() => {
    if (featuredLoading || featuredSongs.length === 0) {
      return GRADIENTS.map((gradient, i) => ({
        id: i,
        artworkUrl: null,
        gradient,
        trackName:  PLACEHOLDERS[i].trackName,
        artistName: PLACEHOLDERS[i].artistName,
      }))
    }
    return featuredSongs.slice(0, 15).map((s, i) => ({
      id:         s.id,
      artworkUrl: s.artworkUrl,
      gradient:   GRADIENTS[i % GRADIENTS.length],
      trackName:  s.trackName,
      artistName: s.artistName,
    }))
  }, [featuredLoading, featuredSongs])

  // ── GSAP entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-anim="title"]',    { y: 40, opacity: 0, duration: 0.9 })
        .from('[data-anim="subtitle"]', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('[data-anim="toggle"]',   { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('[data-anim="search"]',   { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Scroll to results when they arrive
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [results])

  return (
    <div className="bg-black text-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5">
        <a href="#" className="text-xl tracking-widest select-none">
          <span className="font-black">LYRICS</span>
          <span className="font-light text-gray-400">FINDR</span>
        </a>
        <div className="flex items-center gap-8">
          <a href="#" className="text-xs font-semibold tracking-widest hover:text-gray-300 transition-colors">HOME</a>
          <a href="#" className="text-xs font-semibold tracking-widest text-gray-500 hover:text-white transition-colors">ABOUT</a>
          <a href="#" className="text-xs font-semibold tracking-widest text-gray-500 hover:text-white transition-colors">CONTACT</a>
          <button className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-lg leading-none hover:border-white transition-colors">
            ≡
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen bg-[#12121a] overflow-hidden"
      >
        <SongCarousel items={carouselItems} autoplayDelay={5000} />

        {/* Scroll-down indicator */}
        <button className="absolute bottom-7 left-8 z-20 w-14 h-14 rounded-full border border-gray-700 flex items-center justify-center hover:border-white transition-colors text-lg">
          ↓
        </button>

        {/* Search bar – centered overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <div className="flex flex-col items-center w-full max-w-xl">

            <h1
              data-anim="title"
              className="text-6xl md:text-7xl tracking-widest font-black mb-3 text-center"
            >
              LYRICS<span className="font-extralight text-gray-400">FINDR</span>
            </h1>

            <p data-anim="subtitle" className="text-gray-300 text-sm mb-10 tracking-wide">
              Search songs or find them by lyrics
            </p>

            <div
              data-anim="toggle"
              className="flex bg-black/50 border border-white/10 rounded-full p-1 mb-5"
            >
              <button
                onClick={() => handleModeChange('song')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'song' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Search by song
              </button>
              <button
                onClick={() => handleModeChange('lyrics')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'lyrics' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Search by lyrics
              </button>
            </div>

            <div data-anim="search" className="w-full flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={mode === 'song' ? 'Song or artist name…' : 'Paste a lyrics fragment…'}
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500 transition placeholder:text-gray-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-7 py-4 rounded-xl text-sm font-semibold transition"
              >
                {loading ? '…' : 'Search'}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {(results.length > 0 || selected !== null) && (
        <div ref={resultsRef} className="flex flex-col items-center px-4 py-16 bg-black min-h-screen">
          <div className="w-full max-w-3xl">
            {selected
              ? <LyricsView song={selected} onBack={handleBack} />
              : <SongList mode={mode} results={results} onSongClick={handleGetLyrics} />
            }
          </div>
        </div>
      )}
    </div>
  )
}
