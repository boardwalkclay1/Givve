import express from "express";
import pb from "../lib/pbClient.js";

const router = express.Router();

// ----------------------
// GET all prizes sorted by triggerNumber
// ----------------------
router.get("/", async (req, res) => {
  try {
    const prizes = await pb.collection("prizes").getFullList({
      sort: "triggerNumber",
    });

    res.json(prizes);
  } catch (err) {
    console.error("Error fetching prizes:", err);
    res.status(500).json({ error: "Failed to load prizes" });
  }
});

// ----------------------
// CREATE a new prize
// ----------------------
router.post("/", async (req, res) => {
  try {
    const { title, description, triggerNumber, value, image } = req.body;

    const prize = await pb.collection("prizes").create({
      title,
      description,
      triggerNumber,
      value: value || 0,
      image: image || "",
      status: "pending",
    });

    res.json({
      success: true,
      prize,
    });
  } catch (err) {
    console.error("Error creating prize:", err);

    res.status(500).json({
      error: err?.response?.data?.message || "Failed to create prize",
    });
  }
});

export default router;
