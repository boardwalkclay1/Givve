import express from "express";
import pb from "../lib/pbClient.js";

const router = express.Router();

// ----------------------
// SIGNUP + AUTO LOGIN
// ----------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user in PocketBase
    const user = await pb.collection("users").create({
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name: displayName,
    });

    // Auto-login after signup
    const authData = await pb.collection("users").authWithPassword(
      email,
      password
    );

    res.json({
      success: true,
      user: authData.record,
      token: authData.token,
      expires: authData.meta?.tokenExpire,
    });
  } catch (err) {
    console.error("Signup error:", err);

    res.status(400).json({
      error: err?.response?.data?.message || "Signup failed",
    });
  }
});

// ----------------------
// LOGIN
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const authData = await pb.collection("users").authWithPassword(
      email,
      password
    );

    res.json({
      success: true,
      user: authData.record,
      token: authData.token,
      expires: authData.meta?.tokenExpire,
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(401).json({
      error: "Invalid credentials",
    });
  }
});

export default router;
