import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  value: Number,
  winnerNumber: Number, // 10th, 20th, etc.
  status: { type: String, default: 'pending' }, // pending | won
  winnerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null }
}, { timestamps: true });

export default mongoose.model('Prize', prizeSchema);
