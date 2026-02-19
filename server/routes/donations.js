import express from 'express';
import Donation from '../models/Donation.js';
import Prize from '../models/Prize.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, amount, tier, paymentId } = req.body;

    // Count existing donations to get next donor number
    const count = await Donation.countDocuments({});
    const globalDonationIndex = count + 1;

    // Create donation entry
    const donation = await Donation.create({
      userId: userId || null,
      amount,
      tier,
      paymentId,
      globalDonationIndex
    });

    // Check if this donation hits a prize trigger
    const prize = await Prize.findOne({
      winnerNumber: globalDonationIndex,
      status: 'pending'
    });

    let isWinner = false;

    if (prize) {
      isWinner = true;
      prize.status = 'won';
      prize.winnerUserId = userId || null;
      prize.donationId = donation._id;
      await prize.save();
    }

    res.json({
      donation,
      isWinner,
      prize: isWinner ? prize : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Donation failed' });
  }
});

export default router;
