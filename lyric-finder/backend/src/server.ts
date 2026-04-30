import app from './index';
import pool from './db';

const PORT = process.env.PORT || 3000;

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});