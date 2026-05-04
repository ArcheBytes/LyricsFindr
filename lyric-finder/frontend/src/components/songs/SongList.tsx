import type { Song, LyricsResult } from '../../types/song'
import type { SearchMode } from '../../hooks/useSongs'
import BorderGlow from '../ui/BorderGlow'

interface SongListProps {
  mode: SearchMode
  results: Song[] | LyricsResult[]
  onSongClick: (song: Song) => void
}

const GLOW_COLORS = ['#7C3AED', '#a78bfa', '#c4b5fd']
const GLOW_RGB = '263 85 57'  // HSL for purple-600 (#7C3AED)

export default function SongList({ mode, results, onSongClick }: SongListProps) {
  if (mode === 'song') {
    return (
      <div className="w-full flex flex-wrap justify-center gap-5 max-w-5xl">
        {(results as Song[]).map((song) => (
          <BorderGlow
            key={song.id}
            colors={GLOW_COLORS}
            glowColor={GLOW_RGB}
            backgroundColor="#111827"
            borderRadius={16}
            className="w-50"
            onClick={() => onSongClick(song)}
          >
            <article className="flex flex-col rounded-2xl overflow-hidden bg-gray-900">
              {song.artworkUrl ? (
                <img
                  src={song.artworkUrl}
                  alt={song.trackName}
                  className="w-full h-50 object-cover"
                />
              ) : (
                <div className="w-full h-50 bg-gray-800 flex items-center justify-center text-gray-600 text-4xl">
                  ♪
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-white text-sm truncate">{song.trackName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{song.artistName}</p>
              </div>
            </article>
          </BorderGlow>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl space-y-2">
      {(results as LyricsResult[]).map((song, i) => (
        <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
          <p className="font-medium text-white">{song.title}</p>
          <p className="text-sm text-gray-400">{song.artist}</p>
        </div>
      ))}
    </div>
  )
}
