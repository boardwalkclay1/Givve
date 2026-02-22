// scripts/updatePrizeState.js
const { loadDb, saveDb } = require('../lib/prizeStore');

function updatePrizeState(donorCount) {
  const db = loadDb();

  // Sort by triggerNumber ascending
  const prizes = db.prizes.sort((a, b) => a.triggerNumber - b.triggerNumber);

  // Mark prizes as won if donorCount reached/exceeded trigger
  for (const prize of prizes) {
    if (prize.status === 'won' || prize.status === 'retired') continue;
    if (donorCount >= prize.triggerNumber) {
      prize.status = 'won';
      prize.wonAtDonorCount = donorCount;
      prize.updatedAt = new Date().toISOString();
    }
  }

  // Activate the next pending prize (smallest trigger > donorCount)
  const nextActive = prizes.find(
    p => p.status === 'pending' && p.triggerNumber > donorCount
  );

  // Deactivate any previously active prize that shouldn't be
  for (const prize of prizes) {
    if (prize.status === 'active') {
      if (prize.triggerNumber <= donorCount) {
        prize.status = 'won';
        prize.updatedAt = new Date().toISOString();
      } else if (nextActive && prize.id !== nextActive.id) {
        prize.status = 'pending';
        prize.updatedAt = new Date().toISOString();
      }
    }
  }

  if (nextActive && nextActive.status === 'pending') {
    nextActive.status = 'active';
    nextActive.activatedAt = new Date().toISOString();
    nextActive.updatedAt = new Date().toISOString();
  }

  saveDb(db);
  console.log(`Updated prize state for donorCount=${donorCount}.`);
}

// Usage: node scripts/updatePrizeState.js 37
const donorCountArg = process.argv[2];
if (!donorCountArg) {
  console.error('Usage: node scripts/updatePrizeState.js <donorCount>');
  process.exit(1);
}
const donorCount = parseInt(donorCountArg, 10);
if (Number.isNaN(donorCount)) {
  console.error('donorCount must be a number');
  process.exit(1);
}

updatePrizeState(donorCount);
