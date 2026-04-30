import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { searchSongs, getLyrics, searchByLyrics } from '../controllers/songsController';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const handleValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

/**
 * @openapi
 * /api/songs/search:
 *   get:
 *     summary: Search songs by name
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Song or artist name
 *     responses:
 *       200:
 *         description: List of matching songs
 *       400:
 *         description: Query param q is required
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Error contacting lrclib
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty().withMessage('Param "q" is required')
      .isString()
      .trim()
      .escape()
      .isLength({ max: 100 }).withMessage('Query too long')
  ],
  handleValidation,
  searchSongs
);

/**
 * @openapi
 * /api/songs/lyrics/{id}:
 *   get:
 *     summary: Get lyrics for a song by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: lrclib song ID
 *     responses:
 *       200:
 *         description: Song lyrics
 *       500:
 *         description: Error contacting lrclib
 */
router.get('/lyrics/:id', getLyrics);

/**
 * @openapi
 * /api/songs/search-by-lyrics:
 *   get:
 *     summary: Search songs by lyrics fragment
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Lyrics fragment to search
 *     responses:
 *       200:
 *         description: List of matching songs ordered by relevance
 *       400:
 *         description: Query param q is required
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Error searching lyrics
 */
router.get(
  '/search-by-lyrics',
  [
    query('q')
      .notEmpty().withMessage('Param "q" is required')
      .isString()
      .trim()
      .escape()
      .isLength({ max: 200 }).withMessage('Query too long')
  ],
  handleValidation,
  searchByLyrics
);

export default router;