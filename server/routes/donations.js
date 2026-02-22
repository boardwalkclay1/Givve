import express from "express";
import pb from "../lib/pbClient.js";

const router = express.Router();

/**
 * GET /api/donations
 * Returns the donation history (optional)
 * If you don't track individual donations, you can remove this.
 */
router.get("/", async (req, res) => {
  try {
    const records = await pb.collection("donations").getFullList({
      sort: "-created",
    });

    res.json(records);
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ error: "Failed to load donations" });
  }
});

/**
 * POST /api/donations
 * Creates a donation + increments donorCount in stats
 */
router.post("/", async (req, res) => {
  try {
    const { name, amount } = req.body;

    // 1. Create donation record
    const donation = await pb.collection("donations").create({
      name,
      amount,
    });

    // 2. Load stats record
    const stats = await pb.collection("stats").getFirstListItem("");

    // 3. Increment donorCount
    const updatedStats = await pb.collection("stats").update(stats.id, {
      donorCount: stats.donorCount + 1,
    });

    res.json({
      success: true,
      donation,
      donorCount: updatedStats.donorCount,
    });
  } catch (err) {
    console.error("Error creating donation:", err);
    res.status(500).json({ error: "Failed to create donation" });
  }
});

export default router;
