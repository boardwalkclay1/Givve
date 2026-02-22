const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'prizes.db.json');
const SOURCE_PATH = path.join(__dirname, '..', 'data', 'prizes.source.json');

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadSourcePrizes() {
  return readJson(SOURCE_PATH, []);
}

function loadDb() {
  return readJson(DB_PATH, { lastUpdated: null, prizes: [] });
}

function saveDb(db) {
  db.lastUpdated = new Date().toISOString();
  writeJson(DB_PATH, db);
}

module.exports = {
  DB_PATH,
  SOURCE_PATH,
  loadSourcePrizes,
  loadDb,
  saveDb
};
