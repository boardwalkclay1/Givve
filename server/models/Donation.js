import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  amount: Number,
  tier: Number,
  paymentId: String,
  globalDonationIndex: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donation', donationSchema);
