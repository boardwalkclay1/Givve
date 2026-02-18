import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  tier: Number,
  paymentId: String, // PayPal payment ID
  globalDonationIndex: Number, // 1,2,3...
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donation', donationSchema);
