import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useSongs } from './hooks/useSongs'
import { useFeaturedSongs } from './hooks/useFeaturedSongs'
import SongList from './components/songs/SongList'
import LyricsView from './components/songs/LyricsView'

const GRADIENTS = [
  'from-purple-600 via-pink-500 to-orange-400',
  'from-blue-700 via-purple-600 to-pink-500',
  'from-orange-500 via-red-500 to-purple-700',
  'from-emerald-500 via-teal-500 to-blue-600',
  'from-yellow-400 via-orange-500 to-rose-500',
  'from-rose-500 via-pink-600 to-violet-700',
  'from-cyan-400 via-blue-500 to-indigo-600',
]

const SLIDE_W   = 390   // px – center card width
const SLIDE_MS  = 750   // ms – scroll transition duration
const AUTO_MS   = 5000  // ms – auto-advance interval

interface CarouselItem {
  id: number
  artworkUrl: string | null
  gradient: string
}

function CardFace({ item, blur = 0 }: { item: CarouselItem; blur?: number }) {
  const style = { filter: `blur(${blur}px)`, transform: 'scale(1.12)' }
  if (item.artworkUrl) {
    return (
      <img
        src={item.artworkUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={style}
      />
    )
  }
  return <div className={`absolute inset-0 bg-linear-to-br ${item.gradient}`} style={style} />
}

export default function App() {
  const heroRef    = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const {
    mode, query, results, selected, loading, error,
    setQuery, handleSearch, handleGetLyrics, handleBack, handleModeChange,
  } = useSongs()

  const { songs: featuredSongs, loading: featuredLoading } = useFeaturedSongs()

  // ── Carousel state ──────────────────────────────────────────────────────────
  const items = useMemo<CarouselItem[]>(() => {
    if (featuredLoading || featuredSongs.length === 0) {
      return GRADIENTS.map((gradient, i) => ({ id: i, artworkUrl: null, gradient }))
    }
    return featuredSongs
      .slice(0, 7)
      .map((s, i) => ({ id: s.id, artworkUrl: s.artworkUrl, gradient: GRADIENTS[i % GRADIENTS.length] }))
  }, [featuredLoading, featuredSongs])

  // Track = real items + clone of first item at the end (seamless infinite loop)
  const track = useMemo(() => [...items, { ...items[0], id: -1 }], [items])

  const n = items.length

  // slidePos  → position in the track (0…n, where n is the clone)
  // animated  → whether CSS transition is active
  const [slidePos,  setSlidePos]  = useState(0)
  const [animated,  setAnimated]  = useState(true)

  // logicalIndex: the real item currently "on screen"
  const logicalIndex = slidePos % n

  const advance = useCallback(() => {
    setAnimated(true)
    setSlidePos(pos => {
      const next = pos + 1
      if (next === track.length - 1) {
        // We're sliding into the clone → after transition, silently jump to pos 0
        setTimeout(() => {
          setAnimated(false)          // disable transition
          setSlidePos(0)              // instant reset to real first slide
          // Re-enable transition on next paint
          requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
        }, SLIDE_MS + 20)
      }
      return next
    })
  }, [track.length])

  // Auto-advance timer
  useEffect(() => {
    const timer = setInterval(advance, AUTO_MS)
    return () => clearInterval(timer)
  }, [advance])

  // ── GSAP entrance ───────────────────────────────────────────────────────────
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

  const prevItem = items[(logicalIndex - 1 + n) % n]
  const nextItem = items[(logicalIndex + 1) % n]

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

        {/* Left card – shows previous item */}
        <div
          className="absolute overflow-hidden rounded-2xl"
          style={{
            width: 270, height: 280,
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% - 355px), -50%)',
            opacity: 0.65,
          }}
        >
          <CardFace item={prevItem} blur={10} />
        </div>

        {/* Center card – scrolling track */}
        <div
          className="absolute overflow-hidden"
          style={{
            width: SLIDE_W, height: '100%',
            top: 0, left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Sliding track */}
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: `${track.length * SLIDE_W}px`,
              transform: `translateX(-${slidePos * SLIDE_W}px)`,
              transition: animated
                ? `transform ${SLIDE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : 'none',
            }}
          >
            {track.map((item, i) => (
              <div
                key={i}
                style={{ width: SLIDE_W, height: '100%', position: 'relative', flexShrink: 0 }}
              >
                <CardFace item={item} blur={14} />
              </div>
            ))}
          </div>

          {/* Dark tint for text readability */}
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        </div>

        {/* Right card – shows next item */}
        <div
          className="absolute overflow-hidden rounded-2xl"
          style={{
            width: 270, height: 280,
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% + 355px), -50%)',
            opacity: 0.65,
          }}
        >
          <CardFace item={nextItem} blur={10} />
        </div>

        {/* Search bar – centered over the carousel */}
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
