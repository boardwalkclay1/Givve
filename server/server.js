import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import donationsRouter from './routes/donations.js';
import prizesRouter from './routes/prizes.js';
import usersRouter from './routes/user.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'giveaway_carnival'
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB error:', err);
});

// API routes
app.use('/api/donations', donationsRouter);
app.use('/api/prizes', prizesRouter);
app.use('/api/users', usersRouter);

// Fallback to index.html (rate-limited to prevent file-system abuse)
const htmlLimiter = rateLimit({ windowMs: 60_000, max: 120 });
app.get('*', htmlLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
