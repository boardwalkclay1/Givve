import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import donationsRouter from './routes/donations.js';
import prizesRouter from './routes/prizes.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'giveaway_carnival'
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB error', err);
});

// API routes
app.use('/api/donations', donationsRouter);
app.use('/api/prizes', prizesRouter);
app.use('/api/users', usersRouter);

// Static front-end
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
