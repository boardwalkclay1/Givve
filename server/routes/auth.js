import express from "express";
import pb from "../lib/pbClient.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name: displayName,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const authData = await pb.collection("users").authWithPassword(
      email,
      password
    );

    res.json({
      success: true,
      token: authData.token,
      user: authData.record,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
