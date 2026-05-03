import { Request, Response } from 'express';
import axios from 'axios';
import { matchedData } from 'express-validator';
import pool from '../db';

const LRCLIB_BASE = 'https://lrclib.net/api';

export const searchSongs = async (req: Request, res: Response): Promise<void> => {
  const { q } = matchedData(req);

  try {
    const [lrclibRes, itunesRes] = await Promise.all([
      axios.get(`${LRCLIB_BASE}/search`, {
        params: { q },
        headers: { 'Lrclib-Client': 'lyric-finder (dev)' }
      }),
      axios.get(`https://itunes.apple.com/search`, {
        params: { term: q, media: 'music', limit: 20 }
      })
    ]);

    const itunesMap = new Map<string, string>();
    for (const track of itunesRes.data.results) {
      const key = `${track.trackName?.toLowerCase()}__${track.artistName?.toLowerCase()}`;
      itunesMap.set(key, track.artworkUrl100.replace('100x100bb', '300x300bb'));
    }

    const enriched = lrclibRes.data.map((song: any) => {
      // Try exact match first
      const exactKey = `${song.trackName?.toLowerCase()}__${song.artistName?.toLowerCase()}`;
      if (itunesMap.has(exactKey)) {
        return { ...song, artworkUrl: itunesMap.get(exactKey) };
      }

      // Fallback: match only by trackName
      const itunesEntry = itunesRes.data.results.find((t: any) =>
        t.trackName?.toLowerCase() === song.trackName?.toLowerCase()
      );

      return {
        ...song,
        artworkUrl: itunesEntry
          ? itunesEntry.artworkUrl100.replace('100x100bb', '300x300bb')
          : null
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching songs' });
  }
};

export const getLyrics = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const cached = await pool.query(
      'SELECT * FROM songs WHERE lrclib_id = $1',
      [id]
    );

    if (cached.rows.length > 0) {
      const row = cached.rows[0];
      res.json({
        trackName: row.title,
        artistName: row.artist,
        albumName: row.album,
        plainLyrics: row.plain_lyrics,
        syncedLyrics: row.synced_lyrics
      });
      return;
    }

    const response = await axios.get(`${LRCLIB_BASE}/get/${id}`, {
      headers: { 'Lrclib-Client': 'lyric-finder (dev)' }
    });

    const { trackName, artistName, albumName, plainLyrics, syncedLyrics } = response.data;

    await pool.query(
      `INSERT INTO songs (lrclib_id, title, artist, album, plain_lyrics, synced_lyrics)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (lrclib_id) DO NOTHING`,
      [id, trackName, artistName, albumName, plainLyrics, syncedLyrics]
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lyrics' });
  }
};

export const searchByLyrics = async (req: Request, res: Response): Promise<void> => {
  const { q } = matchedData(req);

  try {
    const result = await pool.query(
      `SELECT title, artist, album,
              ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
       FROM songs
       WHERE search_vector @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 10`,
      [q]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error searching by lyrics' });
  }
};