// server/routes/auth.js
import express from "express";
import db from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ----------------------
// SIGNUP + AUTO LOGIN
// ----------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if email exists
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email, hash, displayName]
    );

    const user = result.rows[0];

    // Auto-login: create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      user,
      token,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: "Signup failed" });
  }
});

// ----------------------
// LOGIN
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query(
      "SELECT id, email, password_hash, display_name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      },
      token,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
