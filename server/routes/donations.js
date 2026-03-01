// server/routes/donations.js
import express from "express";
import db from "../lib/db.js";

const router = express.Router();

// --------------------------------------------------
// GET all donations
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM donations ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("POSTGRES DONATIONS FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to load donations" });
  }
});

// --------------------------------------------------
// POST new donation + increment donorCount
// --------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { amount, paymentId } = req.body;

    if (!amount || !paymentId) {
      return res.status(400).json({
        error: "Missing amount or paymentId",
      });
    }

    // Create donation record
    const donationResult = await db.query(
      `INSERT INTO donations (amount, payment_id)
       VALUES ($1, $2)
       RETURNING *`,
      [amount, paymentId]
    );

    const donation = donationResult.rows[0];

    // Fetch stats row (only one)
    const statsResult = await db.query(`SELECT * FROM stats LIMIT 1`);
    let stats = statsResult.rows[0];

    // If stats row doesn't exist, create it
    if (!stats) {
      const createStats = await db.query(
        `INSERT INTO stats (donor_count)
         VALUES (1)
         RETURNING *`
      );
      stats = createStats.rows[0];
    } else {
      // Increment donor count
      const updatedStats = await db.query(
        `UPDATE stats
         SET donor_count = donor_count + 1
         RETURNING *`
      );
      stats = updatedStats.rows[0];
    }

    res.json({
      success: true,
      donation,
      donorCount: stats.donor_count,
    });
  } catch (err) {
    console.error("POSTGRES DONATION CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to create donation" });
  }
});

export default router;
