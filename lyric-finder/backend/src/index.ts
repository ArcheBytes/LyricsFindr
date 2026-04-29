import express from 'express';
import dotenv from 'dotenv';
import songsRouter from './routes/songs';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/songs', songsRouter);

export default app;