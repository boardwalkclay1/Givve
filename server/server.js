import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import pb from "./lib/pbClient.js";
import donationsRouter from "./routes/donations.js";
import prizesRouter from "./routes/prizes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.PUBLIC_URL || "*",
  })
);

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.resolve(__dirname, "../public");

app.use(express.static(publicPath));

app.use("/api/donations", donationsRouter);
app.use("/api/prizes", prizesRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Givve server running on port ${PORT}`);
});
