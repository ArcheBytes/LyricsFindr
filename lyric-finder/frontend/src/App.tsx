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

const PLACEHOLDERS = [
  { artistName: 'Taylor Swift',  trackName: 'Shake It Off' },
  { artistName: 'The Weeknd',    trackName: 'Blinding Lights' },
  { artistName: 'Billie Eilish', trackName: 'Bad Guy' },
  { artistName: 'Drake',         trackName: "God's Plan" },
  { artistName: 'Dua Lipa',      trackName: 'Levitating' },
  { artistName: 'Ed Sheeran',    trackName: 'Shape of You' },
  { artistName: 'Adele',         trackName: 'Rolling in the Deep' },
]

const SLIDE_W  = 390   // px – center card width
const SLIDE_MS = 750   // ms – transition duration
const AUTO_MS  = 5000  // ms – auto-advance interval

interface CarouselItem {
  id: number
  artworkUrl: string | null
  gradient: string
  trackName: string
  artistName: string
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
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    mode, query, results, selected, loading, error,
    setQuery, handleSearch, handleGetLyrics, handleBack, handleModeChange,
  } = useSongs()

  const { songs: featuredSongs, loading: featuredLoading } = useFeaturedSongs()

  // ── Carousel items ──────────────────────────────────────────────────────────
  const items = useMemo<CarouselItem[]>(() => {
    if (featuredLoading || featuredSongs.length === 0) {
      return GRADIENTS.map((gradient, i) => ({
        id: i,
        artworkUrl: null,
        gradient,
        trackName:  PLACEHOLDERS[i].trackName,
        artistName: PLACEHOLDERS[i].artistName,
      }))
    }
    return featuredSongs.slice(0, 7).map((s, i) => ({
      id:         s.id,
      artworkUrl: s.artworkUrl,
      gradient:   GRADIENTS[i % GRADIENTS.length],
      trackName:  s.trackName,
      artistName: s.artistName,
    }))
  }, [featuredLoading, featuredSongs])

  const n = items.length

  // Track: clone of last item → real items → clone of first item
  // Positions:  0 (clone_last) | 1…n (real) | n+1 (clone_first)
  const track = useMemo(() => [
    { ...items[n - 1], id: -1 },
    ...items,
    { ...items[0],     id: -2 },
  ], [items, n])

  // slidePos starts at 1 (first real item)
  const [slidePos, setSlidePos] = useState(1)
  const [animated, setAnimated] = useState(true)

  // Sync mutable refs so setTimeout closures always see fresh values
  const nRef         = useRef(n)
  const trackLenRef  = useRef(track.length)
  useEffect(() => { nRef.current        = n            }, [n])
  useEffect(() => { trackLenRef.current = track.length }, [track.length])

  // logicalIndex: which real item is on screen
  const logicalIndex = (slidePos - 1 + n) % n

  // Reset position when items array is replaced (placeholder → real)
  useEffect(() => {
    setAnimated(false)
    setSlidePos(1)
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
  }, [items])

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const doAdvance = useCallback(() => {
    setAnimated(true)
    setSlidePos(pos => {
      const next = pos + 1
      // Reached clone_first → silently jump back to real first
      if (next === trackLenRef.current - 1) {
        setTimeout(() => {
          setAnimated(false)
          setSlidePos(1)
          requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
        }, SLIDE_MS + 20)
      }
      return next
    })
  }, [])

  const doRetreat = useCallback(() => {
    setAnimated(true)
    setSlidePos(pos => {
      const prev = pos - 1
      // Reached clone_last → silently jump back to real last
      if (prev === 0) {
        setTimeout(() => {
          setAnimated(false)
          setSlidePos(nRef.current)
          requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
        }, SLIDE_MS + 20)
      }
      return prev
    })
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(doAdvance, AUTO_MS)
  }, [doAdvance])

  const advance = useCallback(() => { resetTimer(); doAdvance() }, [resetTimer, doAdvance])
  const retreat = useCallback(() => { resetTimer(); doRetreat() }, [resetTimer, doRetreat])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

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

  const currentItem = items[logicalIndex]
  const prevItem    = items[(logicalIndex - 1 + n) % n]
  const nextItem    = items[(logicalIndex + 1) % n]

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

        {/* Left card */}
        <div
          className="absolute overflow-hidden rounded-2xl cursor-pointer"
          style={{
            width: 270, height: 280,
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% - 355px), -50%)',
            opacity: 0.65,
          }}
          onClick={retreat}
        >
          <CardFace item={prevItem} blur={10} />
        </div>

        {/* Center card – scrolling track */}
        <div
          className="absolute overflow-hidden"
          style={{ width: SLIDE_W, height: '100%', top: 0, left: '50%', transform: 'translateX(-50%)' }}
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
              <div key={i} style={{ width: SLIDE_W, height: '100%', position: 'relative', flexShrink: 0 }}>
                <CardFace item={item} blur={14} />
              </div>
            ))}
          </div>

          {/* Dark tint */}
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />

          {/* Artist name + song – bottom of center card */}
          <div className="absolute bottom-0 inset-x-0 z-10 px-8 pb-8 pt-24 bg-linear-to-t from-black/75 to-transparent pointer-events-none">
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              {currentItem?.artistName}
            </h2>
            <p className="text-gray-300 text-sm mt-1 tracking-wide">{currentItem?.trackName}</p>
          </div>
        </div>

        {/* Right card */}
        <div
          className="absolute overflow-hidden rounded-2xl cursor-pointer"
          style={{
            width: 270, height: 280,
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% + 355px), -50%)',
            opacity: 0.65,
          }}
          onClick={advance}
        >
          <CardFace item={nextItem} blur={10} />
        </div>

        {/* Prev arrow */}
        <button
          onClick={retreat}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
        >
          ←
        </button>

        {/* Next arrow */}
        <button
          onClick={advance}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
        >
          →
        </button>

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
