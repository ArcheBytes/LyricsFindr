import { Router } from 'express';
import { searchSongs, getLyrics } from '../controllers/songsController';

const router = Router();

router.get('/search', searchSongs);
router.get('/lyrics', getLyrics);

export default router;