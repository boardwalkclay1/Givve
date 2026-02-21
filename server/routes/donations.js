import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET all donations
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
  res.json(result.rows);
});

// ADD a donation
router.post('/', async (req, res) => {
  const { name, amount } = req.body;

  const result = await pool.query(
    'INSERT INTO donations (name, amount) VALUES ($1, $2) RETURNING *',
    [name, amount]
  );

  res.json(result.rows[0]);
});

export default router;
