// scripts/seedPrizes.js
const {
  loadSourcePrizes,
  saveDb
} = require('../lib/prizeStore');

function seedPrizes() {
  const sourcePrizes = loadSourcePrizes();

  const db = {
    lastUpdated: new Date().toISOString(),
    prizes: sourcePrizes.map(p => ({
      ...p,
      status: p.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  };

  saveDb(db);
  console.log(`Seeded ${db.prizes.length} prizes into prizes.db.json`);
}

seedPrizes();
