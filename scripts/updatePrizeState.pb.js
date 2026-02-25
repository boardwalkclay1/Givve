// scripts/updatePrizeState.pb.js
import pb from "../lib/pbClient.js";

async function updatePrizeState(donorCount) {
  // Load prizes sorted by triggerNumber
  const prizes = await pb.collection("prizes").getFullList({
    sort: "triggerNumber",
  });

  // ----------------------
  // 1. Mark prizes as WON
  // ----------------------
  for (const prize of prizes) {
    if (["won", "retired"].includes(prize.status)) continue;

    if (donorCount >= prize.triggerNumber) {
      await pb.collection("prizes").update(prize.id, {
        status: "won",
        wonAtDonorCount: donorCount,
      });
    }
  }

  // Reload after updates
  const refreshed = await pb.collection("prizes").getFullList({
    sort: "triggerNumber",
  });

  // ----------------------
  // 2. Determine next ACTIVE prize
  // ----------------------
  const nextActive = refreshed.find(
    p => p.status === "pending" && p.triggerNumber > donorCount
  );

  // ----------------------
  // 3. Clean up ACTIVE states
  // ----------------------
  for (const prize of refreshed) {
    if (prize.status === "active") {
      if (prize.triggerNumber <= donorCount) {
        // Should be won
        await pb.collection("prizes").update(prize.id, { status: "won" });
      } else if (nextActive && prize.id !== nextActive.id) {
        // Should be pending
        await pb.collection("prizes").update(prize.id, { status: "pending" });
      }
    }
  }

  // ----------------------
  // 4. Activate next prize
  // ----------------------
  if (nextActive && nextActive.status === "pending") {
    await pb.collection("prizes").update(nextActive.id, {
      status: "active",
      activatedAt: new Date().toISOString(),
    });
  }

  console.log(`Updated PocketBase prize state for donorCount=${donorCount}`);
}

// ----------------------
// CLI ENTRY
// ----------------------
const donorCountArg = process.argv[2];

if (!donorCountArg) {
  console.error("Usage: node scripts/updatePrizeState.pb.js <donorCount>");
  process.exit(1);
}

const donorCount = parseInt(donorCountArg, 10);

if (Number.isNaN(donorCount)) {
  console.error("donorCount must be a number");
  process.exit(1);
}

updatePrizeState(donorCount).catch(err => {
  console.error(err);
  process.exit(1);
});
