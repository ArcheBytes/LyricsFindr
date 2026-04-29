import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { searchSongs, getLyrics } from '../controllers/songsController';
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
 * /api/songs/lyrics:
 *   get:
 *     summary: Get lyrics for a song
 *     parameters:
 *       - in: query
 *         name: artist
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Artist name
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Song title
 *     responses:
 *       200:
 *         description: Song lyrics
 *       400:
 *         description: Params artist and title are required
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Error contacting lrclib
 */
router.get(
  '/lyrics',
  [
    query('artist')
      .notEmpty().withMessage('Param "artist" is required')
      .isString()
      .trim()
      .escape()
      .isLength({ max: 100 }).withMessage('Artist name too long'),
    query('title')
      .notEmpty().withMessage('Param "title" is required')
      .isString()
      .trim()
      .escape()
      .isLength({ max: 100 }).withMessage('Title too long')
  ],
  handleValidation,
  getLyrics
);

export default router;