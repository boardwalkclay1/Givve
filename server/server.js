import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import donationsRouter from './routes/donations.js';
import prizesRouter from './routes/prizes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/donations', donationsRouter);
app.use('/api/prizes', prizesRouter);

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
