import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import pb from "./lib/pbClient.js";              // PocketBase client
import donationsRouter from "./routes/donations.js";
import prizesRouter from "./routes/prizes.js";

dotenv.config();

const app = express();

// CORS — lock to your frontend domain
app.use(
  cors({
    origin: process.env.PUBLIC_URL || "*",
  })
);

app.use(express.json());

// Resolve directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend
const publicPath = path.resolve(__dirname, "../public");

// Serve static frontend files
app.use(express.static(publicPath));

// API routes (PocketBase-powered)
app.use("/api/donations", donationsRouter);
app.use("/api/prizes", prizesRouter);

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Givve server running on port ${PORT}`);
});
