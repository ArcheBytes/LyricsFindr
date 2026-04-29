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
 *     summary: Busca canciones por nombre
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Nombre de la canción o artista
 *     responses:
 *       200:
 *         description: Lista de canciones encontradas
 *       400:
 *         description: Parámetro q requerido
 *       429:
 *         description: Demasiadas peticiones
 *       500:
 *         description: Error al contactar con lrclib
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
 *     summary: Obtiene la letra de una canción
 *     parameters:
 *       - in: query
 *         name: artist
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Nombre del artista
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Título de la canción
 *     responses:
 *       200:
 *         description: Letra de la canción
 *       400:
 *         description: Parámetros artist y title requeridos
 *       429:
 *         description: Demasiadas peticiones
 *       500:
 *         description: Error al contactar con lrclib
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