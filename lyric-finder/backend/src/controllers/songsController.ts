import { Request, Response } from 'express';
import axios from 'axios';
import { matchedData } from 'express-validator';

const LRCLIB_BASE = 'https://lrclib.net/api';

export const searchSongs = async (req: Request, res: Response): Promise<void> => {
  const { q } = matchedData(req); // Solo datos validados y sanitizados

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
  const { artist, title } = matchedData(req);

  try {
    const response = await axios.get(`${LRCLIB_BASE}/get`, {
      params: { artist_name: artist, track_name: title },
      headers: { 'Lrclib-Client': 'lyric-finder (dev)' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lyrics' });
  }
};