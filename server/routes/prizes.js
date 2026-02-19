import express from 'express';
import Prize from '../models/Prize.js';

const router = express.Router();

// Get all prizes
router.get('/', async (req, res) => {
  try {
    const prizes = await Prize.find().sort({ winnerNumber: 1 });
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load prizes' });
  }
});

// Seed prizes (run once manually)
router.post('/seed', async (req, res) => {
  try {
    const { prizes } = req.body;
    await Prize.deleteMany({});
    const created = await Prize.insertMany(prizes);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed prizes' });
  }
});

export default router;
