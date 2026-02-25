import express from "express";
import pb from "../lib/pbClient.js";

const router = express.Router();

// GET all donations
router.get("/", async (req, res) => {
  try {
    const donations = await pb.collection("donations").getFullList({
      sort: "-created",
    });

    res.json(donations);
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ error: "Failed to load donations" });
  }
});

// POST new donation + increment donorCount
router.post("/", async (req, res) => {
  try {
    const { amount, paymentId } = req.body;

    if (!amount || !paymentId) {
      return res.status(400).json({
        error: "Missing amount or paymentId",
      });
    }

    // Create donation record
    const donation = await pb.collection("donations").create({
      amount,
      paymentId,
    });

    // Fetch stats record (only one exists)
    const stats = await pb.collection("stats").getFirstListItem("id != ''");

    // Increment donor count
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
