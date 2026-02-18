import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Simple signup (no hashing here, you should hash in real life)
router.post('/signup', async (req, res) => {
  const { email, password, displayName } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already used' });

  const user = await User.create({
    email,
    passwordHash: password,
    displayName
  });

  res.json(user);
});

// Simple login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(user);
});

export default router;
