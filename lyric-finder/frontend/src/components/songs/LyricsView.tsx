import type { Song } from '../../types/song'

interface LyricsViewProps {
  song: Song
  onBack: () => void
}

export default function LyricsView({ song, onBack }: LyricsViewProps) {
  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white mb-6 transition flex items-center gap-2"
      >
        ← Back to results
      </button>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex gap-5 p-6 border-b border-gray-700">
          {song.artworkUrl && (
            <img
              src={song.artworkUrl}
              alt={song.trackName}
              className="w-24 h-24 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white">{song.trackName}</h2>
            <p className="text-purple-400 mt-1 font-medium">{song.artistName}</p>
            {song.albumName && (
              <p className="text-gray-500 text-sm mt-1">{song.albumName}</p>
            )}
          </div>
        </div>

        <div className="p-6">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {song.plainLyrics || 'No lyrics available.'}
          </pre>
        </div>
      </div>
    </div>
  )
}
