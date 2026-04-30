import { Request, Response } from 'express';
import axios from 'axios';
import { matchedData } from 'express-validator';
import pool from '../db';

const LRCLIB_BASE = 'https://lrclib.net/api';

export const searchSongs = async (req: Request, res: Response): Promise<void> => {
  const { q } = matchedData(req);

  try {
    const response = await axios.get(`${LRCLIB_BASE}/search`, {
      params: { q },
      headers: { 'Lrclib-Client': 'lyric-finder (dev)' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching songs' });
  }
};

export const getLyrics = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check cache first
    const cached = await pool.query(
      'SELECT * FROM songs WHERE lrclib_id = $1',
      [id]
    );

    if (cached.rows.length > 0) {
      res.json(cached.rows[0]);
      return;
    }

    // Fetch from lrclib by ID
    const response = await axios.get(`${LRCLIB_BASE}/get/${id}`, {
      headers: { 'Lrclib-Client': 'lyric-finder (dev)' }
    });

    const { trackName, artistName, albumName, plainLyrics, syncedLyrics } = response.data;

    // Save to cache
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