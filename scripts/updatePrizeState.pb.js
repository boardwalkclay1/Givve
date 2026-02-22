// scripts/updatePrizeState.pb.js
const pb = require('../lib/pbClient');

async function updatePrizeState(donorCount) {
  const prizes = await pb.collection('prizes').getFullList({
    sort: 'triggerNumber',
  });

  // Mark won
  for (const prize of prizes) {
    if (['won', 'retired'].includes(prize.status)) continue;
    if (donorCount >= prize.triggerNumber) {
      await pb.collection('prizes').update(prize.id, {
        status: 'won',
        wonAtDonorCount: donorCount,
      });
    }
  }

  const refreshed = await pb.collection('prizes').getFullList({
    sort: 'triggerNumber',
  });

  const nextActive = refreshed.find(
    p => p.status === 'pending' && p.triggerNumber > donorCount
  );

  for (const prize of refreshed) {
    if (prize.status === 'active') {
      if (prize.triggerNumber <= donorCount) {
        await pb.collection('prizes').update(prize.id, { status: 'won' });
      } else if (nextActive && prize.id !== nextActive.id) {
        await pb.collection('prizes').update(prize.id, { status: 'pending' });
      }
    }
  }

  if (nextActive && nextActive.status === 'pending') {
    await pb.collection('prizes').update(nextActive.id, {
      status: 'active',
      activatedAt: new Date().toISOString(),
    });
  }

  console.log(`Updated PocketBase prize state for donorCount=${donorCount}`);
}

const donorCountArg = process.argv[2];
if (!donorCountArg) {
  console.error('Usage: node scripts/updatePrizeState.pb.js <donorCount>');
  process.exit(1);
}
const donorCount = parseInt(donorCountArg, 10);
if (Number.isNaN(donorCount)) {
  console.error('donorCount must be a number');
  process.exit(1);
}

updatePrizeState(donorCount).catch(err => {
  console.error(err);
  process.exit(1);
});
