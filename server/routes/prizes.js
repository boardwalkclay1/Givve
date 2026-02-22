import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Seed prizes used when the database is unavailable or empty.
// Amazon & Walmart links are search URLs until affiliate links are obtained.
const SEED_PRIZES = [
  {
    id: 1,
    name: 'Apple AirPods Pro',
    imageUrl: 'https://via.placeholder.com/200?text=%F0%9F%8E%A7',
    value: 249,
    winnerNumber: 10,
    status: 'pending',
    amazonUrl: 'https://www.amazon.com/s?k=Apple+AirPods+Pro',
    walmartUrl: 'https://www.walmart.com/search?q=Apple+AirPods+Pro'
  },
  {
    id: 2,
    name: 'Nintendo Switch',
    imageUrl: 'https://via.placeholder.com/200?text=%F0%9F%8E%AE',
    value: 299,
    winnerNumber: 20,
    status: 'pending',
    amazonUrl: 'https://www.amazon.com/s?k=Nintendo+Switch',
    walmartUrl: 'https://www.walmart.com/search?q=Nintendo+Switch'
  },
  {
    id: 3,
    name: 'Apple iPad Air',
    imageUrl: 'https://via.placeholder.com/200?text=%F0%9F%93%B1',
    value: 599,
    winnerNumber: 30,
    status: 'pending',
    amazonUrl: 'https://www.amazon.com/s?k=Apple+iPad+Air',
    walmartUrl: 'https://www.walmart.com/search?q=Apple+iPad+Air'
  },
  {
    id: 4,
    name: 'Samsung 4K Smart TV 50"',
    imageUrl: 'https://via.placeholder.com/200?text=%F0%9F%93%BA',
    value: 499,
    winnerNumber: 50,
    status: 'pending',
    amazonUrl: 'https://www.amazon.com/s?k=Samsung+50+inch+4K+Smart+TV',
    walmartUrl: 'https://www.walmart.com/search?q=Samsung+50+inch+4K+Smart+TV'
  },
  {
    id: 5,
    name: 'Sony PlayStation 5',
    imageUrl: 'https://via.placeholder.com/200?text=%F0%9F%8E%AE',
    value: 499,
    winnerNumber: 100,
    status: 'pending',
    amazonUrl: 'https://www.amazon.com/s?k=Sony+PlayStation+5',
    walmartUrl: 'https://www.walmart.com/search?q=Sony+PlayStation+5'
  }
];

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prizes ORDER BY id ASC');
    if (result.rows.length) {
      const prizes = result.rows.map(row => ({
        ...row,
        name: row.name || row.title,
        amazonUrl: row.amazon_url || (row.name || row.title ? `https://www.amazon.com/s?k=${encodeURIComponent(row.name || row.title)}` : null),
        walmartUrl: row.walmart_url || (row.name || row.title ? `https://www.walmart.com/search?q=${encodeURIComponent(row.name || row.title)}` : null)
      }));
      return res.json(prizes);
    }
    res.json(SEED_PRIZES);
  } catch (_err) {
    res.json(SEED_PRIZES);
  }
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO prizes (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { SEED_PRIZES };
export default router;
