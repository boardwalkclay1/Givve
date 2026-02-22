// scripts/loadPrizes.js
const {
  loadSourcePrizes,
  loadDb,
  saveDb
} = require('../lib/prizeStore');

function syncPrizes() {
  const sourcePrizes = loadSourcePrizes();
  const db = loadDb();

  const byId = new Map(db.prizes.map(p => [p.id, p]));

  // Add/update from source
  for (const src of sourcePrizes) {
    const existing = byId.get(src.id);
    if (!existing) {
      db.prizes.push({
        ...src,
        status: src.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      Object.assign(existing, {
        name: src.name,
        image: src.image,
        value: src.value,
        triggerNumber: src.triggerNumber,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Retire prizes removed from source
  const sourceIds = new Set(sourcePrizes.map(p => p.id));
  for (const prize of db.prizes) {
    if (!sourceIds.has(prize.id) && prize.status !== 'retired') {
      prize.status = 'retired';
      prize.updatedAt = new Date().toISOString();
    }
  }

  saveDb(db);
  console.log(`Synced ${sourcePrizes.length} prizes from source.`);
}

syncPrizes();
