import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM prizes ORDER BY id ASC');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;

  const result = await pool.query(
    'INSERT INTO prizes (title, description) VALUES ($1, $2) RETURNING *',
    [title, description]
  );

  res.json(result.rows[0]);
});

export default router;
