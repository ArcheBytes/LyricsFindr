import type { Song } from '../../types/song'

interface LyricsViewProps {
  song: Song
  onBack: () => void
}

export default function LyricsView({ song, onBack }: LyricsViewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
      >
        ← BACK
      </button>

      {/* Header card */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {/* Blurred artwork background */}
        {song.artworkUrl && (
          <img
            src={song.artworkUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: 'blur(28px)', opacity: 0.45 }}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative flex gap-5 p-6">
          {song.artworkUrl ? (
            <img
              src={song.artworkUrl}
              alt={song.trackName}
              className="w-24 h-24 rounded-xl object-cover shrink-0 shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-800 flex items-center justify-center text-3xl shrink-0">
              ♪
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-2xl font-black text-white leading-tight truncate">{song.trackName}</h2>
            <p className="text-purple-400 font-semibold mt-1 truncate">{song.artistName}</p>
            {song.albumName && (
              <p className="text-gray-400 text-sm mt-1 truncate">{song.albumName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lyrics */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        {song.plainLyrics ? (
          <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-7 tracking-wide">
            {song.plainLyrics}
          </pre>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No lyrics available.</p>
        )}
      </div>

    </div>
  )
}
