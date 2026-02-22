import express from 'express';
import { pool } from '../db.js';
import { SEED_PRIZES } from './prizes.js';

const router = express.Router();

// In-memory donation counter — used as fallback when DB is unavailable.
let inMemoryDonationCount = 0;

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (_err) {
    res.json([]);
  }
});

router.post('/', async (req, res) => {
  const { userId, amount, tier, paymentId } = req.body;

  let globalDonationIndex;
  let prizes = SEED_PRIZES;

  try {
    // Determine the global donation index from the DB count.
    const countResult = await pool.query('SELECT COUNT(*) FROM donations');
    globalDonationIndex = parseInt(countResult.rows[0].count, 10) + 1;

    // Persist the donation.
    await pool.query(
      'INSERT INTO donations (name, amount, payment_id, global_donation_index) VALUES ($1, $2, $3, $4)',
      [userId || 'anonymous', amount, paymentId || null, globalDonationIndex]
    );

    // Try to load live prizes for winner checking.
    const prizesResult = await pool.query("SELECT * FROM prizes WHERE status = 'pending'");
    if (prizesResult.rows.length) {
      prizes = prizesResult.rows.map(row => ({
        ...row,
        name: row.name || row.title,
        amazonUrl: row.amazon_url || (row.name || row.title ? `https://www.amazon.com/s?k=${encodeURIComponent(row.name || row.title)}` : null),
        walmartUrl: row.walmart_url || (row.name || row.title ? `https://www.walmart.com/search?q=${encodeURIComponent(row.name || row.title)}` : null)
      }));
    }
  } catch (_err) {
    // DB unavailable — use in-memory counter.
    inMemoryDonationCount += 1;
    globalDonationIndex = inMemoryDonationCount;
  }

  // Check whether this donation hits a prize's winner number.
  const wonPrize = prizes.find(
    p => Number(p.winnerNumber || p.winner_number) === globalDonationIndex && p.status !== 'won'
  );

  if (wonPrize) {
    // Best-effort update — ignore failure if DB is down.
    try {
      await pool.query("UPDATE prizes SET status = 'won' WHERE id = $1", [wonPrize.id]);
    } catch (_err) { /* ignore */ }

    return res.json({
      isWinner: true,
      prize: wonPrize,
      donation: { globalDonationIndex, amount, tier, paymentId }
    });
  }

  res.json({
    isWinner: false,
    donation: { globalDonationIndex, amount, tier, paymentId }
  });
});

export default router;
