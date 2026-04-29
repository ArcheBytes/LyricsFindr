import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import songsRouter from './routes/songs';

dotenv.config();

const app = express();

// Cabeceras de seguridad HTTP
app.use(helmet());

// Limitar peticiones: máximo 60 por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});
app.use(limiter);

app.use(express.json({ limit: '10kb' })); // Limita el tamaño del body

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/songs', songsRouter);

export default app;