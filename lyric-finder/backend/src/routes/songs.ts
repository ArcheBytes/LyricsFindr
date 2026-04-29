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