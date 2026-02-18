import express from 'express';
import Donation from '../models/Donation.js';
import Prize from '../models/Prize.js';
import User from '../models/User.js';

const router = express.Router();

// Create donation AFTER PayPal payment is confirmed on client
router.post('/', async (req, res) => {
  try {
    const { userId, amount, tier, paymentId } = req.body;

    // Count existing donations to get next index
    const count = await Donation.countDocuments({});
    const globalDonationIndex = count + 1;

    const donation = await Donation.create({
      userId: userId || null,
      amount,
      tier,
      paymentId,
      globalDonationIndex
    });

    // Update user totalDonated
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalDonated: amount }
      });
    }

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

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            wins: {
              prizeId: prize._id,
              donationId: donation._id,
              date: new Date()
            }
          }
        });
      }
    }

    res.json({ donation, isWinner, prize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Donation failed' });
  }
});

export default router;
