export interface Song {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  plainLyrics: string
  artworkUrl: string | null
}

export interface LyricsResult {
  title: string
  artist: string
  rank: number
}