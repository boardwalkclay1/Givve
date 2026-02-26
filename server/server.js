import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import pb from "./lib/pbClient.js";
import donationsRouter from "./routes/donations.js";
import prizesRouter from "./routes/prizes.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

// CORS — lock to your real domain
app.use(
  cors({
    origin: process.env.PUBLIC_URL || "https://givve.store",
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

// API routes
app.use("/api/donations", donationsRouter);
app.use("/api/prizes", prizesRouter);
app.use("/api/auth", authRouter);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// PORT fix for Railway
const PORT = process.env.PORT || 3000;

// Startup logs
app.listen(PORT, () => {
  console.log(`Givve server running on port ${PORT}`);

  if (!process.env.POCKETBASE_URL) {
    console.warn("⚠️  Missing POCKETBASE_URL in .env");
  } else {
    console.log(`PocketBase connected at ${process.env.POCKETBASE_URL}`);
  }
});
