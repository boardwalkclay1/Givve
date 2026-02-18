import express from 'express';
import Prize from '../models/Prize.js';

const router = express.Router();

// Get all prizes
router.get('/', async (req, res) => {
  const prizes = await Prize.find().sort({ winnerNumber: 1 });
  res.json(prizes);
});

// Seed prizes (you can call this once manually)
router.post('/seed', async (req, res) => {
  const { prizes } = req.body; // [{name, imageUrl, value, winnerNumber}]
  await Prize.deleteMany({});
  const created = await Prize.insertMany(prizes);
  res.json(created);
});

export default router;
