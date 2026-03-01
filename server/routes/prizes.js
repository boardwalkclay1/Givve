// server/routes/prizes.js
import express from "express";
import db from "../lib/db.js";

const router = express.Router();

// --------------------------------------------------
// GET all prizes sorted by triggerNumber
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM prizes
       ORDER BY trigger_number ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("POSTGRES PRIZES FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to load prizes" });
  }
});

// --------------------------------------------------
// CREATE a new prize
// --------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { title, description, triggerNumber, value, image } = req.body;

    if (!title || !triggerNumber) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title or triggerNumber",
      });
    }

    const result = await db.query(
      `INSERT INTO prizes (title, description, trigger_number, value, image, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [
        title,
        description || "",
        triggerNumber,
        value || 0,
        image || ""
      ]
    );

    res.json({
      success: true,
      prize: result.rows[0],
    });
  } catch (err) {
    console.error("POSTGRES PRIZE CREATE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to create prize",
    });
  }
});

export default router;
