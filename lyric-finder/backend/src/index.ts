import express from 'express';
import dotenv from 'dotenv';
import songsRouter from './routes/songs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/songs', songsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});